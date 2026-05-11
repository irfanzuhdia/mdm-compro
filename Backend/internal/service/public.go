package service

import (
	"context"
	"strings"

	"github.com/irfanzuhdiabdillah/mdm-compro/backend/internal/model"
	"github.com/irfanzuhdiabdillah/mdm-compro/backend/internal/repository"
	"github.com/irfanzuhdiabdillah/mdm-compro/backend/internal/validator"
)

type PublicService struct {
	repo repository.PublicRepository
}

func NewPublicService(repo repository.PublicRepository) PublicService {
	return PublicService{repo: repo}
}

func (s PublicService) Navigation(ctx context.Context) (model.Navigation, error) {
	return s.repo.Navigation(ctx)
}

func (s PublicService) Page(ctx context.Context, key string) (model.Page, error) {
	return s.repo.PageByKey(ctx, key)
}

func (s PublicService) Services(ctx context.Context) ([]model.ContentNode, error) {
	return s.repo.ListContentTree(ctx, "services")
}

func (s PublicService) Service(ctx context.Context, path string) (model.ContentNode, error) {
	return s.repo.ContentByPath(ctx, "services", path)
}

func (s PublicService) Products(ctx context.Context) ([]model.ContentNode, error) {
	return s.repo.ListContentTree(ctx, "products")
}

func (s PublicService) Product(ctx context.Context, path string) (model.ContentNode, error) {
	return s.repo.ContentByPath(ctx, "products", path)
}

func (s PublicService) News(ctx context.Context, page, perPage int, category string) (model.ListResponse[model.NewsItem], error) {
	return s.repo.ListNews(ctx, page, perPage, category)
}

func (s PublicService) NewsItem(ctx context.Context, slug string) (model.NewsItem, error) {
	return s.repo.NewsBySlug(ctx, slug)
}

func (s PublicService) Careers(ctx context.Context, page, perPage int, department string) (model.ListResponse[model.Career], error) {
	return s.repo.ListCareers(ctx, page, perPage, department)
}

func (s PublicService) Career(ctx context.Context, slug string) (model.Career, error) {
	return s.repo.CareerBySlug(ctx, slug)
}

func (s PublicService) CreateContact(ctx context.Context, input model.ContactInput) (model.ContactInquiry, error) {
	v := validator.New()
	input.Name = strings.TrimSpace(input.Name)
	input.Email = strings.TrimSpace(input.Email)
	input.Subject = strings.TrimSpace(input.Subject)
	input.Message = strings.TrimSpace(input.Message)
	if !validator.Required(input.Name) {
		v = v.Add("name", "Name is required.")
	}
	if !validator.Email(input.Email) {
		v = v.Add("email", "A valid email is required.")
	}
	if !validator.Required(input.Subject) {
		v = v.Add("subject", "Subject is required.")
	}
	if !validator.Required(input.Message) {
		v = v.Add("message", "Message is required.")
	}
	if v.HasErrors() {
		return model.ContactInquiry{}, v
	}
	return s.repo.CreateContact(ctx, input)
}
