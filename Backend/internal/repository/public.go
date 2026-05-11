package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"math"
	"strings"

	"github.com/google/uuid"
	"github.com/irfanzuhdiabdillah/mdm-compro/backend/internal/model"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var (
	ErrConflict = errors.New("conflict")
	ErrNotFound = errors.New("not found")
)

type PublicRepository struct {
	pool *pgxpool.Pool
}

func NewPublicRepository(pool *pgxpool.Pool) PublicRepository {
	return PublicRepository{pool: pool}
}

func (r PublicRepository) Health(ctx context.Context) error {
	return r.pool.Ping(ctx)
}

func (r PublicRepository) Navigation(ctx context.Context) (model.Navigation, error) {
	services, err := r.ListContentTree(ctx, "services")
	if err != nil {
		return model.Navigation{}, err
	}
	products, err := r.ListContentTree(ctx, "products")
	if err != nil {
		return model.Navigation{}, err
	}
	return model.Navigation{Services: services, Products: products}, nil
}

func (r PublicRepository) PageByKey(ctx context.Context, key string) (model.Page, error) {
	row := r.pool.QueryRow(ctx, `
		SELECT p.id::text, p.page_key, p.title, p.content, p.status, p.published_at,
		       COALESCE(s.title, ''), COALESCE(s.description, ''), COALESCE(s.canonical_url, ''), COALESCE(s.no_index, false),
		       p.version
		FROM pages p
		LEFT JOIN seo_meta s ON s.entity_type = 'page' AND s.entity_id = p.id AND s.deleted_at IS NULL
		WHERE p.page_key = $1 AND p.deleted_at IS NULL AND p.status = 'published'
		  AND (p.published_at IS NULL OR p.published_at <= now())
	`, key)

	var page model.Page
	var content []byte
	var publishedAt sql.NullTime
	if err := row.Scan(&page.ID, &page.Key, &page.Title, &content, &page.Status, &publishedAt, &page.SEO.Title, &page.SEO.Description, &page.SEO.Canonical, &page.SEO.NoIndex, &page.Version); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Page{}, ErrNotFound
		}
		return model.Page{}, err
	}
	if publishedAt.Valid {
		page.PublishedAt = &publishedAt.Time
	}
	page.Content = json.RawMessage(content)
	return page, nil
}

func (r PublicRepository) ListContentTree(ctx context.Context, table string) ([]model.ContentNode, error) {
	items, err := r.listContent(ctx, table, "")
	if err != nil {
		return nil, err
	}
	return buildTree(items), nil
}

func (r PublicRepository) ContentByPath(ctx context.Context, table, fullPath string) (model.ContentNode, error) {
	items, err := r.listContent(ctx, table, strings.Trim(fullPath, "/"))
	if err != nil {
		return model.ContentNode{}, err
	}
	if len(items) == 0 {
		return model.ContentNode{}, ErrNotFound
	}
	return items[0], nil
}

func (r PublicRepository) listContent(ctx context.Context, table, fullPath string) ([]model.ContentNode, error) {
	if table != "services" && table != "products" {
		return nil, errors.New("invalid content table")
	}
	query := `
		SELECT c.id::text, c.parent_id::text, c.slug, c.full_path, c.title, c.summary, c.content,
		       COALESCE(c.image_url, ''), c.gallery, c.status, c.published_at, c.sort_order, c.depth,
		       COALESCE(s.title, ''), COALESCE(s.description, ''), COALESCE(s.canonical_url, ''), COALESCE(s.no_index, false)`
	if table == "products" {
		query += `, c.specs`
	} else {
		query += `, '{}'::jsonb`
	}
	query += ` FROM ` + table + ` c
		LEFT JOIN seo_meta s ON s.entity_type = $1 AND s.entity_id = c.id AND s.deleted_at IS NULL
		WHERE c.deleted_at IS NULL AND c.status = 'published'
		  AND (c.published_at IS NULL OR c.published_at <= now())`
	args := []any{strings.TrimSuffix(table, "s")}
	if fullPath != "" {
		query += ` AND c.full_path = $2`
		args = append(args, fullPath)
	}
	query += ` ORDER BY c.depth ASC, c.sort_order ASC, c.title ASC`

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []model.ContentNode
	for rows.Next() {
		var item model.ContentNode
		var parentID sql.NullString
		var content, galleryBytes, specsBytes []byte
		var publishedAt sql.NullTime
		if err := rows.Scan(&item.ID, &parentID, &item.Slug, &item.FullPath, &item.Title, &item.Summary, &content, &item.ImageURL, &galleryBytes, &item.Status, &publishedAt, &item.SortOrder, &item.Depth, &item.SEO.Title, &item.SEO.Description, &item.SEO.Canonical, &item.SEO.NoIndex, &specsBytes); err != nil {
			return nil, err
		}
		if parentID.Valid {
			item.ParentID = &parentID.String
		}
		if publishedAt.Valid {
			item.PublishedAt = &publishedAt.Time
		}
		item.Content = json.RawMessage(content)
		_ = json.Unmarshal(galleryBytes, &item.Gallery)
		_ = json.Unmarshal(specsBytes, &item.Specs)
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r PublicRepository) ListNews(ctx context.Context, page, perPage int, category string) (model.ListResponse[model.NewsItem], error) {
	page, perPage, offset := normalizePagination(page, perPage)
	query := `
		SELECT n.id::text, n.slug, n.title, n.excerpt, n.body, COALESCE(c.name, ''), COALESCE(n.featured_image_url, ''),
		       n.featured, n.status, n.published_at, n.scheduled_at,
		       COALESCE(s.title, ''), COALESCE(s.description, ''), COALESCE(s.canonical_url, ''), COALESCE(s.no_index, false),
		       n.version, COUNT(*) OVER()
		FROM news n
		LEFT JOIN news_categories c ON c.id = n.category_id
		LEFT JOIN seo_meta s ON s.entity_type = 'news' AND s.entity_id = n.id AND s.deleted_at IS NULL
		WHERE n.deleted_at IS NULL AND n.status = 'published'
		  AND (n.published_at IS NULL OR n.published_at <= now())
		  AND ($1 = '' OR c.slug = $1)
		ORDER BY n.featured DESC, n.published_at DESC NULLS LAST, n.created_at DESC
		LIMIT $2 OFFSET $3`

	rows, err := r.pool.Query(ctx, query, category, perPage, offset)
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

func (r PublicRepository) NewsBySlug(ctx context.Context, slug string) (model.NewsItem, error) {
	row := r.pool.QueryRow(ctx, `
		SELECT n.id::text, n.slug, n.title, n.excerpt, n.body, COALESCE(c.name, ''), COALESCE(n.featured_image_url, ''),
		       n.featured, n.status, n.published_at, n.scheduled_at,
		       COALESCE(s.title, ''), COALESCE(s.description, ''), COALESCE(s.canonical_url, ''), COALESCE(s.no_index, false),
		       n.version, 1
		FROM news n
		LEFT JOIN news_categories c ON c.id = n.category_id
		LEFT JOIN seo_meta s ON s.entity_type = 'news' AND s.entity_id = n.id AND s.deleted_at IS NULL
		WHERE n.slug = $1 AND n.deleted_at IS NULL AND n.status = 'published'
		  AND (n.published_at IS NULL OR n.published_at <= now())
	`, slug)
	item, _, err := scanNews(row)
	if errors.Is(err, pgx.ErrNoRows) {
		return model.NewsItem{}, ErrNotFound
	}
	return item, err
}

func (r PublicRepository) ListCareers(ctx context.Context, page, perPage int, department string) (model.ListResponse[model.Career], error) {
	page, perPage, offset := normalizePagination(page, perPage)
	rows, err := r.pool.Query(ctx, `
		SELECT id::text, slug, title, summary, description, department, location, employment_type, COALESCE(apply_url, ''),
		       deadline, status, published_at, version, COUNT(*) OVER()
		FROM careers
		WHERE deleted_at IS NULL AND status = 'published'
		  AND (published_at IS NULL OR published_at <= now())
		  AND ($1 = '' OR department = $1)
		ORDER BY published_at DESC NULLS LAST, created_at DESC
		LIMIT $2 OFFSET $3
	`, department, perPage, offset)
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

func (r PublicRepository) CareerBySlug(ctx context.Context, slug string) (model.Career, error) {
	row := r.pool.QueryRow(ctx, `
		SELECT id::text, slug, title, summary, description, department, location, employment_type, COALESCE(apply_url, ''),
		       deadline, status, published_at, version, 1
		FROM careers
		WHERE slug = $1 AND deleted_at IS NULL AND status = 'published'
		  AND (published_at IS NULL OR published_at <= now())
	`, slug)
	item, _, err := scanCareer(row)
	if errors.Is(err, pgx.ErrNoRows) {
		return model.Career{}, ErrNotFound
	}
	return item, err
}

func (r PublicRepository) CreateContact(ctx context.Context, input model.ContactInput) (model.ContactInquiry, error) {
	var inquiry model.ContactInquiry
	err := r.pool.QueryRow(ctx, `
		INSERT INTO contacts (id, name, email, phone, company, subject, message, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, 'new')
		RETURNING id::text, name, email, COALESCE(phone, ''), COALESCE(company, ''), subject, message, status, created_at
	`, uuid.NewString(), input.Name, input.Email, input.Phone, input.Company, input.Subject, input.Message).
		Scan(&inquiry.ID, &inquiry.Name, &inquiry.Email, &inquiry.Phone, &inquiry.Company, &inquiry.Subject, &inquiry.Message, &inquiry.Status, &inquiry.CreatedAt)
	return inquiry, err
}

func buildTree(items []model.ContentNode) []model.ContentNode {
	byID := map[string]*model.ContentNode{}
	for i := range items {
		items[i].Children = []model.ContentNode{}
		byID[items[i].ID] = &items[i]
	}
	var roots []model.ContentNode
	for i := range items {
		item := &items[i]
		if item.ParentID == nil {
			roots = append(roots, *item)
			continue
		}
		if parent, ok := byID[*item.ParentID]; ok {
			parent.Children = append(parent.Children, *item)
		}
	}
	return roots
}

type rowScanner interface {
	Scan(dest ...any) error
}

func scanNews(row rowScanner) (model.NewsItem, int, error) {
	var item model.NewsItem
	var body []byte
	var publishedAt, scheduledAt sql.NullTime
	var total int
	err := row.Scan(&item.ID, &item.Slug, &item.Title, &item.Excerpt, &body, &item.Category, &item.FeaturedImageURL, &item.Featured, &item.Status, &publishedAt, &scheduledAt, &item.SEO.Title, &item.SEO.Description, &item.SEO.Canonical, &item.SEO.NoIndex, &item.Version, &total)
	if err != nil {
		return model.NewsItem{}, 0, err
	}
	if publishedAt.Valid {
		item.PublishedAt = &publishedAt.Time
	}
	if scheduledAt.Valid {
		item.ScheduledAt = &scheduledAt.Time
	}
	item.Body = json.RawMessage(body)
	return item, total, nil
}

func scanCareer(row rowScanner) (model.Career, int, error) {
	var item model.Career
	var description []byte
	var deadline, publishedAt sql.NullTime
	var total int
	err := row.Scan(&item.ID, &item.Slug, &item.Title, &item.Summary, &description, &item.Department, &item.Location, &item.EmploymentType, &item.ApplyURL, &deadline, &item.Status, &publishedAt, &item.Version, &total)
	if err != nil {
		return model.Career{}, 0, err
	}
	if deadline.Valid {
		item.Deadline = &deadline.Time
	}
	if publishedAt.Valid {
		item.PublishedAt = &publishedAt.Time
	}
	item.Description = json.RawMessage(description)
	return item, total, nil
}

func normalizePagination(page, perPage int) (int, int, int) {
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 10
	}
	return page, perPage, (page - 1) * perPage
}

func totalPages(total, perPage int) int {
	if total == 0 {
		return 0
	}
	return int(math.Ceil(float64(total) / float64(perPage)))
}
