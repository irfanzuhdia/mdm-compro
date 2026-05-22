# Architecture

## Runtime Topology
- `frontend`: Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui.
- `api`: Go REST API using chi router, pgx PostgreSQL pool, JWT auth.
- `postgres`: primary relational database.
- `minio`: S3-compatible local media storage.
- `nginx`: reverse proxy for frontend and API in Docker.

## Request Flow
1. Public user requests a page from Next.js.
2. Server Components fetch from `CMS_API_BASE_URL` with `next.revalidate`.
3. If API fetch fails during local development or preview, frontend fallbacks render stable content.
4. Contact form submits to `/api/v1/public/contacts`.
5. Admin user logs in through `/admin/login`, which proxies credentials to `/api/v1/auth/login` and stores HTTP-only cookies.
6. Protected admin routes call `/api/v1/admin/*` with a bearer token.

## Backend Layers
- `handler`: HTTP request parsing and response formatting.
- `service`: validation, auth logic, transaction orchestration.
- `repository`: PostgreSQL queries via pgx.
- `model`: public domain models and API response shapes.
- `storage`: S3-compatible presigned URL boundary.
- `mailer`: isolated notification boundary for future SMTP/queue integration.

## Frontend Layers
- `lib/cms.ts`: typed API client and fallback content.
- `components/cms`: reusable CMS rendering primitives and component block rendering.
- `app/*`: public App Router pages, catalog detail routes, and multi-segment CMS page paths.
- `app/admin/*`: protected admin shell.

## Rendering Strategy
- Public list/detail pages use Server Components and time-based revalidation.
- CMS pages resolve slash-separated paths and render typed JSON blocks such as paragraphs, lists, images, and CTAs.
- Contact form and mobile navigation are Client Components.
- Admin dashboard uses `cache: "no-store"` because it is authenticated operational data.

## Security
- JWT access token is short lived.
- Refresh token is stored hashed in PostgreSQL and rotated on refresh.
- Admin cookies are HTTP-only and `sameSite=lax`.
- RBAC is represented by roles and permissions; current scaffold reserves module routes behind auth.
