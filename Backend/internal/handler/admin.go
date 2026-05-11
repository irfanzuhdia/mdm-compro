package handler

import (
	"net/http"

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

func (h AdminHandler) ModuleContract(w http.ResponseWriter, r *http.Request) {
	JSON(w, http.StatusNotImplemented, map[string]any{
		"error":   "contract_defined",
		"message": "This module route is reserved by the OpenAPI contract and ready for CRUD implementation.",
	})
}
