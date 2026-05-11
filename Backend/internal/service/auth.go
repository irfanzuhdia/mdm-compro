package service

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"strings"
	"time"

	"github.com/irfanzuhdiabdillah/mdm-compro/backend/internal/auth"
	"github.com/irfanzuhdiabdillah/mdm-compro/backend/internal/config"
	"github.com/irfanzuhdiabdillah/mdm-compro/backend/internal/model"
	"github.com/irfanzuhdiabdillah/mdm-compro/backend/internal/repository"
	"github.com/irfanzuhdiabdillah/mdm-compro/backend/internal/validator"
	"golang.org/x/crypto/bcrypt"
)

var ErrUnauthorized = errors.New("unauthorized")

type AuthService struct {
	cfg  config.Config
	repo repository.AuthRepository
	jwt  auth.Manager
}

func NewAuthService(cfg config.Config, repo repository.AuthRepository) AuthService {
	return AuthService{
		cfg:  cfg,
		repo: repo,
		jwt:  auth.NewManager(cfg.JWTSecret, cfg.AccessTokenTTL),
	}
}

func (s AuthService) Login(ctx context.Context, input model.LoginInput) (model.AuthTokens, error) {
	v := validator.New()
	if !validator.Email(input.Email) {
		v = v.Add("email", "A valid email is required.")
	}
	if !validator.Required(input.Password) {
		v = v.Add("password", "Password is required.")
	}
	if v.HasErrors() {
		return model.AuthTokens{}, v
	}

	user, err := s.repo.UserByEmail(ctx, strings.ToLower(input.Email))
	if err != nil {
		return model.AuthTokens{}, ErrUnauthorized
	}
	if !user.IsActive || bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password)) != nil {
		return model.AuthTokens{}, ErrUnauthorized
	}
	return s.issueTokens(ctx, user)
}

func (s AuthService) Refresh(ctx context.Context, token string) (model.AuthTokens, error) {
	user, err := s.repo.RefreshTokenUser(ctx, token)
	if err != nil || !user.IsActive {
		return model.AuthTokens{}, ErrUnauthorized
	}
	if err := s.repo.RevokeRefreshToken(ctx, token); err != nil {
		return model.AuthTokens{}, err
	}
	return s.issueTokens(ctx, user)
}

func (s AuthService) Logout(ctx context.Context, token string) error {
	if strings.TrimSpace(token) == "" {
		return nil
	}
	return s.repo.RevokeRefreshToken(ctx, token)
}

func (s AuthService) TokenManager() auth.Manager {
	return s.jwt
}

func (s AuthService) issueTokens(ctx context.Context, user model.User) (model.AuthTokens, error) {
	accessToken, accessExpiresAt, err := s.jwt.Generate(user.ID, user.Email, user.Permissions)
	if err != nil {
		return model.AuthTokens{}, err
	}
	refreshToken, err := randomToken()
	if err != nil {
		return model.AuthTokens{}, err
	}
	refreshExpiresAt := time.Now().UTC().Add(s.cfg.RefreshTokenTTL)
	if err := s.repo.StoreRefreshToken(ctx, user.ID, refreshToken, refreshExpiresAt); err != nil {
		return model.AuthTokens{}, err
	}
	user.PasswordHash = ""
	return model.AuthTokens{
		AccessToken:           accessToken,
		AccessTokenExpiresAt:  accessExpiresAt,
		RefreshToken:          refreshToken,
		RefreshTokenExpiresAt: refreshExpiresAt,
		User:                  user,
	}, nil
}

func randomToken() (string, error) {
	buffer := make([]byte, 32)
	if _, err := rand.Read(buffer); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(buffer), nil
}
