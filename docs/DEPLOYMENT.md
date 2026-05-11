# Deployment Guide

## Production Checklist
- Replace `JWT_SECRET`.
- Replace seed admin password.
- Use managed PostgreSQL or a hardened PostgreSQL server.
- Use S3-compatible object storage with private bucket policies.
- Configure SMTP or queue-backed contact notifications.
- Configure HTTPS at the load balancer or Nginx.
- Run migrations before API deployment.
- Build frontend with `CMS_API_BASE_URL` pointing to the internal API and `NEXT_PUBLIC_CMS_API_BASE_URL` pointing to the public API origin.

## Build Images

```bash
docker compose build
```

## Runtime Environment
Required API variables:

```bash
DATABASE_URL=
JWT_SECRET=
FRONTEND_ORIGIN=
S3_ENDPOINT=
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_BUCKET=
```

Required frontend variables:

```bash
CMS_API_BASE_URL=
NEXT_PUBLIC_CMS_API_BASE_URL=
NEXT_PUBLIC_SITE_URL=
```

## CI/CD Recommendation
GitHub Actions should run:
1. Frontend install, lint, typecheck, build.
2. Backend `go test ./...` and `go vet ./...`.
3. Migration up/down test against disposable PostgreSQL.
4. Docker image build.
5. Deployment after image and migration checks pass.

## Rollback
- Roll back application image first.
- Roll back database only with reviewed down migrations.
- Never run destructive rollback against production without a snapshot.
