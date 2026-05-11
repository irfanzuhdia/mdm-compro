# PRD: PT Multi Daya Mitra Company Profile + CMS

## Overview
PT Multi Daya Mitra needs a production corporate website with a CMS for public content, careers, news, service/product catalogs, SEO metadata, media, contact inquiries, and admin operations.

## Goals
- Replace v0 static content with CMS-managed content.
- Keep the existing Next.js App Router frontend as the public website and admin UI.
- Provide a Go + PostgreSQL REST API with JWT authentication and RBAC.
- Support Docker-based local development and production-oriented deployment docs.

## Public Website Requirements
- Home: CMS-backed service highlights, CTA, company positioning.
- About Us: company overview, vision, mission, values, leadership, timeline, certifications.
- Services: hierarchical CMS categories and child services with slug routing, image, gallery, rich content, and SEO.
- Products: hierarchical CMS categories and sub-products with specs, datasheet URL, gallery, rich content, and SEO.
- News: paginated list, detail by slug, categories, tags, featured image, rich text, draft/publish/scheduled states.
- Careers: list/detail pages, deadline, department, location, employment type, apply URL, draft/publish states.
- Contact Us: office locations, map embed content, social links, contact inquiry form, notification hook.

## CMS Requirements
- Authentication with JWT access tokens and rotating refresh tokens.
- Dashboard counts and operational modules.
- User, role, permission, page, service, product, news, career, media, SEO, contact, and settings management.
- Optimistic locking via `version`.
- Soft delete via `deleted_at`.
- Audit logging table for admin mutations.

## Success Criteria
- Public pages render without the API using frontend fallbacks, and use API content when services are running.
- `docker compose up --build` starts PostgreSQL, API, frontend, MinIO, and Nginx.
- OpenAPI 3.1 contract is available at `docs/openapi.yaml`.
- Database schema includes constraints for slugs, statuses, soft deletes, hierarchy depth, and uniqueness.

## Non-Goals For This Scaffold
- Full visual WYSIWYG editor implementation.
- Full admin CRUD UI screens for every module.
- Production email queue and antivirus scanning for media uploads.
