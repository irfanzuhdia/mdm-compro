CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    code text NOT NULL,
    description text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

CREATE UNIQUE INDEX roles_code_active_uniq ON roles (code) WHERE deleted_at IS NULL;

CREATE TABLE permissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text NOT NULL,
    description text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

CREATE UNIQUE INDEX permissions_code_active_uniq ON permissions (code) WHERE deleted_at IS NULL;

CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL,
    name text NOT NULL,
    password_hash text NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    last_login_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    created_by uuid REFERENCES users(id),
    updated_by uuid REFERENCES users(id),
    version integer NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX users_email_active_uniq ON users (lower(email)) WHERE deleted_at IS NULL;

CREATE TABLE user_roles (
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE role_permissions (
    role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE refresh_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash text NOT NULL,
    expires_at timestamptz NOT NULL,
    revoked_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX refresh_tokens_hash_uniq ON refresh_tokens (token_hash);
CREATE INDEX refresh_tokens_user_idx ON refresh_tokens (user_id, expires_at DESC);

CREATE TABLE pages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    page_key text NOT NULL,
    title text NOT NULL,
    content jsonb NOT NULL DEFAULT '{}'::jsonb,
    status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
    published_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    created_by uuid REFERENCES users(id),
    updated_by uuid REFERENCES users(id),
    version integer NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX pages_key_active_uniq ON pages (page_key) WHERE deleted_at IS NULL;
CREATE INDEX pages_public_idx ON pages (page_key, status, published_at) WHERE deleted_at IS NULL;

CREATE TABLE media (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name text NOT NULL,
    object_key text NOT NULL,
    url text NOT NULL,
    mime_type text NOT NULL,
    size_bytes bigint NOT NULL CHECK (size_bytes >= 0),
    alt_text text,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ready', 'failed', 'archived')),
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    created_by uuid REFERENCES users(id),
    updated_by uuid REFERENCES users(id),
    version integer NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX media_object_key_active_uniq ON media (object_key) WHERE deleted_at IS NULL;

CREATE TABLE services (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id uuid REFERENCES services(id),
    slug text NOT NULL,
    full_path text NOT NULL,
    title text NOT NULL,
    summary text,
    content jsonb NOT NULL DEFAULT '{}'::jsonb,
    image_url text,
    gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
    status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
    published_at timestamptz,
    sort_order integer NOT NULL DEFAULT 0,
    depth integer NOT NULL DEFAULT 0 CHECK (depth >= 0 AND depth <= 4),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    created_by uuid REFERENCES users(id),
    updated_by uuid REFERENCES users(id),
    version integer NOT NULL DEFAULT 1,
    CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

CREATE UNIQUE INDEX services_full_path_active_uniq ON services (full_path) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX services_parent_slug_active_uniq ON services (COALESCE(parent_id, '00000000-0000-0000-0000-000000000000'::uuid), slug) WHERE deleted_at IS NULL;
CREATE INDEX services_public_idx ON services (status, published_at, sort_order) WHERE deleted_at IS NULL;

CREATE TABLE products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id uuid REFERENCES products(id),
    slug text NOT NULL,
    full_path text NOT NULL,
    title text NOT NULL,
    summary text,
    content jsonb NOT NULL DEFAULT '{}'::jsonb,
    specs jsonb NOT NULL DEFAULT '{}'::jsonb,
    datasheet_url text,
    image_url text,
    gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
    status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
    published_at timestamptz,
    sort_order integer NOT NULL DEFAULT 0,
    depth integer NOT NULL DEFAULT 0 CHECK (depth >= 0 AND depth <= 4),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    created_by uuid REFERENCES users(id),
    updated_by uuid REFERENCES users(id),
    version integer NOT NULL DEFAULT 1,
    CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

CREATE UNIQUE INDEX products_full_path_active_uniq ON products (full_path) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX products_parent_slug_active_uniq ON products (COALESCE(parent_id, '00000000-0000-0000-0000-000000000000'::uuid), slug) WHERE deleted_at IS NULL;
CREATE INDEX products_public_idx ON products (status, published_at, sort_order) WHERE deleted_at IS NULL;

CREATE TABLE news_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    version integer NOT NULL DEFAULT 1,
    CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

CREATE UNIQUE INDEX news_categories_slug_active_uniq ON news_categories (slug) WHERE deleted_at IS NULL;

CREATE TABLE news (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id uuid REFERENCES news_categories(id),
    slug text NOT NULL,
    title text NOT NULL,
    excerpt text,
    body jsonb NOT NULL DEFAULT '{}'::jsonb,
    featured_image_url text,
    featured boolean NOT NULL DEFAULT false,
    status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
    published_at timestamptz,
    scheduled_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    created_by uuid REFERENCES users(id),
    updated_by uuid REFERENCES users(id),
    version integer NOT NULL DEFAULT 1,
    CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

CREATE UNIQUE INDEX news_slug_active_uniq ON news (slug) WHERE deleted_at IS NULL;
CREATE INDEX news_public_idx ON news (status, published_at DESC) WHERE deleted_at IS NULL;

CREATE TABLE tags (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    version integer NOT NULL DEFAULT 1,
    CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

CREATE UNIQUE INDEX tags_slug_active_uniq ON tags (slug) WHERE deleted_at IS NULL;

CREATE TABLE news_tags (
    news_id uuid NOT NULL REFERENCES news(id) ON DELETE CASCADE,
    tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (news_id, tag_id)
);

CREATE TABLE careers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text NOT NULL,
    title text NOT NULL,
    summary text,
    description jsonb NOT NULL DEFAULT '{}'::jsonb,
    department text NOT NULL,
    location text NOT NULL,
    employment_type text NOT NULL CHECK (employment_type IN ('full_time', 'contract', 'internship', 'part_time')),
    apply_url text,
    deadline timestamptz,
    status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
    published_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    created_by uuid REFERENCES users(id),
    updated_by uuid REFERENCES users(id),
    version integer NOT NULL DEFAULT 1,
    CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

CREATE UNIQUE INDEX careers_slug_active_uniq ON careers (slug) WHERE deleted_at IS NULL;
CREATE INDEX careers_public_idx ON careers (status, published_at DESC) WHERE deleted_at IS NULL;

CREATE TABLE seo_meta (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    title text,
    description text,
    canonical_url text,
    og_image_url text,
    no_index boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    created_by uuid REFERENCES users(id),
    updated_by uuid REFERENCES users(id),
    version integer NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX seo_meta_entity_active_uniq ON seo_meta (entity_type, entity_id) WHERE deleted_at IS NULL;

CREATE TABLE contacts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    company text,
    subject text NOT NULL,
    message text NOT NULL,
    status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'spam')),
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    created_by uuid REFERENCES users(id),
    updated_by uuid REFERENCES users(id),
    version integer NOT NULL DEFAULT 1
);

CREATE INDEX contacts_status_idx ON contacts (status, created_at DESC) WHERE deleted_at IS NULL;

CREATE TABLE settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key text NOT NULL,
    value jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    created_by uuid REFERENCES users(id),
    updated_by uuid REFERENCES users(id),
    version integer NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX settings_key_active_uniq ON settings (key) WHERE deleted_at IS NULL;

CREATE TABLE audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id uuid REFERENCES users(id),
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid,
    before jsonb,
    after jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

INSERT INTO permissions (id, code, description) VALUES
('00000000-0000-0000-0000-000000000101', 'admin:*', 'Full CMS access'),
('00000000-0000-0000-0000-000000000102', 'content:read', 'Read CMS content'),
('00000000-0000-0000-0000-000000000103', 'content:write', 'Create and update CMS content'),
('00000000-0000-0000-0000-000000000104', 'media:write', 'Upload and manage media'),
('00000000-0000-0000-0000-000000000105', 'contacts:read', 'Read contact inquiries')
ON CONFLICT DO NOTHING;

INSERT INTO roles (id, name, code, description) VALUES
('00000000-0000-0000-0000-000000000201', 'Super Admin', 'super_admin', 'Full system administrator'),
('00000000-0000-0000-0000-000000000202', 'Editor', 'editor', 'Content editor')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000201'::uuid, id FROM permissions
ON CONFLICT DO NOTHING;

INSERT INTO users (id, email, name, password_hash, is_active) VALUES
('00000000-0000-0000-0000-000000000301', 'admin@multidayamitra.co.id', 'CMS Admin', '$2a$10$QuADomiPOK424E29lVWBoOqqZFCnhldgqu0QPrXv8aPLz/8l0b9Su', true)
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id) VALUES
('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000201')
ON CONFLICT DO NOTHING;

INSERT INTO pages (id, page_key, title, content, status, published_at) VALUES
('00000000-0000-0000-0000-000000000401', 'about', 'About PT Multi Daya Mitra', '{"overview":"Established in 2013, PT Multi Daya Mitra delivers electrical, automation, and fire alarm solutions across Indonesia.","vision":"To become a global electrical, automation, and fire alarm services company.","mission":"Build mutual partnerships and deliver every engagement with professional excellence.","values":["Safety","Reliability","Professionalism","Partnership"],"leadership":[],"timeline":[],"certifications":["ISO 9001:2015"]}', 'published', now()),
('00000000-0000-0000-0000-000000000402', 'contact', 'Contact PT Multi Daya Mitra', '{"offices":[{"name":"Head Office","address":"East Java, Indonesia","mapEmbedUrl":""}],"email":"info@multidayamitra.co.id","phone":"+62"}', 'published', now())
ON CONFLICT DO NOTHING;

INSERT INTO services (id, slug, full_path, title, summary, content, image_url, status, published_at, sort_order, depth) VALUES
('00000000-0000-0000-0000-000000000501', 'electrical-engineering', 'electrical-engineering', 'Electrical Engineering', 'End-to-end electrical engineering, installation, testing, and commissioning.', '{"blocks":[{"type":"paragraph","text":"Complete electrical lifecycle support for industrial and infrastructure facilities."}]}', '/placeholder.jpg', 'published', now(), 1, 0),
('00000000-0000-0000-0000-000000000502', 'automation', 'automation', 'Automation', 'PLC, HMI, SCADA, monitoring, and control system integration.', '{"blocks":[{"type":"paragraph","text":"Engineering, programming, and integration of monitoring and control systems."}]}', '/placeholder.jpg', 'published', now(), 2, 0),
('00000000-0000-0000-0000-000000000503', 'maintenance', 'maintenance', 'Maintenance', 'Predictive, preventive, and operational maintenance services.', '{"blocks":[{"type":"paragraph","text":"Long-term reliability programs for critical electrical systems."}]}', '/placeholder.jpg', 'published', now(), 3, 0)
ON CONFLICT DO NOTHING;

INSERT INTO products (id, slug, full_path, title, summary, content, specs, image_url, status, published_at, sort_order, depth) VALUES
('00000000-0000-0000-0000-000000000601', 'testing-equipment', 'testing-equipment', 'Testing Equipment', 'Electrical testing equipment and commissioning tools.', '{"blocks":[{"type":"paragraph","text":"Reliable test equipment for industrial electrical projects."}]}', '{"category":"Testing"}', '/placeholder.jpg', 'published', now(), 1, 0),
('00000000-0000-0000-0000-000000000602', 'protection-relay', 'protection-relay', 'Protection Relay', 'Protection relay devices and related engineering support.', '{"blocks":[{"type":"paragraph","text":"Protection relay products for medium-voltage systems."}]}', '{"category":"Protection"}', '/placeholder.jpg', 'published', now(), 2, 0),
('00000000-0000-0000-0000-000000000603', 'instrumentation', 'instrumentation', 'Instrumentation', 'Instrumentation devices for monitoring and control.', '{"blocks":[{"type":"paragraph","text":"Instrumentation products for industrial automation."}]}', '{"category":"Instrumentation"}', '/placeholder.jpg', 'published', now(), 3, 0)
ON CONFLICT DO NOTHING;

INSERT INTO news_categories (id, name, slug) VALUES
('00000000-0000-0000-0000-000000000701', 'Company', 'company'),
('00000000-0000-0000-0000-000000000702', 'Project', 'project'),
('00000000-0000-0000-0000-000000000703', 'Insight', 'insight')
ON CONFLICT DO NOTHING;

INSERT INTO news (id, category_id, slug, title, excerpt, body, featured_image_url, featured, status, published_at) VALUES
('00000000-0000-0000-0000-000000000801', '00000000-0000-0000-0000-000000000701', 'energy-monitoring-system-launch', 'Launching our Energy Monitoring System for ESG-ready facilities', 'A turnkey solution helps plants track real-time consumption and produce ESG-grade reports.', '{"blocks":[{"type":"paragraph","text":"Our Energy Monitoring System helps facilities understand usage patterns and reduce waste."}]}', '/placeholder.jpg', true, 'published', now()),
('00000000-0000-0000-0000-000000000802', '00000000-0000-0000-0000-000000000702', '20mw-substation-commissioning-east-java', 'Successful commissioning of a 20 MW substation in East Java', 'Our team completed end-to-end testing and commissioning for an industrial client.', '{"blocks":[{"type":"paragraph","text":"The commissioning scope covered protection coordination, testing, and energization support."}]}', '/placeholder.jpg', false, 'published', now())
ON CONFLICT DO NOTHING;

INSERT INTO careers (id, slug, title, summary, description, department, location, employment_type, apply_url, deadline, status, published_at) VALUES
('00000000-0000-0000-0000-000000000901', 'senior-electrical-engineer', 'Senior Electrical Engineer', 'Lead medium-voltage system design, protection coordination, and commissioning.', '{"blocks":[{"type":"paragraph","text":"Lead electrical design and commissioning work for industrial clients."}]}', 'Engineering', 'Surabaya, East Java', 'full_time', 'mailto:hr@multidayamitra.co.id', now() + interval '60 days', 'published', now()),
('00000000-0000-0000-0000-000000000902', 'automation-engineer-plc-scada', 'Automation Engineer (PLC & SCADA)', 'Design, program, and integrate PLC, HMI, and SCADA systems.', '{"blocks":[{"type":"paragraph","text":"Build reliable automation systems for power, oil and gas, and manufacturing clients."}]}', 'Engineering', 'Surabaya, East Java', 'full_time', 'mailto:hr@multidayamitra.co.id', now() + interval '60 days', 'published', now())
ON CONFLICT DO NOTHING;
