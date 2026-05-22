# Database Design

## Core Tables
- `users`: CMS users with bcrypt password hashes, status, soft delete, and version.
- `roles`, `permissions`, `user_roles`, `role_permissions`: RBAC.
- `refresh_tokens`: hashed refresh tokens with expiry and revocation.
- `pages`: CMS-managed content keyed by slash-separated `page_key` paths such as `about` or `company/history`.
- `services`, `products`: hierarchical content with `parent_id`, `slug`, `full_path`, `depth`, and `sort_order`.
- `news`, `news_categories`, `tags`, `news_tags`: editorial publishing.
- `careers`: job openings.
- `media`: S3 object metadata.
- `seo_meta`: polymorphic SEO metadata by `entity_type` and `entity_id`.
- `contacts`: public contact inquiries.
- `settings`: typed JSON settings.
- `audit_logs`: admin action log.

## Shared Columns
Most mutable tables include:
- `id uuid primary key`
- `status text check (...)` for publishable content
- `created_at`, `updated_at`, `deleted_at`
- `created_by`, `updated_by`
- `version integer not null default 1`

## Constraints
- Soft delete aware uniqueness uses partial indexes where `deleted_at IS NULL`.
- Single slugs must match `^[a-z0-9]+(-[a-z0-9]+)*$`; page paths may use slash-separated slug segments.
- Service/product hierarchy depth is limited to `0..4`.
- Service/product parent changes are guarded against self-parenting, descendant-parenting, and descendant depth overflow.
- Public queries only return `status = 'published'` and `published_at <= now()` when set.

## Migrations
- Up migration: `Backend/migrations/001_init.up.sql`
- Down migration: `Backend/migrations/001_init.down.sql`
- Docker development auto-runs the up migration on first PostgreSQL volume initialization.

## Seed Credentials
- Email: `admin@multidayamitra.co.id`
- Password: `admin123`
- Replace this immediately outside local development.
