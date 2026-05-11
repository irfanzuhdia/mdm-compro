package service

import (
	"context"
	"encoding/json"
	"strings"

	"github.com/irfanzuhdiabdillah/mdm-compro/backend/internal/model"
	"github.com/irfanzuhdiabdillah/mdm-compro/backend/internal/repository"
	"github.com/irfanzuhdiabdillah/mdm-compro/backend/internal/validator"
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

func (s AdminService) Pages(ctx context.Context, page, perPage int) (model.ListResponse[model.Page], error) {
	return s.repo.ListPages(ctx, page, perPage)
}

func (s AdminService) Page(ctx context.Context, id string) (model.Page, error) {
	return s.repo.PageByID(ctx, id)
}

func (s AdminService) UpdatePage(ctx context.Context, id string, input model.PageInput) (model.Page, error) {
	input.Title = strings.TrimSpace(input.Title)
	input.Status = strings.TrimSpace(input.Status)
	v := validator.New()
	if !validator.Required(input.Title) {
		v = v.Add("title", "Title is required.")
	}
	if !validStatus(input.Status) {
		v = v.Add("status", "Status must be draft, published, scheduled, or archived.")
	}
	if input.Version < 1 {
		v = v.Add("version", "A valid version is required.")
	}
	if len(input.Content) == 0 {
		input.Content = json.RawMessage(`{}`)
	}
	if !json.Valid(input.Content) {
		v = v.Add("content", "Content must be valid JSON.")
	}
	if v.HasErrors() {
		return model.Page{}, v
	}
	return s.repo.UpdatePage(ctx, id, input)
}

func validStatus(status string) bool {
	switch status {
	case "draft", "published", "scheduled", "archived":
		return true
	default:
		return false
	}
}
