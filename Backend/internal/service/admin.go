package service

import (
	"context"

	"github.com/irfanzuhdiabdillah/mdm-compro/backend/internal/model"
	"github.com/irfanzuhdiabdillah/mdm-compro/backend/internal/repository"
)

type AdminService struct {
	repo repository.AdminRepository
}

func NewAdminService(repo repository.AdminRepository) AdminService {
	return AdminService{repo: repo}
}

func (s AdminService) Dashboard(ctx context.Context) (map[string]int, error) {
	return s.repo.DashboardCounts(ctx)
}

func (s AdminService) RecentContacts(ctx context.Context) ([]model.ContactInquiry, error) {
	return s.repo.ListContacts(ctx, 25)
}
