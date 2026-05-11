package handler

import (
	"errors"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/irfanzuhdiabdillah/mdm-compro/backend/internal/model"
	"github.com/irfanzuhdiabdillah/mdm-compro/backend/internal/repository"
	"github.com/irfanzuhdiabdillah/mdm-compro/backend/internal/service"
)

type AdminHandler struct {
	service service.AdminService
}

func NewAdminHandler(service service.AdminService) AdminHandler {
	return AdminHandler{service: service}
}

func (h AdminHandler) Dashboard(w http.ResponseWriter, r *http.Request) {
	counts, err := h.service.Dashboard(r.Context())
	if err != nil {
		HandleError(w, err)
		return
	}
	JSON(w, http.StatusOK, map[string]any{"counts": counts})
}

func (h AdminHandler) Contacts(w http.ResponseWriter, r *http.Request) {
	contacts, err := h.service.RecentContacts(r.Context())
	if err != nil {
		HandleError(w, err)
		return
	}
	JSON(w, http.StatusOK, map[string]any{"data": contacts})
}

func (h AdminHandler) Pages(w http.ResponseWriter, r *http.Request) {
	pages, err := h.service.Pages(r.Context(), intQuery(r, "page", 1), intQuery(r, "perPage", 25))
	respondAdmin(w, pages, err)
}

func (h AdminHandler) Page(w http.ResponseWriter, r *http.Request) {
	page, err := h.service.Page(r.Context(), chi.URLParam(r, "id"))
	respondAdmin(w, page, err)
}

func (h AdminHandler) UpdatePage(w http.ResponseWriter, r *http.Request) {
	var input model.PageInput
	if err := DecodeJSON(r, &input); err != nil {
		Error(w, http.StatusBadRequest, "invalid_json", "Request body must be valid JSON.")
		return
	}

	page, err := h.service.UpdatePage(r.Context(), chi.URLParam(r, "id"), input)
	respondAdmin(w, page, err)
}

func (h AdminHandler) ModuleContract(w http.ResponseWriter, r *http.Request) {
	JSON(w, http.StatusNotImplemented, map[string]any{
		"error":   "contract_defined",
		"message": "This module route is reserved by the OpenAPI contract and ready for CRUD implementation.",
	})
}

func respondAdmin(w http.ResponseWriter, data any, err error) {
	if errors.Is(err, repository.ErrNotFound) {
		Error(w, http.StatusNotFound, "not_found", "Resource was not found.")
		return
	}
	if errors.Is(err, repository.ErrConflict) {
		Error(w, http.StatusConflict, "version_conflict", "The record was changed by another request. Reload and try again.")
		return
	}
	if err != nil {
		HandleError(w, err)
		return
	}
	JSON(w, http.StatusOK, data)
}
