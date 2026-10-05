-- ClientDesk PostgreSQL schema.
-- Run with: psql "$DATABASE_URL" -f Server/db/schema.sql

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    google_id TEXT UNIQUE,
    profile_pic_url TEXT,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    login_locked_until TIMESTAMPTZ,
    password_reset_attempts INTEGER NOT NULL DEFAULT 0,
    password_reset_locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_otp (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    otp INTEGER NOT NULL,
    expiry_at TIMESTAMPTZ NOT NULL,
    resend_count INTEGER NOT NULL DEFAULT 0,
    lock_until TIMESTAMPTZ,
    UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS client_data (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    email TEXT NOT NULL,
    status TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_data (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id BIGINT NOT NULL REFERENCES client_data(id) ON DELETE RESTRICT,
    project_name TEXT NOT NULL,
    budget NUMERIC(12, 2),
    priority TEXT,
    start_date DATE,
    end_date DATE,
    status TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_task (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id BIGINT NOT NULL REFERENCES project_data(id) ON DELETE CASCADE,
    task_name TEXT NOT NULL,
    is_complete BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS invoice_data (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id BIGINT REFERENCES project_data(id) ON DELETE RESTRICT,
    client_id BIGINT NOT NULL REFERENCES client_data(id) ON DELETE RESTRICT,
    invoice_number TEXT UNIQUE,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'Draft',
    paid_at DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoice_items (
    id BIGSERIAL PRIMARY KEY,
    invoice_id BIGINT NOT NULL REFERENCES invoice_data(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC(12, 2) NOT NULL DEFAULT 0,
    rate NUMERIC(12, 2) NOT NULL DEFAULT 0,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS payment_methods (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    details TEXT NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoice_profile (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invoice_name TEXT NOT NULL,
    address TEXT NOT NULL,
    gst_number TEXT,
    signature_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_log (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS client_data_user_id_idx ON client_data(user_id);
CREATE INDEX IF NOT EXISTS project_data_user_id_idx ON project_data(user_id);
CREATE INDEX IF NOT EXISTS invoice_data_user_id_idx ON invoice_data(user_id);
CREATE INDEX IF NOT EXISTS activity_log_user_id_idx ON activity_log(user_id);
