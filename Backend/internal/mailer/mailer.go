package mailer

import (
	"context"
	"log/slog"

	"github.com/irfanzuhdiabdillah/mdm-compro/backend/internal/model"
)

type Mailer struct {
	logger *slog.Logger
}

func New(logger *slog.Logger) Mailer {
	return Mailer{logger: logger}
}

func (m Mailer) NotifyContact(ctx context.Context, inquiry model.ContactInquiry) error {
	// SMTP integration is intentionally isolated here so contact intake can commit
	// before email delivery; production can swap this for a queue-backed sender.
	m.logger.InfoContext(ctx, "contact inquiry notification queued", "contactId", inquiry.ID, "email", inquiry.Email)
	return nil
}
