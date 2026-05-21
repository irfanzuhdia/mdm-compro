package service

import (
	"context"
	"encoding/json"
	"strings"
	"time"

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

func (s AdminService) Pages(ctx context.Context, page, perPage int, search, status string) (model.ListResponse[model.Page], error) {
	search = strings.TrimSpace(search)
	status = strings.TrimSpace(status)
	if status != "" && !validStatus(status) {
		status = ""
	}
	return s.repo.ListPages(ctx, page, perPage, search, status)
}

func (s AdminService) Page(ctx context.Context, id string) (model.Page, error) {
	return s.repo.PageByID(ctx, id)
}

func (s AdminService) CreatePage(ctx context.Context, input model.PageCreateInput) (model.Page, error) {
	input.Key = strings.TrimSpace(input.Key)
	input.Title = strings.TrimSpace(input.Title)
	input.Status = strings.TrimSpace(input.Status)
	input.SEO = cleanSEO(input.SEO)

	v := validator.New()
	if !validator.Slug(input.Key) {
		v = v.Add("key", "Page slug must use lowercase letters, numbers, and hyphens.")
	}
	if !validator.Required(input.Title) {
		v = v.Add("title", "Title is required.")
	}
	if !validStatus(input.Status) {
		v = v.Add("status", "Status must be draft, published, scheduled, or archived.")
	}
	if len(input.Content) == 0 {
		input.Content = json.RawMessage(`{"blocks":[]}`)
	}
	if !json.Valid(input.Content) {
		v = v.Add("content", "Content must be valid JSON.")
	}
	input.PublishedAt = normalizePublishedAt(input.Status, input.PublishedAt)
	if v.HasErrors() {
		return model.Page{}, v
	}
	return s.repo.CreatePage(ctx, input)
}

func (s AdminService) UpdatePage(ctx context.Context, id string, input model.PageInput) (model.Page, error) {
	input.Key = strings.TrimSpace(input.Key)
	input.Title = strings.TrimSpace(input.Title)
	input.Status = strings.TrimSpace(input.Status)
	input.SEO = cleanSEO(input.SEO)
	v := validator.New()
	if !validator.Slug(input.Key) {
		v = v.Add("key", "Page slug must use lowercase letters, numbers, and hyphens.")
	}
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
	input.PublishedAt = normalizePublishedAt(input.Status, input.PublishedAt)
	if v.HasErrors() {
		return model.Page{}, v
	}
	return s.repo.UpdatePage(ctx, id, input)
}

func (s AdminService) DeletePage(ctx context.Context, id string, version int) error {
	if version < 1 {
		return validator.New().Add("version", "A valid version is required.")
	}
	return s.repo.DeletePage(ctx, id, version)
}

func (s AdminService) Content(ctx context.Context, table string, page, perPage int, search, status string) (model.ListResponse[model.ContentNode], error) {
	search = strings.TrimSpace(search)
	status = strings.TrimSpace(status)
	if status != "" && !validStatus(status) {
		status = ""
	}
	return s.repo.ListContent(ctx, table, page, perPage, search, status)
}

func (s AdminService) ContentItem(ctx context.Context, table, id string) (model.ContentNode, error) {
	return s.repo.ContentByID(ctx, table, id)
}

func (s AdminService) CreateContent(ctx context.Context, table string, input model.ContentNodeInput) (model.ContentNode, error) {
	input = normalizeContentInput(input)
	v := validateContentInput(input, false)
	if v.HasErrors() {
		return model.ContentNode{}, v
	}
	return s.repo.CreateContent(ctx, table, input)
}

func (s AdminService) UpdateContent(ctx context.Context, table, id string, input model.ContentNodeInput) (model.ContentNode, error) {
	input = normalizeContentInput(input)
	v := validateContentInput(input, true)
	if v.HasErrors() {
		return model.ContentNode{}, v
	}
	return s.repo.UpdateContent(ctx, table, id, input)
}

func (s AdminService) DeleteContent(ctx context.Context, table, id string, version int) error {
	if version < 1 {
		return validator.New().Add("version", "A valid version is required.")
	}
	return s.repo.DeleteContent(ctx, table, id, version)
}

func (s AdminService) News(ctx context.Context, page, perPage int, search, status string) (model.ListResponse[model.NewsItem], error) {
	search = strings.TrimSpace(search)
	status = strings.TrimSpace(status)
	if status != "" && !validStatus(status) {
		status = ""
	}
	return s.repo.ListNews(ctx, page, perPage, search, status)
}

func (s AdminService) NewsItem(ctx context.Context, id string) (model.NewsItem, error) {
	return s.repo.NewsByID(ctx, id)
}

func (s AdminService) CreateNews(ctx context.Context, input model.NewsInput) (model.NewsItem, error) {
	input = normalizeNewsInput(input)
	v := validateNewsInput(input, false)
	if v.HasErrors() {
		return model.NewsItem{}, v
	}
	return s.repo.CreateNews(ctx, input)
}

func (s AdminService) UpdateNews(ctx context.Context, id string, input model.NewsInput) (model.NewsItem, error) {
	input = normalizeNewsInput(input)
	v := validateNewsInput(input, true)
	if v.HasErrors() {
		return model.NewsItem{}, v
	}
	return s.repo.UpdateNews(ctx, id, input)
}

func (s AdminService) DeleteNews(ctx context.Context, id string, version int) error {
	if version < 1 {
		return validator.New().Add("version", "A valid version is required.")
	}
	return s.repo.DeleteNews(ctx, id, version)
}

func (s AdminService) Careers(ctx context.Context, page, perPage int, search, status string) (model.ListResponse[model.Career], error) {
	search = strings.TrimSpace(search)
	status = strings.TrimSpace(status)
	if status != "" && !validStatus(status) {
		status = ""
	}
	return s.repo.ListCareers(ctx, page, perPage, search, status)
}

func (s AdminService) Career(ctx context.Context, id string) (model.Career, error) {
	return s.repo.CareerByID(ctx, id)
}

func (s AdminService) CreateCareer(ctx context.Context, input model.CareerInput) (model.Career, error) {
	input = normalizeCareerInput(input)
	v := validateCareerInput(input, false)
	if v.HasErrors() {
		return model.Career{}, v
	}
	return s.repo.CreateCareer(ctx, input)
}

func (s AdminService) UpdateCareer(ctx context.Context, id string, input model.CareerInput) (model.Career, error) {
	input = normalizeCareerInput(input)
	v := validateCareerInput(input, true)
	if v.HasErrors() {
		return model.Career{}, v
	}
	return s.repo.UpdateCareer(ctx, id, input)
}

func (s AdminService) DeleteCareer(ctx context.Context, id string, version int) error {
	if version < 1 {
		return validator.New().Add("version", "A valid version is required.")
	}
	return s.repo.DeleteCareer(ctx, id, version)
}

func validStatus(status string) bool {
	switch status {
	case "draft", "published", "scheduled", "archived":
		return true
	default:
		return false
	}
}

func normalizePublishedAt(status string, value *time.Time) *time.Time {
	if status == "published" && value == nil {
		now := time.Now().UTC()
		return &now
	}
	if status != "published" && status != "scheduled" {
		return nil
	}
	return value
}

func cleanSEO(seo model.SEO) model.SEO {
	seo.Title = strings.TrimSpace(seo.Title)
	seo.Description = strings.TrimSpace(seo.Description)
	seo.Canonical = strings.TrimSpace(seo.Canonical)
	return seo
}

func normalizeContentInput(input model.ContentNodeInput) model.ContentNodeInput {
	input.Slug = strings.TrimSpace(input.Slug)
	input.Title = strings.TrimSpace(input.Title)
	input.Summary = strings.TrimSpace(input.Summary)
	input.ImageURL = strings.TrimSpace(input.ImageURL)
	input.DatasheetURL = strings.TrimSpace(input.DatasheetURL)
	input.Status = strings.TrimSpace(input.Status)
	input.SEO = cleanSEO(input.SEO)
	if len(input.Content) == 0 {
		input.Content = json.RawMessage(`{"blocks":[]}`)
	}
	input.PublishedAt = normalizePublishedAt(input.Status, input.PublishedAt)
	cleanSpecs := map[string]string{}
	for key, value := range input.Specs {
		key = strings.TrimSpace(key)
		value = strings.TrimSpace(value)
		if key != "" && value != "" {
			cleanSpecs[key] = value
		}
	}
	input.Specs = cleanSpecs
	return input
}

func validateContentInput(input model.ContentNodeInput, requireVersion bool) validator.ValidationError {
	v := validator.New()
	if !validator.Slug(input.Slug) {
		v = v.Add("slug", "Slug must use lowercase letters, numbers, and hyphens.")
	}
	if !validator.Required(input.Title) {
		v = v.Add("title", "Title is required.")
	}
	if !validStatus(input.Status) {
		v = v.Add("status", "Status must be draft, published, scheduled, or archived.")
	}
	if !json.Valid(input.Content) {
		v = v.Add("content", "Content must be valid JSON.")
	}
	if requireVersion && input.Version < 1 {
		v = v.Add("version", "A valid version is required.")
	}
	return v
}

func normalizeNewsInput(input model.NewsInput) model.NewsInput {
	input.Slug = strings.TrimSpace(input.Slug)
	input.Title = strings.TrimSpace(input.Title)
	input.Excerpt = strings.TrimSpace(input.Excerpt)
	input.Category = strings.TrimSpace(input.Category)
	input.FeaturedImageURL = strings.TrimSpace(input.FeaturedImageURL)
	input.Status = strings.TrimSpace(input.Status)
	input.SEO = cleanSEO(input.SEO)
	if len(input.Body) == 0 {
		input.Body = json.RawMessage(`{"blocks":[]}`)
	}
	input.PublishedAt = normalizePublishedAt(input.Status, input.PublishedAt)
	if input.Status != "scheduled" {
		input.ScheduledAt = nil
	}
	return input
}

func validateNewsInput(input model.NewsInput, requireVersion bool) validator.ValidationError {
	v := validator.New()
	if !validator.Slug(input.Slug) {
		v = v.Add("slug", "Slug must use lowercase letters, numbers, and hyphens.")
	}
	if !validator.Required(input.Title) {
		v = v.Add("title", "Title is required.")
	}
	if !validStatus(input.Status) {
		v = v.Add("status", "Status must be draft, published, scheduled, or archived.")
	}
	if !json.Valid(input.Body) {
		v = v.Add("body", "Body must be valid JSON.")
	}
	if requireVersion && input.Version < 1 {
		v = v.Add("version", "A valid version is required.")
	}
	return v
}

func normalizeCareerInput(input model.CareerInput) model.CareerInput {
	input.Slug = strings.TrimSpace(input.Slug)
	input.Title = strings.TrimSpace(input.Title)
	input.Summary = strings.TrimSpace(input.Summary)
	input.Department = strings.TrimSpace(input.Department)
	input.Location = strings.TrimSpace(input.Location)
	input.EmploymentType = strings.TrimSpace(input.EmploymentType)
	input.ApplyURL = strings.TrimSpace(input.ApplyURL)
	input.Status = strings.TrimSpace(input.Status)
	input.SEO = cleanSEO(input.SEO)
	if input.EmploymentType == "" {
		input.EmploymentType = "full_time"
	}
	if len(input.Description) == 0 {
		input.Description = json.RawMessage(`{"blocks":[]}`)
	}
	input.PublishedAt = normalizePublishedAt(input.Status, input.PublishedAt)
	return input
}

func validateCareerInput(input model.CareerInput, requireVersion bool) validator.ValidationError {
	v := validator.New()
	if !validator.Slug(input.Slug) {
		v = v.Add("slug", "Slug must use lowercase letters, numbers, and hyphens.")
	}
	if !validator.Required(input.Title) {
		v = v.Add("title", "Title is required.")
	}
	if !validator.Required(input.Department) {
		v = v.Add("department", "Department is required.")
	}
	if !validator.Required(input.Location) {
		v = v.Add("location", "Location is required.")
	}
	if !validEmploymentType(input.EmploymentType) {
		v = v.Add("employmentType", "Employment type is invalid.")
	}
	if !validStatus(input.Status) {
		v = v.Add("status", "Status must be draft, published, scheduled, or archived.")
	}
	if !json.Valid(input.Description) {
		v = v.Add("description", "Description must be valid JSON.")
	}
	if requireVersion && input.Version < 1 {
		v = v.Add("version", "A valid version is required.")
	}
	return v
}

func validEmploymentType(value string) bool {
	switch value {
	case "full_time", "contract", "internship", "part_time":
		return true
	default:
		return false
	}
}
