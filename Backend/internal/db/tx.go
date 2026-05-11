package db

import (
	"context"

	"github.com/jackc/pgx/v5"
)

// InTx centralizes commit/rollback so service methods can compose several
// repository calls without duplicating transaction error handling.
func InTx(ctx context.Context, tx pgx.Tx, fn func(pgx.Tx) error) error {
	if err := fn(tx); err != nil {
		_ = tx.Rollback(ctx)
		return err
	}
	return tx.Commit(ctx)
}
