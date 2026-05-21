package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"strings"

	"github.com/google/uuid"
	"github.com/irfanzuhdiabdillah/mdm-compro/backend/internal/model"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type AdminRepository struct {
	pool *pgxpool.Pool
}

func NewAdminRepository(pool *pgxpool.Pool) AdminRepository {
	return AdminRepository{pool: pool}
}

func (r AdminRepository) DashboardCounts(ctx context.Context) (map[string]int, error) {
	tables := []string{"users", "pages", "services", "products", "news", "careers", "media", "contacts"}
	counts := make(map[string]int, len(tables))
	for _, table := range tables {
		var total int
		// Table names are controlled by the static allow-list above, not request input.
		if err := r.pool.QueryRow(ctx, `SELECT COUNT(*) FROM `+table+` WHERE deleted_at IS NULL`).Scan(&total); err != nil {
			return nil, err
		}
		counts[table] = total
	}
	return counts, nil
}

func (r AdminRepository) ListContacts(ctx context.Context, limit int) ([]model.ContactInquiry, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id::text, name, email, COALESCE(phone, ''), COALESCE(company, ''), subject, message, status, created_at
		FROM contacts
		WHERE deleted_at IS NULL
		ORDER BY created_at DESC
		LIMIT $1
	`, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var contacts []model.ContactInquiry
	for rows.Next() {
		var item model.ContactInquiry
		if err := rows.Scan(&item.ID, &item.Name, &item.Email, &item.Phone, &item.Company, &item.Subject, &item.Message, &item.Status, &item.CreatedAt); err != nil {
			return nil, err
		}
		contacts = append(contacts, item)
	}
	return contacts, rows.Err()
}

func (r AdminRepository) ListPages(ctx context.Context, page, perPage int, search, status string) (model.ListResponse[model.Page], error) {
	page, perPage, offset := normalizePagination(page, perPage)
	rows, err := r.pool.Query(ctx, `
		SELECT p.id::text, p.page_key, p.title, p.content, p.status, p.published_at,
		       COALESCE(s.title, ''), COALESCE(s.description, ''), COALESCE(s.canonical_url, ''), COALESCE(s.no_index, false),
		       p.version, COUNT(*) OVER()
		FROM pages p
		LEFT JOIN seo_meta s ON s.entity_type = 'page' AND s.entity_id = p.id AND s.deleted_at IS NULL
		WHERE p.deleted_at IS NULL
		  AND ($3 = '' OR p.status = $3)
		  AND ($4 = '' OR p.title ILIKE '%' || $4 || '%' OR p.page_key ILIKE '%' || $4 || '%')
		ORDER BY p.updated_at DESC, p.title ASC
		LIMIT $1 OFFSET $2
	`, perPage, offset, status, search)
	if err != nil {
		return model.ListResponse[model.Page]{}, err
	}
	defer rows.Close()

	var total int
	var data []model.Page
	for rows.Next() {
		item, rowTotal, err := scanAdminPage(rows)
		if err != nil {
			return model.ListResponse[model.Page]{}, err
		}
		total = rowTotal
		data = append(data, item)
	}

	return model.ListResponse[model.Page]{
		Data: data,
		Pagination: model.Pagination{
			Page:       page,
			PerPage:    perPage,
			Total:      total,
			TotalPages: totalPages(total, perPage),
		},
	}, rows.Err()
}

func (r AdminRepository) CreatePage(ctx context.Context, input model.PageCreateInput) (model.Page, error) {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return model.Page{}, err
	}
	defer tx.Rollback(ctx)

	id := uuid.NewString()
	_, err = tx.Exec(ctx, `
		INSERT INTO pages (id, page_key, title, content, status, published_at)
		VALUES ($1, $2, $3, $4, $5, $6)
	`, id, input.Key, input.Title, input.Content, input.Status, input.PublishedAt)
	if err != nil {
		if isUniqueViolation(err) {
			return model.Page{}, ErrConflict
		}
		return model.Page{}, err
	}
	if err := upsertPageSEO(ctx, tx, id, input.SEO); err != nil {
		return model.Page{}, err
	}
	if err := tx.Commit(ctx); err != nil {
		return model.Page{}, err
	}
	return r.PageByID(ctx, id)
}

func (r AdminRepository) PageByID(ctx context.Context, id string) (model.Page, error) {
	row := r.pool.QueryRow(ctx, `
		SELECT p.id::text, p.page_key, p.title, p.content, p.status, p.published_at,
		       COALESCE(s.title, ''), COALESCE(s.description, ''), COALESCE(s.canonical_url, ''), COALESCE(s.no_index, false),
		       p.version, 1
		FROM pages p
		LEFT JOIN seo_meta s ON s.entity_type = 'page' AND s.entity_id = p.id AND s.deleted_at IS NULL
		WHERE p.id = $1 AND p.deleted_at IS NULL
	`, id)
	item, _, err := scanAdminPage(row)
	if errors.Is(err, pgx.ErrNoRows) {
		return model.Page{}, ErrNotFound
	}
	return item, err
}

func (r AdminRepository) UpdatePage(ctx context.Context, id string, input model.PageInput) (model.Page, error) {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return model.Page{}, err
	}
	defer tx.Rollback(ctx)

	row := tx.QueryRow(ctx, `
		UPDATE pages
		SET page_key = $2,
		    title = $3,
		    content = $4,
		    status = $5,
		    published_at = $6,
		    updated_at = now(),
		    version = version + 1
		WHERE id = $1 AND version = $7 AND deleted_at IS NULL
		RETURNING id::text, page_key, title, content, status, published_at,
		          ''::text, ''::text, ''::text, false, version, 1
	`, id, input.Key, input.Title, input.Content, input.Status, input.PublishedAt, input.Version)

	item, _, err := scanAdminPage(row)
	if errors.Is(err, pgx.ErrNoRows) {
		exists, lookupErr := r.pageExists(ctx, id)
		if lookupErr != nil {
			return model.Page{}, lookupErr
		}
		if exists {
			return model.Page{}, ErrConflict
		}
		return model.Page{}, ErrNotFound
	}
	if err != nil {
		if isUniqueViolation(err) {
			return model.Page{}, ErrConflict
		}
		return model.Page{}, err
	}
	if err := upsertPageSEO(ctx, tx, item.ID, input.SEO); err != nil {
		return model.Page{}, err
	}
	if err := tx.Commit(ctx); err != nil {
		return model.Page{}, err
	}
	return r.PageByID(ctx, item.ID)
}

func (r AdminRepository) DeletePage(ctx context.Context, id string, version int) error {
	result, err := r.pool.Exec(ctx, `
		UPDATE pages
		SET deleted_at = now(), updated_at = now(), version = version + 1
		WHERE id = $1 AND version = $2 AND deleted_at IS NULL
	`, id, version)
	if err != nil {
		return err
	}
	if result.RowsAffected() > 0 {
		return nil
	}
	exists, err := r.pageExists(ctx, id)
	if err != nil {
		return err
	}
	if exists {
		return ErrConflict
	}
	return ErrNotFound
}

func (r AdminRepository) ListContent(ctx context.Context, table string, page, perPage int, search, status string) (model.ListResponse[model.ContentNode], error) {
	cfg, ok := contentConfig(table)
	if !ok {
		return model.ListResponse[model.ContentNode]{}, errors.New("invalid content table")
	}

	page, perPage, offset := normalizePagination(page, perPage)
	query := `
		SELECT c.id::text, c.parent_id::text, c.slug, c.full_path, c.title, COALESCE(c.summary, ''), c.content,
		       COALESCE(c.image_url, ''), c.gallery, c.status, c.published_at, c.sort_order, c.depth,
		       COALESCE(s.title, ''), COALESCE(s.description, ''), COALESCE(s.canonical_url, ''), COALESCE(s.no_index, false),
		       c.version`
	if cfg.hasProductFields {
		query += `, COALESCE(c.datasheet_url, ''), c.specs`
	} else {
		query += `, ''::text, '{}'::jsonb`
	}
	query += `, COUNT(*) OVER()
		FROM ` + cfg.table + ` c
		LEFT JOIN seo_meta s ON s.entity_type = $1 AND s.entity_id = c.id AND s.deleted_at IS NULL
		WHERE c.deleted_at IS NULL
		  AND ($4 = '' OR c.status = $4)
		  AND ($5 = '' OR c.title ILIKE '%' || $5 || '%' OR c.slug ILIKE '%' || $5 || '%' OR c.full_path ILIKE '%' || $5 || '%')
		ORDER BY c.sort_order ASC, c.updated_at DESC, c.title ASC
		LIMIT $2 OFFSET $3`

	rows, err := r.pool.Query(ctx, query, cfg.entityType, perPage, offset, status, search)
	if err != nil {
		return model.ListResponse[model.ContentNode]{}, err
	}
	defer rows.Close()

	var total int
	var data []model.ContentNode
	for rows.Next() {
		item, rowTotal, err := scanAdminContent(rows)
		if err != nil {
			return model.ListResponse[model.ContentNode]{}, err
		}
		total = rowTotal
		data = append(data, item)
	}

	return model.ListResponse[model.ContentNode]{
		Data: data,
		Pagination: model.Pagination{
			Page:       page,
			PerPage:    perPage,
			Total:      total,
			TotalPages: totalPages(total, perPage),
		},
	}, rows.Err()
}

func (r AdminRepository) ContentByID(ctx context.Context, table, id string) (model.ContentNode, error) {
	cfg, ok := contentConfig(table)
	if !ok {
		return model.ContentNode{}, errors.New("invalid content table")
	}
	query := `
		SELECT c.id::text, c.parent_id::text, c.slug, c.full_path, c.title, COALESCE(c.summary, ''), c.content,
		       COALESCE(c.image_url, ''), c.gallery, c.status, c.published_at, c.sort_order, c.depth,
		       COALESCE(s.title, ''), COALESCE(s.description, ''), COALESCE(s.canonical_url, ''), COALESCE(s.no_index, false),
		       c.version`
	if cfg.hasProductFields {
		query += `, COALESCE(c.datasheet_url, ''), c.specs`
	} else {
		query += `, ''::text, '{}'::jsonb`
	}
	query += `, 1
		FROM ` + cfg.table + ` c
		LEFT JOIN seo_meta s ON s.entity_type = $1 AND s.entity_id = c.id AND s.deleted_at IS NULL
		WHERE c.id = $2 AND c.deleted_at IS NULL`

	item, _, err := scanAdminContent(r.pool.QueryRow(ctx, query, cfg.entityType, id))
	if errors.Is(err, pgx.ErrNoRows) {
		return model.ContentNode{}, ErrNotFound
	}
	return item, err
}

func (r AdminRepository) CreateContent(ctx context.Context, table string, input model.ContentNodeInput) (model.ContentNode, error) {
	cfg, ok := contentConfig(table)
	if !ok {
		return model.ContentNode{}, errors.New("invalid content table")
	}
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return model.ContentNode{}, err
	}
	defer tx.Rollback(ctx)

	fullPath, depth, err := r.contentPath(ctx, tx, cfg.table, input.ParentID, input.Slug)
	if err != nil {
		return model.ContentNode{}, err
	}
	id := uuid.NewString()
	gallery := input.Gallery
	if gallery == nil {
		gallery = []model.MediaAsset{}
	}
	specs := input.Specs
	if specs == nil {
		specs = map[string]string{}
	}

	if cfg.hasProductFields {
		_, err = tx.Exec(ctx, `
			INSERT INTO products (id, parent_id, slug, full_path, title, summary, content, specs, datasheet_url, image_url, gallery, status, published_at, sort_order, depth)
			VALUES ($1, $2, $3, $4, $5, NULLIF($6, ''), $7, $8, NULLIF($9, ''), NULLIF($10, ''), $11, $12, $13, $14, $15)
		`, id, nullableString(input.ParentID), input.Slug, fullPath, input.Title, input.Summary, input.Content, specs, input.DatasheetURL, input.ImageURL, gallery, input.Status, input.PublishedAt, input.SortOrder, depth)
	} else {
		_, err = tx.Exec(ctx, `
			INSERT INTO services (id, parent_id, slug, full_path, title, summary, content, image_url, gallery, status, published_at, sort_order, depth)
			VALUES ($1, $2, $3, $4, $5, NULLIF($6, ''), $7, NULLIF($8, ''), $9, $10, $11, $12, $13)
		`, id, nullableString(input.ParentID), input.Slug, fullPath, input.Title, input.Summary, input.Content, input.ImageURL, gallery, input.Status, input.PublishedAt, input.SortOrder, depth)
	}
	if err != nil {
		if isUniqueViolation(err) {
			return model.ContentNode{}, ErrConflict
		}
		return model.ContentNode{}, err
	}
	if err := upsertSEO(ctx, tx, cfg.entityType, id, input.SEO); err != nil {
		return model.ContentNode{}, err
	}
	if err := tx.Commit(ctx); err != nil {
		return model.ContentNode{}, err
	}
	return r.ContentByID(ctx, cfg.table, id)
}

func (r AdminRepository) UpdateContent(ctx context.Context, table, id string, input model.ContentNodeInput) (model.ContentNode, error) {
	cfg, ok := contentConfig(table)
	if !ok {
		return model.ContentNode{}, errors.New("invalid content table")
	}
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return model.ContentNode{}, err
	}
	defer tx.Rollback(ctx)

	fullPath, depth, err := r.contentPath(ctx, tx, cfg.table, input.ParentID, input.Slug)
	if err != nil {
		return model.ContentNode{}, err
	}
	gallery := input.Gallery
	if gallery == nil {
		gallery = []model.MediaAsset{}
	}
	specs := input.Specs
	if specs == nil {
		specs = map[string]string{}
	}

	var row pgx.Row
	if cfg.hasProductFields {
		row = tx.QueryRow(ctx, `
			UPDATE products
			SET parent_id = $2, slug = $3, full_path = $4, title = $5, summary = NULLIF($6, ''),
			    content = $7, specs = $8, datasheet_url = NULLIF($9, ''), image_url = NULLIF($10, ''),
			    gallery = $11, status = $12, published_at = $13, sort_order = $14, depth = $15,
			    updated_at = now(), version = version + 1
			WHERE id = $1 AND version = $16 AND deleted_at IS NULL
			RETURNING id::text, parent_id::text, slug, full_path, title, COALESCE(summary, ''), content,
			          COALESCE(image_url, ''), gallery, status, published_at, sort_order, depth,
			          ''::text, ''::text, ''::text, false, version, COALESCE(datasheet_url, ''), specs, 1
		`, id, nullableString(input.ParentID), input.Slug, fullPath, input.Title, input.Summary, input.Content, specs, input.DatasheetURL, input.ImageURL, gallery, input.Status, input.PublishedAt, input.SortOrder, depth, input.Version)
	} else {
		row = tx.QueryRow(ctx, `
			UPDATE services
			SET parent_id = $2, slug = $3, full_path = $4, title = $5, summary = NULLIF($6, ''),
			    content = $7, image_url = NULLIF($8, ''), gallery = $9, status = $10,
			    published_at = $11, sort_order = $12, depth = $13,
			    updated_at = now(), version = version + 1
			WHERE id = $1 AND version = $14 AND deleted_at IS NULL
			RETURNING id::text, parent_id::text, slug, full_path, title, COALESCE(summary, ''), content,
			          COALESCE(image_url, ''), gallery, status, published_at, sort_order, depth,
			          ''::text, ''::text, ''::text, false, version, ''::text, '{}'::jsonb, 1
		`, id, nullableString(input.ParentID), input.Slug, fullPath, input.Title, input.Summary, input.Content, input.ImageURL, gallery, input.Status, input.PublishedAt, input.SortOrder, depth, input.Version)
	}

	item, _, err := scanAdminContent(row)
	if errors.Is(err, pgx.ErrNoRows) {
		exists, lookupErr := r.contentExists(ctx, cfg.table, id)
		if lookupErr != nil {
			return model.ContentNode{}, lookupErr
		}
		if exists {
			return model.ContentNode{}, ErrConflict
		}
		return model.ContentNode{}, ErrNotFound
	}
	if err != nil {
		if isUniqueViolation(err) {
			return model.ContentNode{}, ErrConflict
		}
		return model.ContentNode{}, err
	}
	if err := upsertSEO(ctx, tx, cfg.entityType, item.ID, input.SEO); err != nil {
		return model.ContentNode{}, err
	}
	if err := tx.Commit(ctx); err != nil {
		return model.ContentNode{}, err
	}
	return r.ContentByID(ctx, cfg.table, item.ID)
}

func (r AdminRepository) DeleteContent(ctx context.Context, table, id string, version int) error {
	cfg, ok := contentConfig(table)
	if !ok {
		return errors.New("invalid content table")
	}
	result, err := r.pool.Exec(ctx, `
		UPDATE `+cfg.table+`
		SET deleted_at = now(), updated_at = now(), version = version + 1
		WHERE id = $1 AND version = $2 AND deleted_at IS NULL
	`, id, version)
	if err != nil {
		return err
	}
	if result.RowsAffected() > 0 {
		return nil
	}
	exists, err := r.contentExists(ctx, cfg.table, id)
	if err != nil {
		return err
	}
	if exists {
		return ErrConflict
	}
	return ErrNotFound
}

func (r AdminRepository) ListNews(ctx context.Context, page, perPage int, search, status string) (model.ListResponse[model.NewsItem], error) {
	page, perPage, offset := normalizePagination(page, perPage)
	rows, err := r.pool.Query(ctx, `
		SELECT n.id::text, n.slug, n.title, COALESCE(n.excerpt, ''), n.body, COALESCE(c.name, ''), COALESCE(n.featured_image_url, ''),
		       n.featured, n.status, n.published_at, n.scheduled_at,
		       COALESCE(s.title, ''), COALESCE(s.description, ''), COALESCE(s.canonical_url, ''), COALESCE(s.no_index, false),
		       n.version, COUNT(*) OVER()
		FROM news n
		LEFT JOIN news_categories c ON c.id = n.category_id AND c.deleted_at IS NULL
		LEFT JOIN seo_meta s ON s.entity_type = 'news' AND s.entity_id = n.id AND s.deleted_at IS NULL
		WHERE n.deleted_at IS NULL
		  AND ($3 = '' OR n.status = $3)
		  AND ($4 = '' OR n.title ILIKE '%' || $4 || '%' OR n.slug ILIKE '%' || $4 || '%' OR n.excerpt ILIKE '%' || $4 || '%')
		ORDER BY n.updated_at DESC, n.published_at DESC NULLS LAST, n.title ASC
		LIMIT $1 OFFSET $2
	`, perPage, offset, status, search)
	if err != nil {
		return model.ListResponse[model.NewsItem]{}, err
	}
	defer rows.Close()

	var total int
	var data []model.NewsItem
	for rows.Next() {
		item, rowTotal, err := scanNews(rows)
		if err != nil {
			return model.ListResponse[model.NewsItem]{}, err
		}
		total = rowTotal
		data = append(data, item)
	}
	return model.ListResponse[model.NewsItem]{
		Data: data,
		Pagination: model.Pagination{
			Page:       page,
			PerPage:    perPage,
			Total:      total,
			TotalPages: totalPages(total, perPage),
		},
	}, rows.Err()
}

func (r AdminRepository) NewsByID(ctx context.Context, id string) (model.NewsItem, error) {
	row := r.pool.QueryRow(ctx, `
		SELECT n.id::text, n.slug, n.title, COALESCE(n.excerpt, ''), n.body, COALESCE(c.name, ''), COALESCE(n.featured_image_url, ''),
		       n.featured, n.status, n.published_at, n.scheduled_at,
		       COALESCE(s.title, ''), COALESCE(s.description, ''), COALESCE(s.canonical_url, ''), COALESCE(s.no_index, false),
		       n.version, 1
		FROM news n
		LEFT JOIN news_categories c ON c.id = n.category_id AND c.deleted_at IS NULL
		LEFT JOIN seo_meta s ON s.entity_type = 'news' AND s.entity_id = n.id AND s.deleted_at IS NULL
		WHERE n.id = $1 AND n.deleted_at IS NULL
	`, id)
	item, _, err := scanNews(row)
	if errors.Is(err, pgx.ErrNoRows) {
		return model.NewsItem{}, ErrNotFound
	}
	return item, err
}

func (r AdminRepository) CreateNews(ctx context.Context, input model.NewsInput) (model.NewsItem, error) {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return model.NewsItem{}, err
	}
	defer tx.Rollback(ctx)

	categoryID, err := r.newsCategoryID(ctx, tx, input.Category)
	if err != nil {
		return model.NewsItem{}, err
	}
	id := uuid.NewString()
	_, err = tx.Exec(ctx, `
		INSERT INTO news (id, category_id, slug, title, excerpt, body, featured_image_url, featured, status, published_at, scheduled_at)
		VALUES ($1, $2, $3, $4, NULLIF($5, ''), $6, NULLIF($7, ''), $8, $9, $10, $11)
	`, id, categoryID, input.Slug, input.Title, input.Excerpt, input.Body, input.FeaturedImageURL, input.Featured, input.Status, input.PublishedAt, input.ScheduledAt)
	if err != nil {
		if isUniqueViolation(err) {
			return model.NewsItem{}, ErrConflict
		}
		return model.NewsItem{}, err
	}
	if err := upsertSEO(ctx, tx, "news", id, input.SEO); err != nil {
		return model.NewsItem{}, err
	}
	if err := tx.Commit(ctx); err != nil {
		return model.NewsItem{}, err
	}
	return r.NewsByID(ctx, id)
}

func (r AdminRepository) UpdateNews(ctx context.Context, id string, input model.NewsInput) (model.NewsItem, error) {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return model.NewsItem{}, err
	}
	defer tx.Rollback(ctx)

	categoryID, err := r.newsCategoryID(ctx, tx, input.Category)
	if err != nil {
		return model.NewsItem{}, err
	}
	row := tx.QueryRow(ctx, `
		UPDATE news
		SET category_id = $2, slug = $3, title = $4, excerpt = NULLIF($5, ''), body = $6,
		    featured_image_url = NULLIF($7, ''), featured = $8, status = $9, published_at = $10,
		    scheduled_at = $11, updated_at = now(), version = version + 1
		WHERE id = $1 AND version = $12 AND deleted_at IS NULL
		RETURNING id::text, slug, title, COALESCE(excerpt, ''), body, ''::text, COALESCE(featured_image_url, ''),
		          featured, status, published_at, scheduled_at, ''::text, ''::text, ''::text, false, version, 1
	`, id, categoryID, input.Slug, input.Title, input.Excerpt, input.Body, input.FeaturedImageURL, input.Featured, input.Status, input.PublishedAt, input.ScheduledAt, input.Version)

	item, _, err := scanNews(row)
	if errors.Is(err, pgx.ErrNoRows) {
		exists, lookupErr := r.newsExists(ctx, id)
		if lookupErr != nil {
			return model.NewsItem{}, lookupErr
		}
		if exists {
			return model.NewsItem{}, ErrConflict
		}
		return model.NewsItem{}, ErrNotFound
	}
	if err != nil {
		if isUniqueViolation(err) {
			return model.NewsItem{}, ErrConflict
		}
		return model.NewsItem{}, err
	}
	if err := upsertSEO(ctx, tx, "news", item.ID, input.SEO); err != nil {
		return model.NewsItem{}, err
	}
	if err := tx.Commit(ctx); err != nil {
		return model.NewsItem{}, err
	}
	return r.NewsByID(ctx, item.ID)
}

func (r AdminRepository) DeleteNews(ctx context.Context, id string, version int) error {
	result, err := r.pool.Exec(ctx, `
		UPDATE news
		SET deleted_at = now(), updated_at = now(), version = version + 1
		WHERE id = $1 AND version = $2 AND deleted_at IS NULL
	`, id, version)
	if err != nil {
		return err
	}
	if result.RowsAffected() > 0 {
		return nil
	}
	exists, err := r.newsExists(ctx, id)
	if err != nil {
		return err
	}
	if exists {
		return ErrConflict
	}
	return ErrNotFound
}

func (r AdminRepository) ListCareers(ctx context.Context, page, perPage int, search, status string) (model.ListResponse[model.Career], error) {
	page, perPage, offset := normalizePagination(page, perPage)
	rows, err := r.pool.Query(ctx, `
		SELECT id::text, slug, title, COALESCE(summary, ''), description, department, location, employment_type, COALESCE(apply_url, ''),
		       deadline, status, published_at, version, COUNT(*) OVER()
		FROM careers
		WHERE deleted_at IS NULL
		  AND ($3 = '' OR status = $3)
		  AND ($4 = '' OR title ILIKE '%' || $4 || '%' OR slug ILIKE '%' || $4 || '%' OR summary ILIKE '%' || $4 || '%' OR department ILIKE '%' || $4 || '%')
		ORDER BY updated_at DESC, published_at DESC NULLS LAST, title ASC
		LIMIT $1 OFFSET $2
	`, perPage, offset, status, search)
	if err != nil {
		return model.ListResponse[model.Career]{}, err
	}
	defer rows.Close()

	var total int
	var data []model.Career
	for rows.Next() {
		item, rowTotal, err := scanCareer(rows)
		if err != nil {
			return model.ListResponse[model.Career]{}, err
		}
		total = rowTotal
		data = append(data, item)
	}
	return model.ListResponse[model.Career]{
		Data: data,
		Pagination: model.Pagination{
			Page:       page,
			PerPage:    perPage,
			Total:      total,
			TotalPages: totalPages(total, perPage),
		},
	}, rows.Err()
}

func (r AdminRepository) CareerByID(ctx context.Context, id string) (model.Career, error) {
	row := r.pool.QueryRow(ctx, `
		SELECT id::text, slug, title, COALESCE(summary, ''), description, department, location, employment_type, COALESCE(apply_url, ''),
		       deadline, status, published_at, version, 1
		FROM careers
		WHERE id = $1 AND deleted_at IS NULL
	`, id)
	item, _, err := scanCareer(row)
	if errors.Is(err, pgx.ErrNoRows) {
		return model.Career{}, ErrNotFound
	}
	return item, err
}

func (r AdminRepository) CreateCareer(ctx context.Context, input model.CareerInput) (model.Career, error) {
	id := uuid.NewString()
	_, err := r.pool.Exec(ctx, `
		INSERT INTO careers (id, slug, title, summary, description, department, location, employment_type, apply_url, deadline, status, published_at)
		VALUES ($1, $2, $3, NULLIF($4, ''), $5, $6, $7, $8, NULLIF($9, ''), $10, $11, $12)
	`, id, input.Slug, input.Title, input.Summary, input.Description, input.Department, input.Location, input.EmploymentType, input.ApplyURL, input.Deadline, input.Status, input.PublishedAt)
	if err != nil {
		if isUniqueViolation(err) {
			return model.Career{}, ErrConflict
		}
		return model.Career{}, err
	}
	return r.CareerByID(ctx, id)
}

func (r AdminRepository) UpdateCareer(ctx context.Context, id string, input model.CareerInput) (model.Career, error) {
	row := r.pool.QueryRow(ctx, `
		UPDATE careers
		SET slug = $2, title = $3, summary = NULLIF($4, ''), description = $5, department = $6,
		    location = $7, employment_type = $8, apply_url = NULLIF($9, ''), deadline = $10,
		    status = $11, published_at = $12, updated_at = now(), version = version + 1
		WHERE id = $1 AND version = $13 AND deleted_at IS NULL
		RETURNING id::text, slug, title, COALESCE(summary, ''), description, department, location, employment_type, COALESCE(apply_url, ''),
		          deadline, status, published_at, version, 1
	`, id, input.Slug, input.Title, input.Summary, input.Description, input.Department, input.Location, input.EmploymentType, input.ApplyURL, input.Deadline, input.Status, input.PublishedAt, input.Version)
	item, _, err := scanCareer(row)
	if errors.Is(err, pgx.ErrNoRows) {
		exists, lookupErr := r.careerExists(ctx, id)
		if lookupErr != nil {
			return model.Career{}, lookupErr
		}
		if exists {
			return model.Career{}, ErrConflict
		}
		return model.Career{}, ErrNotFound
	}
	if err != nil {
		if isUniqueViolation(err) {
			return model.Career{}, ErrConflict
		}
		return model.Career{}, err
	}
	return item, nil
}

func (r AdminRepository) DeleteCareer(ctx context.Context, id string, version int) error {
	result, err := r.pool.Exec(ctx, `
		UPDATE careers
		SET deleted_at = now(), updated_at = now(), version = version + 1
		WHERE id = $1 AND version = $2 AND deleted_at IS NULL
	`, id, version)
	if err != nil {
		return err
	}
	if result.RowsAffected() > 0 {
		return nil
	}
	exists, err := r.careerExists(ctx, id)
	if err != nil {
		return err
	}
	if exists {
		return ErrConflict
	}
	return ErrNotFound
}

func (r AdminRepository) pageExists(ctx context.Context, id string) (bool, error) {
	var exists bool
	err := r.pool.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM pages WHERE id = $1 AND deleted_at IS NULL)`, id).Scan(&exists)
	return exists, err
}

func (r AdminRepository) contentExists(ctx context.Context, table, id string) (bool, error) {
	cfg, ok := contentConfig(table)
	if !ok {
		return false, errors.New("invalid content table")
	}
	var exists bool
	err := r.pool.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM `+cfg.table+` WHERE id = $1 AND deleted_at IS NULL)`, id).Scan(&exists)
	return exists, err
}

func (r AdminRepository) newsExists(ctx context.Context, id string) (bool, error) {
	var exists bool
	err := r.pool.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM news WHERE id = $1 AND deleted_at IS NULL)`, id).Scan(&exists)
	return exists, err
}

func (r AdminRepository) careerExists(ctx context.Context, id string) (bool, error) {
	var exists bool
	err := r.pool.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM careers WHERE id = $1 AND deleted_at IS NULL)`, id).Scan(&exists)
	return exists, err
}

func (r AdminRepository) contentPath(ctx context.Context, tx pgx.Tx, table string, parentID *string, slug string) (string, int, error) {
	if parentID == nil || strings.TrimSpace(*parentID) == "" {
		return slug, 0, nil
	}

	var parentPath string
	var parentDepth int
	err := tx.QueryRow(ctx, `SELECT full_path, depth FROM `+table+` WHERE id = $1 AND deleted_at IS NULL`, strings.TrimSpace(*parentID)).Scan(&parentPath, &parentDepth)
	if errors.Is(err, pgx.ErrNoRows) {
		return "", 0, ErrNotFound
	}
	if err != nil {
		return "", 0, err
	}
	return strings.Trim(parentPath, "/") + "/" + slug, parentDepth + 1, nil
}

func (r AdminRepository) newsCategoryID(ctx context.Context, tx pgx.Tx, name string) (*string, error) {
	name = strings.TrimSpace(name)
	if name == "" {
		return nil, nil
	}
	slug := slugifyText(name)
	if slug == "" {
		return nil, nil
	}
	id := uuid.NewString()
	err := tx.QueryRow(ctx, `
		INSERT INTO news_categories (id, name, slug)
		VALUES ($1, $2, $3)
		ON CONFLICT (slug) WHERE deleted_at IS NULL
		DO UPDATE SET name = EXCLUDED.name, updated_at = now()
		RETURNING id::text
	`, id, name, slug).Scan(&id)
	if err != nil {
		return nil, err
	}
	return &id, nil
}

func scanAdminPage(row rowScanner) (model.Page, int, error) {
	var page model.Page
	var content []byte
	var publishedAt sql.NullTime
	var total int
	err := row.Scan(
		&page.ID,
		&page.Key,
		&page.Title,
		&content,
		&page.Status,
		&publishedAt,
		&page.SEO.Title,
		&page.SEO.Description,
		&page.SEO.Canonical,
		&page.SEO.NoIndex,
		&page.Version,
		&total,
	)
	if err != nil {
		return model.Page{}, 0, err
	}
	if publishedAt.Valid {
		page.PublishedAt = &publishedAt.Time
	}
	if len(content) == 0 || !json.Valid(content) {
		page.Content = json.RawMessage(`{}`)
	} else {
		page.Content = json.RawMessage(content)
	}
	return page, total, nil
}

func scanAdminContent(row rowScanner) (model.ContentNode, int, error) {
	var item model.ContentNode
	var parentID sql.NullString
	var content, galleryBytes, specsBytes []byte
	var publishedAt sql.NullTime
	var total int
	err := row.Scan(
		&item.ID,
		&parentID,
		&item.Slug,
		&item.FullPath,
		&item.Title,
		&item.Summary,
		&content,
		&item.ImageURL,
		&galleryBytes,
		&item.Status,
		&publishedAt,
		&item.SortOrder,
		&item.Depth,
		&item.SEO.Title,
		&item.SEO.Description,
		&item.SEO.Canonical,
		&item.SEO.NoIndex,
		&item.Version,
		&item.DatasheetURL,
		&specsBytes,
		&total,
	)
	if err != nil {
		return model.ContentNode{}, 0, err
	}
	if parentID.Valid {
		item.ParentID = &parentID.String
	}
	if publishedAt.Valid {
		item.PublishedAt = &publishedAt.Time
	}
	if len(content) == 0 || !json.Valid(content) {
		item.Content = json.RawMessage(`{"blocks":[]}`)
	} else {
		item.Content = json.RawMessage(content)
	}
	_ = json.Unmarshal(galleryBytes, &item.Gallery)
	_ = json.Unmarshal(specsBytes, &item.Specs)
	if item.Gallery == nil {
		item.Gallery = []model.MediaAsset{}
	}
	if item.Specs == nil {
		item.Specs = map[string]string{}
	}
	return item, total, nil
}

func upsertPageSEO(ctx context.Context, tx pgx.Tx, pageID string, seo model.SEO) error {
	return upsertSEO(ctx, tx, "page", pageID, seo)
}

func upsertSEO(ctx context.Context, tx pgx.Tx, entityType, entityID string, seo model.SEO) error {
	_, err := tx.Exec(ctx, `
		INSERT INTO seo_meta (entity_type, entity_id, title, description, canonical_url, no_index)
		VALUES ($1, $2, $3, $4, $5, $6)
		ON CONFLICT (entity_type, entity_id) WHERE deleted_at IS NULL
		DO UPDATE SET
			title = EXCLUDED.title,
			description = EXCLUDED.description,
			canonical_url = EXCLUDED.canonical_url,
			no_index = EXCLUDED.no_index,
			updated_at = now()
	`, entityType, entityID, seo.Title, seo.Description, seo.Canonical, seo.NoIndex)
	return err
}

type adminContentConfig struct {
	table            string
	entityType       string
	hasProductFields bool
}

func contentConfig(table string) (adminContentConfig, bool) {
	switch table {
	case "services":
		return adminContentConfig{table: "services", entityType: "service"}, true
	case "products":
		return adminContentConfig{table: "products", entityType: "product", hasProductFields: true}, true
	default:
		return adminContentConfig{}, false
	}
}

func nullableString(value *string) any {
	if value == nil || strings.TrimSpace(*value) == "" {
		return nil
	}
	return strings.TrimSpace(*value)
}

func isUniqueViolation(err error) bool {
	return err != nil && strings.Contains(err.Error(), "SQLSTATE 23505")
}

func slugifyText(value string) string {
	value = strings.ToLower(strings.TrimSpace(value))
	var builder strings.Builder
	lastHyphen := false
	for _, r := range value {
		isAlnum := (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9')
		if isAlnum {
			builder.WriteRune(r)
			lastHyphen = false
			continue
		}
		if builder.Len() > 0 && !lastHyphen {
			builder.WriteByte('-')
			lastHyphen = true
		}
	}
	return strings.Trim(builder.String(), "-")
}
