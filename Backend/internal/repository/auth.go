package repository

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/irfanzuhdiabdillah/mdm-compro/backend/internal/model"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type AuthRepository struct {
	pool *pgxpool.Pool
}

func NewAuthRepository(pool *pgxpool.Pool) AuthRepository {
	return AuthRepository{pool: pool}
}

func (r AuthRepository) UserByEmail(ctx context.Context, email string) (model.User, error) {
	row := r.pool.QueryRow(ctx, `
		SELECT u.id::text, u.email, u.name, u.password_hash, u.is_active, u.created_at,
		       COALESCE(array_agg(DISTINCT p.code) FILTER (WHERE p.code IS NOT NULL), '{}')
		FROM users u
		LEFT JOIN user_roles ur ON ur.user_id = u.id
		LEFT JOIN roles ro ON ro.id = ur.role_id AND ro.deleted_at IS NULL
		LEFT JOIN role_permissions rp ON rp.role_id = ro.id
		LEFT JOIN permissions p ON p.id = rp.permission_id
		WHERE lower(u.email) = lower($1) AND u.deleted_at IS NULL
		GROUP BY u.id
	`, email)

	var user model.User
	if err := row.Scan(&user.ID, &user.Email, &user.Name, &user.PasswordHash, &user.IsActive, &user.CreatedAt, &user.Permissions); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.User{}, ErrNotFound
		}
		return model.User{}, err
	}
	return user, nil
}

func (r AuthRepository) StoreRefreshToken(ctx context.Context, userID, token string, expiresAt time.Time) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at)
		VALUES ($1, $2, $3, $4)
	`, uuid.NewString(), userID, hashToken(token), expiresAt)
	return err
}

func (r AuthRepository) RefreshTokenUser(ctx context.Context, token string) (model.User, error) {
	row := r.pool.QueryRow(ctx, `
		SELECT u.id::text, u.email, u.name, u.password_hash, u.is_active, u.created_at,
		       COALESCE(array_agg(DISTINCT p.code) FILTER (WHERE p.code IS NOT NULL), '{}')
		FROM refresh_tokens rt
		JOIN users u ON u.id = rt.user_id AND u.deleted_at IS NULL
		LEFT JOIN user_roles ur ON ur.user_id = u.id
		LEFT JOIN roles ro ON ro.id = ur.role_id AND ro.deleted_at IS NULL
		LEFT JOIN role_permissions rp ON rp.role_id = ro.id
		LEFT JOIN permissions p ON p.id = rp.permission_id
		WHERE rt.token_hash = $1 AND rt.revoked_at IS NULL AND rt.expires_at > now()
		GROUP BY u.id
	`, hashToken(token))

	var user model.User
	if err := row.Scan(&user.ID, &user.Email, &user.Name, &user.PasswordHash, &user.IsActive, &user.CreatedAt, &user.Permissions); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.User{}, ErrNotFound
		}
		return model.User{}, err
	}
	return user, nil
}

func (r AuthRepository) RevokeRefreshToken(ctx context.Context, token string) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE refresh_tokens
		SET revoked_at = now()
		WHERE token_hash = $1 AND revoked_at IS NULL
	`, hashToken(token))
	return err
}

func hashToken(token string) string {
	sum := sha256.Sum256([]byte(token))
	return hex.EncodeToString(sum[:])
}
