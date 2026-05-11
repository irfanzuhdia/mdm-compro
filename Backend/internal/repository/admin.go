package repository

import (
	"context"

	"github.com/irfanzuhdiabdillah/mdm-compro/backend/internal/model"
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
