package validator

import (
	"net/mail"
	"regexp"
	"strings"
)

var slugPattern = regexp.MustCompile(`^[a-z0-9]+(?:-[a-z0-9]+)*$`)

type ValidationError struct {
	Fields map[string]string
}

func (e ValidationError) Error() string {
	return "validation failed"
}

func New() ValidationError {
	return ValidationError{Fields: map[string]string{}}
}

func (e ValidationError) Add(field, message string) ValidationError {
	e.Fields[field] = message
	return e
}

func (e ValidationError) HasErrors() bool {
	return len(e.Fields) > 0
}

func Required(value string) bool {
	return strings.TrimSpace(value) != ""
}

func Email(value string) bool {
	_, err := mail.ParseAddress(strings.TrimSpace(value))
	return err == nil
}

func Slug(value string) bool {
	return slugPattern.MatchString(strings.TrimSpace(value))
}
