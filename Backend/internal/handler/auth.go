package handler

import (
	"errors"
	"net/http"

	"github.com/irfanzuhdiabdillah/mdm-compro/backend/internal/model"
	"github.com/irfanzuhdiabdillah/mdm-compro/backend/internal/service"
)

type AuthHandler struct {
	service service.AuthService
}

func NewAuthHandler(service service.AuthService) AuthHandler {
	return AuthHandler{service: service}
}

func (h AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var input model.LoginInput
	if err := DecodeJSON(r, &input); err != nil {
		Error(w, http.StatusBadRequest, "invalid_json", "Request body must be valid JSON.")
		return
	}
	tokens, err := h.service.Login(r.Context(), input)
	if errors.Is(err, service.ErrUnauthorized) {
		Error(w, http.StatusUnauthorized, "unauthorized", "Invalid email or password.")
		return
	}
	if err != nil {
		HandleError(w, err)
		return
	}
	JSON(w, http.StatusOK, tokens)
}

func (h AuthHandler) Refresh(w http.ResponseWriter, r *http.Request) {
	var input model.RefreshInput
	if err := DecodeJSON(r, &input); err != nil {
		Error(w, http.StatusBadRequest, "invalid_json", "Request body must be valid JSON.")
		return
	}
	tokens, err := h.service.Refresh(r.Context(), input.RefreshToken)
	if errors.Is(err, service.ErrUnauthorized) {
		Error(w, http.StatusUnauthorized, "unauthorized", "Refresh token is invalid or expired.")
		return
	}
	if err != nil {
		HandleError(w, err)
		return
	}
	JSON(w, http.StatusOK, tokens)
}

func (h AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	var input model.RefreshInput
	_ = DecodeJSON(r, &input)
	if err := h.service.Logout(r.Context(), input.RefreshToken); err != nil {
		HandleError(w, err)
		return
	}
	JSON(w, http.StatusNoContent, nil)
}
