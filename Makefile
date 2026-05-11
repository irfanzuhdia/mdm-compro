SHELL := /bin/sh

COMPOSE := docker compose
BACKEND_DIR := Backend
FRONTEND_DIR := FrontEnd
DATABASE_URL ?= postgres://mdm:mdm@localhost:5432/mdm_compro?sslmode=disable

.PHONY: dev build test lint typecheck migrate-up migrate-down seed openapi docker-up docker-down logs api frontend

dev: docker-up

build:
	$(COMPOSE) build

test:
	cd $(BACKEND_DIR) && go test ./...
	cd $(FRONTEND_DIR) && corepack pnpm typecheck

lint:
	cd $(FRONTEND_DIR) && corepack pnpm lint
	cd $(BACKEND_DIR) && go vet ./...

typecheck:
	cd $(FRONTEND_DIR) && corepack pnpm typecheck

migrate-up:
	migrate -path $(BACKEND_DIR)/migrations -database "$(DATABASE_URL)" up

migrate-down:
	migrate -path $(BACKEND_DIR)/migrations -database "$(DATABASE_URL)" down 1

seed:
	psql "$(DATABASE_URL)" -f $(BACKEND_DIR)/migrations/001_init.up.sql

openapi:
	mkdir -p $(BACKEND_DIR)/docs
	cp docs/openapi.yaml $(BACKEND_DIR)/docs/openapi.yaml

docker-up:
	$(COMPOSE) up --build

docker-down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f

api:
	cd $(BACKEND_DIR) && go run ./cmd/api

frontend:
	cd $(FRONTEND_DIR) && corepack pnpm dev
