package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"

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

func (r AdminRepository) ListPages(ctx context.Context, page, perPage int) (model.ListResponse[model.Page], error) {
	page, perPage, offset := normalizePagination(page, perPage)
	rows, err := r.pool.Query(ctx, `
		SELECT p.id::text, p.page_key, p.title, p.content, p.status, p.published_at,
		       COALESCE(s.title, ''), COALESCE(s.description, ''), COALESCE(s.canonical_url, ''), COALESCE(s.no_index, false),
		       p.version, COUNT(*) OVER()
		FROM pages p
		LEFT JOIN seo_meta s ON s.entity_type = 'page' AND s.entity_id = p.id AND s.deleted_at IS NULL
		WHERE p.deleted_at IS NULL
		ORDER BY p.updated_at DESC, p.title ASC
		LIMIT $1 OFFSET $2
	`, perPage, offset)
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
	row := r.pool.QueryRow(ctx, `
		UPDATE pages
		SET title = $2,
		    content = $3,
		    status = $4,
		    published_at = $5,
		    updated_at = now(),
		    version = version + 1
		WHERE id = $1 AND version = $6 AND deleted_at IS NULL
		RETURNING id::text, page_key, title, content, status, published_at,
		          ''::text, ''::text, ''::text, false, version, 1
	`, id, input.Title, input.Content, input.Status, input.PublishedAt, input.Version)

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
	return item, err
}

func (r AdminRepository) pageExists(ctx context.Context, id string) (bool, error) {
	var exists bool
	err := r.pool.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM pages WHERE id = $1 AND deleted_at IS NULL)`, id).Scan(&exists)
	return exists, err
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
