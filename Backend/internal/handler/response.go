package handler

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/irfanzuhdiabdillah/mdm-compro/backend/internal/model"
	"github.com/irfanzuhdiabdillah/mdm-compro/backend/internal/validator"
)

func JSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if payload == nil {
		return
	}
	_ = json.NewEncoder(w).Encode(payload)
}

func Error(w http.ResponseWriter, status int, code, message string) {
	JSON(w, status, model.ErrorResponse{Error: code, Message: message})
}

func HandleError(w http.ResponseWriter, err error) {
	var validationErr validator.ValidationError
	if errors.As(err, &validationErr) {
		JSON(w, http.StatusBadRequest, model.ErrorResponse{
			Error:   "validation_error",
			Message: "Request validation failed.",
			Fields:  validationErr.Fields,
		})
		return
	}
	Error(w, http.StatusInternalServerError, "internal_error", "Unexpected server error.")
}

func DecodeJSON(r *http.Request, dest any) error {
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	return decoder.Decode(dest)
}
