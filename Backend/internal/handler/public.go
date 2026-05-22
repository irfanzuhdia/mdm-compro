package handler

import (
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/irfanzuhdiabdillah/mdm-compro/backend/internal/model"
	"github.com/irfanzuhdiabdillah/mdm-compro/backend/internal/repository"
	"github.com/irfanzuhdiabdillah/mdm-compro/backend/internal/service"
)

type PublicHandler struct {
	service service.PublicService
}

func NewPublicHandler(service service.PublicService) PublicHandler {
	return PublicHandler{service: service}
}

func (h PublicHandler) Navigation(w http.ResponseWriter, r *http.Request) {
	data, err := h.service.Navigation(r.Context())
	respond(w, data, err)
}

func (h PublicHandler) Page(w http.ResponseWriter, r *http.Request) {
	data, err := h.service.Page(r.Context(), pathParam(r))
	respond(w, data, err)
}

func (h PublicHandler) Services(w http.ResponseWriter, r *http.Request) {
	data, err := h.service.Services(r.Context())
	respond(w, data, err)
}

func (h PublicHandler) Service(w http.ResponseWriter, r *http.Request) {
	data, err := h.service.Service(r.Context(), pathParam(r))
	respond(w, data, err)
}

func (h PublicHandler) Products(w http.ResponseWriter, r *http.Request) {
	data, err := h.service.Products(r.Context())
	respond(w, data, err)
}

func (h PublicHandler) Product(w http.ResponseWriter, r *http.Request) {
	data, err := h.service.Product(r.Context(), pathParam(r))
	respond(w, data, err)
}

func (h PublicHandler) News(w http.ResponseWriter, r *http.Request) {
	data, err := h.service.News(r.Context(), intQuery(r, "page", 1), intQuery(r, "perPage", 10), r.URL.Query().Get("category"))
	respond(w, data, err)
}

func (h PublicHandler) NewsItem(w http.ResponseWriter, r *http.Request) {
	data, err := h.service.NewsItem(r.Context(), chi.URLParam(r, "slug"))
	respond(w, data, err)
}

func (h PublicHandler) Careers(w http.ResponseWriter, r *http.Request) {
	data, err := h.service.Careers(r.Context(), intQuery(r, "page", 1), intQuery(r, "perPage", 10), r.URL.Query().Get("department"))
	respond(w, data, err)
}

func (h PublicHandler) Career(w http.ResponseWriter, r *http.Request) {
	data, err := h.service.Career(r.Context(), chi.URLParam(r, "slug"))
	respond(w, data, err)
}

func (h PublicHandler) Contact(w http.ResponseWriter, r *http.Request) {
	var input model.ContactInput
	if err := DecodeJSON(r, &input); err != nil {
		Error(w, http.StatusBadRequest, "invalid_json", "Request body must be valid JSON.")
		return
	}
	data, err := h.service.CreateContact(r.Context(), input)
	if err != nil {
		HandleError(w, err)
		return
	}
	JSON(w, http.StatusCreated, data)
}

func respond(w http.ResponseWriter, data any, err error) {
	if errors.Is(err, repository.ErrNotFound) {
		Error(w, http.StatusNotFound, "not_found", "Resource was not found.")
		return
	}
	if err != nil {
		HandleError(w, err)
		return
	}
	JSON(w, http.StatusOK, data)
}

func intQuery(r *http.Request, key string, fallback int) int {
	value, err := strconv.Atoi(r.URL.Query().Get(key))
	if err != nil {
		return fallback
	}
	return value
}

func pathParam(r *http.Request) string {
	return strings.Trim(chi.URLParam(r, "path"), "/")
}
