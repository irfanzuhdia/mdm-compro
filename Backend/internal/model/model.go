package model

import (
	"encoding/json"
	"time"
)

type SEO struct {
	Title       string `json:"title,omitempty"`
	Description string `json:"description,omitempty"`
	Canonical   string `json:"canonical,omitempty"`
	NoIndex     bool   `json:"noIndex,omitempty"`
}

type MediaAsset struct {
	ID       string `json:"id,omitempty"`
	URL      string `json:"url"`
	AltText  string `json:"altText,omitempty"`
	MimeType string `json:"mimeType,omitempty"`
}

type Navigation struct {
	Services []ContentNode `json:"services"`
	Products []ContentNode `json:"products"`
}

type ContentNode struct {
	ID          string            `json:"id"`
	ParentID    *string           `json:"parentId,omitempty"`
	Slug        string            `json:"slug"`
	FullPath    string            `json:"fullPath"`
	Title       string            `json:"title"`
	Summary     string            `json:"summary,omitempty"`
	Content     json.RawMessage   `json:"content,omitempty"`
	ImageURL    string            `json:"imageUrl,omitempty"`
	Gallery     []MediaAsset      `json:"gallery,omitempty"`
	Specs       map[string]string `json:"specs,omitempty"`
	Status      string            `json:"status"`
	PublishedAt *time.Time        `json:"publishedAt,omitempty"`
	SortOrder   int               `json:"sortOrder"`
	Depth       int               `json:"depth"`
	SEO         SEO               `json:"seo"`
	Children    []ContentNode     `json:"children,omitempty"`
}

type Page struct {
	ID          string          `json:"id"`
	Key         string          `json:"key"`
	Title       string          `json:"title"`
	Content     json.RawMessage `json:"content"`
	Status      string          `json:"status"`
	PublishedAt *time.Time      `json:"publishedAt,omitempty"`
	SEO         SEO             `json:"seo"`
	Version     int             `json:"version"`
}

type PageInput struct {
	Title       string          `json:"title"`
	Content     json.RawMessage `json:"content"`
	Status      string          `json:"status"`
	PublishedAt *time.Time      `json:"publishedAt"`
	Version     int             `json:"version"`
}

type NewsItem struct {
	ID               string          `json:"id"`
	Slug             string          `json:"slug"`
	Title            string          `json:"title"`
	Excerpt          string          `json:"excerpt,omitempty"`
	Body             json.RawMessage `json:"body,omitempty"`
	Category         string          `json:"category,omitempty"`
	Tags             []string        `json:"tags,omitempty"`
	FeaturedImageURL string          `json:"featuredImageUrl,omitempty"`
	Featured         bool            `json:"featured"`
	Status           string          `json:"status"`
	PublishedAt      *time.Time      `json:"publishedAt,omitempty"`
	ScheduledAt      *time.Time      `json:"scheduledAt,omitempty"`
	SEO              SEO             `json:"seo"`
	Version          int             `json:"version"`
}

type Career struct {
	ID             string          `json:"id"`
	Slug           string          `json:"slug"`
	Title          string          `json:"title"`
	Summary        string          `json:"summary,omitempty"`
	Description    json.RawMessage `json:"description,omitempty"`
	Department     string          `json:"department"`
	Location       string          `json:"location"`
	EmploymentType string          `json:"employmentType"`
	ApplyURL       string          `json:"applyUrl,omitempty"`
	Deadline       *time.Time      `json:"deadline,omitempty"`
	Status         string          `json:"status"`
	PublishedAt    *time.Time      `json:"publishedAt,omitempty"`
	SEO            SEO             `json:"seo"`
	Version        int             `json:"version"`
}

type ContactInput struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Phone   string `json:"phone,omitempty"`
	Company string `json:"company,omitempty"`
	Subject string `json:"subject"`
	Message string `json:"message"`
}

type ContactInquiry struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Phone     string    `json:"phone,omitempty"`
	Company   string    `json:"company,omitempty"`
	Subject   string    `json:"subject"`
	Message   string    `json:"message"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"createdAt"`
}

type Pagination struct {
	Page       int `json:"page"`
	PerPage    int `json:"perPage"`
	Total      int `json:"total"`
	TotalPages int `json:"totalPages"`
}

type ListResponse[T any] struct {
	Data       []T        `json:"data"`
	Pagination Pagination `json:"pagination"`
}

type ErrorResponse struct {
	Error   string            `json:"error"`
	Message string            `json:"message"`
	Fields  map[string]string `json:"fields,omitempty"`
}
