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
	pages, err := h.service.Pages(
		r.Context(),
		intQuery(r, "page", 1),
		intQuery(r, "perPage", 25),
		r.URL.Query().Get("q"),
		r.URL.Query().Get("status"),
	)
	respondAdmin(w, pages, err)
}

func (h AdminHandler) CreatePage(w http.ResponseWriter, r *http.Request) {
	var input model.PageCreateInput
	if err := DecodeJSON(r, &input); err != nil {
		Error(w, http.StatusBadRequest, "invalid_json", "Request body must be valid JSON.")
		return
	}

	page, err := h.service.CreatePage(r.Context(), input)
	if err != nil {
		respondAdmin(w, page, err)
		return
	}
	JSON(w, http.StatusCreated, page)
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

func (h AdminHandler) DeletePage(w http.ResponseWriter, r *http.Request) {
	err := h.service.DeletePage(r.Context(), chi.URLParam(r, "id"), intQuery(r, "version", 0))
	if err != nil {
		respondAdmin(w, nil, err)
		return
	}
	JSON(w, http.StatusNoContent, nil)
}

func (h AdminHandler) Content(w http.ResponseWriter, r *http.Request) {
	data, err := h.service.Content(
		r.Context(),
		chi.URLParam(r, "module"),
		intQuery(r, "page", 1),
		intQuery(r, "perPage", 25),
		r.URL.Query().Get("q"),
		r.URL.Query().Get("status"),
	)
	respondAdmin(w, data, err)
}

func (h AdminHandler) CreateContent(w http.ResponseWriter, r *http.Request) {
	var input model.ContentNodeInput
	if err := DecodeJSON(r, &input); err != nil {
		Error(w, http.StatusBadRequest, "invalid_json", "Request body must be valid JSON.")
		return
	}
	data, err := h.service.CreateContent(r.Context(), chi.URLParam(r, "module"), input)
	if err != nil {
		respondAdmin(w, data, err)
		return
	}
	JSON(w, http.StatusCreated, data)
}

func (h AdminHandler) ContentItem(w http.ResponseWriter, r *http.Request) {
	data, err := h.service.ContentItem(r.Context(), chi.URLParam(r, "module"), chi.URLParam(r, "id"))
	respondAdmin(w, data, err)
}

func (h AdminHandler) UpdateContent(w http.ResponseWriter, r *http.Request) {
	var input model.ContentNodeInput
	if err := DecodeJSON(r, &input); err != nil {
		Error(w, http.StatusBadRequest, "invalid_json", "Request body must be valid JSON.")
		return
	}
	data, err := h.service.UpdateContent(r.Context(), chi.URLParam(r, "module"), chi.URLParam(r, "id"), input)
	respondAdmin(w, data, err)
}

func (h AdminHandler) DeleteContent(w http.ResponseWriter, r *http.Request) {
	err := h.service.DeleteContent(r.Context(), chi.URLParam(r, "module"), chi.URLParam(r, "id"), intQuery(r, "version", 0))
	if err != nil {
		respondAdmin(w, nil, err)
		return
	}
	JSON(w, http.StatusNoContent, nil)
}

func (h AdminHandler) News(w http.ResponseWriter, r *http.Request) {
	data, err := h.service.News(
		r.Context(),
		intQuery(r, "page", 1),
		intQuery(r, "perPage", 25),
		r.URL.Query().Get("q"),
		r.URL.Query().Get("status"),
	)
	respondAdmin(w, data, err)
}

func (h AdminHandler) CreateNews(w http.ResponseWriter, r *http.Request) {
	var input model.NewsInput
	if err := DecodeJSON(r, &input); err != nil {
		Error(w, http.StatusBadRequest, "invalid_json", "Request body must be valid JSON.")
		return
	}
	data, err := h.service.CreateNews(r.Context(), input)
	if err != nil {
		respondAdmin(w, data, err)
		return
	}
	JSON(w, http.StatusCreated, data)
}

func (h AdminHandler) NewsItem(w http.ResponseWriter, r *http.Request) {
	data, err := h.service.NewsItem(r.Context(), chi.URLParam(r, "id"))
	respondAdmin(w, data, err)
}

func (h AdminHandler) UpdateNews(w http.ResponseWriter, r *http.Request) {
	var input model.NewsInput
	if err := DecodeJSON(r, &input); err != nil {
		Error(w, http.StatusBadRequest, "invalid_json", "Request body must be valid JSON.")
		return
	}
	data, err := h.service.UpdateNews(r.Context(), chi.URLParam(r, "id"), input)
	respondAdmin(w, data, err)
}

func (h AdminHandler) DeleteNews(w http.ResponseWriter, r *http.Request) {
	err := h.service.DeleteNews(r.Context(), chi.URLParam(r, "id"), intQuery(r, "version", 0))
	if err != nil {
		respondAdmin(w, nil, err)
		return
	}
	JSON(w, http.StatusNoContent, nil)
}

func (h AdminHandler) Careers(w http.ResponseWriter, r *http.Request) {
	data, err := h.service.Careers(
		r.Context(),
		intQuery(r, "page", 1),
		intQuery(r, "perPage", 25),
		r.URL.Query().Get("q"),
		r.URL.Query().Get("status"),
	)
	respondAdmin(w, data, err)
}

func (h AdminHandler) CreateCareer(w http.ResponseWriter, r *http.Request) {
	var input model.CareerInput
	if err := DecodeJSON(r, &input); err != nil {
		Error(w, http.StatusBadRequest, "invalid_json", "Request body must be valid JSON.")
		return
	}
	data, err := h.service.CreateCareer(r.Context(), input)
	if err != nil {
		respondAdmin(w, data, err)
		return
	}
	JSON(w, http.StatusCreated, data)
}

func (h AdminHandler) Career(w http.ResponseWriter, r *http.Request) {
	data, err := h.service.Career(r.Context(), chi.URLParam(r, "id"))
	respondAdmin(w, data, err)
}

func (h AdminHandler) UpdateCareer(w http.ResponseWriter, r *http.Request) {
	var input model.CareerInput
	if err := DecodeJSON(r, &input); err != nil {
		Error(w, http.StatusBadRequest, "invalid_json", "Request body must be valid JSON.")
		return
	}
	data, err := h.service.UpdateCareer(r.Context(), chi.URLParam(r, "id"), input)
	respondAdmin(w, data, err)
}

func (h AdminHandler) DeleteCareer(w http.ResponseWriter, r *http.Request) {
	err := h.service.DeleteCareer(r.Context(), chi.URLParam(r, "id"), intQuery(r, "version", 0))
	if err != nil {
		respondAdmin(w, nil, err)
		return
	}
	JSON(w, http.StatusNoContent, nil)
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
	if errors.Is(err, repository.ErrInvalidParent) {
		Error(w, http.StatusBadRequest, "invalid_parent", "Parent selection would create an invalid content hierarchy.")
		return
	}
	if err != nil {
		HandleError(w, err)
		return
	}
	JSON(w, http.StatusOK, data)
}
