# Local Setup

## Requirements
- Docker and Docker Compose
- Node.js 24 with Corepack for local frontend commands
- Go 1.26.3 for local backend commands
- Optional: `migrate` CLI and `psql`

## Start Everything

```bash
make dev
```

Services:
- Frontend: `http://localhost:3000`
- API: `http://localhost:8080`
- Nginx proxy: `http://localhost:8088`
- MinIO console: `http://localhost:9001`

## Frontend Only

```bash
cd FrontEnd
corepack enable
corepack pnpm install
corepack pnpm dev
```

## Backend Only

```bash
cd Backend
go mod download
go run ./cmd/api
```

Set `DATABASE_URL` first if PostgreSQL is not using the default local value.

## Common Commands

```bash
make build
make test
make lint
make docker-down
make logs
```

## Admin Login
- URL: `http://localhost:3000/admin/login`
- Email: `admin@multidayamitra.co.id`
- Password: `admin123`

The admin shell requires the Go API and PostgreSQL to be running.
