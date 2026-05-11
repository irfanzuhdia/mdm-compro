package config

import (
	"log/slog"
	"os"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	AppEnv             string
	HTTPAddr           string
	FrontendOrigin     string
	DatabaseURL        string
	JWTSecret          string
	AccessTokenTTL     time.Duration
	RefreshTokenTTL    time.Duration
	PublicCacheSeconds int
	S3Endpoint         string
	S3AccessKey        string
	S3SecretKey        string
	S3Bucket           string
	S3UseSSL           bool
	SMTPHost           string
	SMTPPort           string
	SMTPUser           string
	SMTPPassword       string
	ContactNotifyTo    string
}

func Load() Config {
	return Config{
		AppEnv:             env("APP_ENV", "development"),
		HTTPAddr:           env("HTTP_ADDR", ":8080"),
		FrontendOrigin:     env("FRONTEND_ORIGIN", "http://localhost:3000"),
		DatabaseURL:        env("DATABASE_URL", "postgres://mdm:mdm@localhost:5432/mdm_compro?sslmode=disable"),
		JWTSecret:          env("JWT_SECRET", "change-me-in-production"),
		AccessTokenTTL:     durationEnv("ACCESS_TOKEN_TTL", 15*time.Minute),
		RefreshTokenTTL:    durationEnv("REFRESH_TOKEN_TTL", 30*24*time.Hour),
		PublicCacheSeconds: intEnv("PUBLIC_CACHE_SECONDS", 300),
		S3Endpoint:         env("S3_ENDPOINT", "localhost:9000"),
		S3AccessKey:        env("S3_ACCESS_KEY", "minioadmin"),
		S3SecretKey:        env("S3_SECRET_KEY", "minioadmin"),
		S3Bucket:           env("S3_BUCKET", "mdm-media"),
		S3UseSSL:           boolEnv("S3_USE_SSL", false),
		SMTPHost:           env("SMTP_HOST", "mailhog"),
		SMTPPort:           env("SMTP_PORT", "1025"),
		SMTPUser:           env("SMTP_USER", ""),
		SMTPPassword:       env("SMTP_PASSWORD", ""),
		ContactNotifyTo:    env("CONTACT_NOTIFY_TO", "info@multidayamitra.co.id"),
	}
}

func (c Config) LogLevel() slog.Level {
	if strings.EqualFold(c.AppEnv, "production") {
		return slog.LevelInfo
	}
	return slog.LevelDebug
}

func env(key, fallback string) string {
	if value := strings.TrimSpace(os.Getenv(key)); value != "" {
		return value
	}
	return fallback
}

func intEnv(key string, fallback int) int {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	parsed, err := strconv.Atoi(value)
	if err != nil {
		return fallback
	}
	return parsed
}

func boolEnv(key string, fallback bool) bool {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	parsed, err := strconv.ParseBool(value)
	if err != nil {
		return fallback
	}
	return parsed
}

func durationEnv(key string, fallback time.Duration) time.Duration {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	parsed, err := time.ParseDuration(value)
	if err != nil {
		return fallback
	}
	return parsed
}
