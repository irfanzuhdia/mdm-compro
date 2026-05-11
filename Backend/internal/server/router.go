package server

import (
	"context"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/irfanzuhdiabdillah/mdm-compro/backend/internal/auth"
	"github.com/irfanzuhdiabdillah/mdm-compro/backend/internal/config"
	"github.com/irfanzuhdiabdillah/mdm-compro/backend/internal/handler"
	"github.com/irfanzuhdiabdillah/mdm-compro/backend/internal/repository"
	"github.com/irfanzuhdiabdillah/mdm-compro/backend/internal/service"
	"github.com/jackc/pgx/v5/pgxpool"
)

type contextKey string

const claimsKey contextKey = "claims"

func NewRouter(cfg config.Config, logger *slog.Logger, pool *pgxpool.Pool) http.Handler {
	publicRepo := repository.NewPublicRepository(pool)
	authRepo := repository.NewAuthRepository(pool)
	adminRepo := repository.NewAdminRepository(pool)

	publicHandler := handler.NewPublicHandler(service.NewPublicService(publicRepo))
	authService := service.NewAuthService(cfg, authRepo)
	authHandler := handler.NewAuthHandler(authService)
	adminHandler := handler.NewAdminHandler(service.NewAdminService(adminRepo))
	tokenManager := authService.TokenManager()

	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Recoverer)
	r.Use(middleware.CleanPath)
	r.Use(middleware.Timeout(60 * time.Second))
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   cfg.FrontendOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Get("/healthz", func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
		defer cancel()
		if err := publicRepo.Health(ctx); err != nil {
			logger.Warn("health check failed", "error", err)
			handler.Error(w, http.StatusServiceUnavailable, "unhealthy", "Database is not reachable.")
			return
		}
		handler.JSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})

	r.Route("/api/v1", func(r chi.Router) {
		r.Route("/auth", func(r chi.Router) {
			r.Post("/login", authHandler.Login)
			r.Post("/refresh", authHandler.Refresh)
			r.Post("/logout", authHandler.Logout)
		})

		r.Route("/public", func(r chi.Router) {
			r.Get("/navigation", publicHandler.Navigation)
			r.Get("/pages/{key}", publicHandler.Page)
			r.Get("/services", publicHandler.Services)
			r.Get("/services/{path:.*}", publicHandler.Service)
			r.Get("/products", publicHandler.Products)
			r.Get("/products/{path:.*}", publicHandler.Product)
			r.Get("/news", publicHandler.News)
			r.Get("/news/{slug}", publicHandler.NewsItem)
			r.Get("/careers", publicHandler.Careers)
			r.Get("/careers/{slug}", publicHandler.Career)
			r.Post("/contacts", publicHandler.Contact)
		})

		r.Route("/admin", func(r chi.Router) {
			r.Use(requireAuth(tokenManager))
			r.Get("/dashboard", adminHandler.Dashboard)
			r.Get("/contacts", adminHandler.Contacts)
			r.Get("/pages", adminHandler.Pages)
			r.Get("/pages/{id}", adminHandler.Page)
			r.Put("/pages/{id}", adminHandler.UpdatePage)
			for _, module := range []string{"users", "roles", "permissions", "services", "products", "news", "careers", "media", "seo-meta", "settings"} {
				r.Get("/"+module, adminHandler.ModuleContract)
				r.Post("/"+module, adminHandler.ModuleContract)
				r.Put("/"+module+"/{id}", adminHandler.ModuleContract)
				r.Delete("/"+module+"/{id}", adminHandler.ModuleContract)
			}
		})
	})

	return r
}

func requireAuth(manager auth.Manager) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			header := strings.TrimSpace(r.Header.Get("Authorization"))
			tokenValue, ok := strings.CutPrefix(header, "Bearer ")
			if !ok || strings.TrimSpace(tokenValue) == "" {
				handler.Error(w, http.StatusUnauthorized, "unauthorized", "Bearer token is required.")
				return
			}
			claims, err := manager.Parse(strings.TrimSpace(tokenValue))
			if err != nil {
				handler.Error(w, http.StatusUnauthorized, "unauthorized", "Bearer token is invalid or expired.")
				return
			}
			ctx := context.WithValue(r.Context(), claimsKey, claims)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
