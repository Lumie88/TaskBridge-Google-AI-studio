-- ============================================================================
--                           TASKBRIDGE DATABASE ARCHITECTURE
--                       Production Schema for PostgreSQL on Railway
-- ============================================================================
-- Designed for: B2B care provider-to-vetted-services middleware platform
-- Core architecture elements: Multi-tenant, role-based RBV, PII encryption-ready,
-- and immutable audit lines.
--
-- Target DB: PostgreSQL 14+ / Railway Dedicated PG
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. EXTENSIONS & GENERAL UTILITIES (PUBLIC SCHEMA)
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA public;

-- Create schemas
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS tenant;
CREATE SCHEMA IF NOT EXISTS care;
CREATE SCHEMA IF NOT EXISTS ops;
CREATE SCHEMA IF NOT EXISTS trader;
CREATE SCHEMA IF NOT EXISTS integration;
CREATE SCHEMA IF NOT EXISTS audit;
CREATE SCHEMA IF NOT EXISTS billing;

-- Global helper function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CLOCK_TIMESTAMP();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 2. CUSTOM TYPES & ENUMS
-- ----------------------------------------------------------------------------

-- AUTH & USERS
CREATE TYPE auth.user_role AS ENUM (
    'care_coordinator',
    'care_manager',
    'taskbridge_admin',
    'taskbridge_super_admin'
);

CREATE TYPE auth.user_status AS ENUM (
    'invited',
    'active',
    'suspended',
    'disabled'
);

-- TENANTS & AGENCIES
CREATE TYPE tenant.agency_status AS ENUM (
    'onboarding',
    'active',
    'suspended',
    'archived'
);

-- RECIPIENTS & RISK
CREATE TYPE care.service_user_risk_level AS ENUM (
    'standard',
    'vulnerable_adult',
    'high_risk'
);

-- REPAIR TASKS
CREATE TYPE ops.task_status AS ENUM (
    'draft',
    'awaiting_care_approval',
    'pending_taskbridge_assignment',
    'assignment_review',
    'dispatched',
    'visit_scheduled',
    'checked_in',
    'awaiting_evidence_review',
    'awaiting_care_confirmation',
    'completed',
    'blocked',
    'cancelled',
    'failed_dispatch'
);

CREATE TYPE ops.task_urgency AS ENUM (
    'low',
    'medium',
    'high',
    'urgent'
);

-- ASSIGNMENTS & DISPATCH
CREATE TYPE ops.assignment_status AS ENUM (
    'not_started',
    'matching',
    'pending_admin_review',
    'approved',
    'dispatched',
    'rejected',
    'blocked',
    'failed'
);

-- VERIFICATIONS & DOCUMENTS
CREATE TYPE trader.dbs_status AS ENUM (
    'not_started',
    'pending',
    'approved',
    'rejected',
    'expired',
    'unclear'
);

CREATE TYPE trader.insurance_status AS ENUM (
    'unverified',
    'pending',
    'verified',
    'expired',
    'rejected'
);

-- FIELD DISPATCH VISITS
CREATE TYPE ops.visit_status AS ENUM (
    'pending',
    'link_sent',
    'checked_in',
    'checked_out',
    'evidence_submitted',
    'confirmed',
    'disputed',
    'cancelled'
);

-- WEBHOOK LOGGING & INTEGRATIONS
CREATE TYPE integration.webhook_direction AS ENUM (
    'inbound',
    'outbound'
);

CREATE TYPE integration.webhook_status AS ENUM (
    'received',
    'processed',
    'failed',
    'retrying',
    'ignored'
);

CREATE TYPE integration.provider_type AS ENUM (
    'care_management',
    'dbs_verification',
    'handyman_network',
    'sms',
    'storage',
    'payment'
);


-- ============================================================================
--                           3. TABLE DEFINITIONS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- SCHEMA: tenant
-- Description: Core master structures defining clean multi-tenancy lines
-- ----------------------------------------------------------------------------

CREATE TABLE tenant.agencies (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    primary_contact_name VARCHAR(150),
    primary_contact_email VARCHAR(255) NOT NULL,
    work_email_domain VARCHAR(100) NOT NULL,
    logo_url VARCHAR(1024),
    status tenant.agency_status NOT NULL DEFAULT 'onboarding',
    timezone VARCHAR(50) NOT NULL DEFAULT 'Europe/London',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT chk_slug_format CHECK (slug ~* '^[a-z0-9-]+$')
);

CREATE TABLE tenant.agency_settings (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    agency_id UUID UNIQUE NOT NULL REFERENCES tenant.agencies(id) ON DELETE CASCADE,
    vulnerable_adult_requires_enhanced_dbs BOOLEAN NOT NULL DEFAULT TRUE,
    allow_carer_on_site_supervision BOOLEAN NOT NULL DEFAULT TRUE,
    default_visit_radius_miles NUMERIC(5,2) NOT NULL DEFAULT 15.00 CHECK (default_visit_radius_miles > 0),
    completion_requires_care_confirmation BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL
);

CREATE TABLE tenant.agency_api_keys (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES tenant.agencies(id) ON DELETE CASCADE,
    key_prefix VARCHAR(16) NOT NULL, -- Publicly visible identifier prefix (e.g., tb_live_agc101)
    key_hash VARCHAR(64) NOT NULL,    -- SHA-256 secure storage hash
    scopes TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL,
    CONSTRAINT chk_prefix_len CHECK (LENGTH(key_prefix) >= 4)
);

CREATE TABLE tenant.agency_webhook_configs (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES tenant.agencies(id) ON DELETE CASCADE,
    callback_url VARCHAR(1024) NOT NULL,
    secret_hash_or_encrypted VARCHAR(255) NOT NULL, -- SHA-256 for integrity or AES-256 encrypted
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL
);


-- ----------------------------------------------------------------------------
-- SCHEMA: auth
-- Description: Identity, MFA, session management, and rate limiting logs
-- ----------------------------------------------------------------------------

CREATE TABLE auth.users (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    agency_id UUID REFERENCES tenant.agencies(id) ON DELETE SET NULL, -- Nullable for TaskBridge Core admins
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_domain VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Argon2id, bcrypt or PBKDF2 hash metadata
    password_algorithm VARCHAR(32) NOT NULL DEFAULT 'scrypt',
    role auth.user_role NOT NULL,
    status auth.user_status NOT NULL DEFAULT 'invited',
    last_login_at TIMESTAMP WITH TIME ZONE,
    mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    mfa_secret_encrypted VARCHAR(512), -- Sealed with HSM or KMS keys
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$')
);

CREATE TABLE auth.sessions (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    refresh_token_hash VARCHAR(64) UNIQUE NOT NULL, -- Secure hash of refresh secret
    ip_address INET,
    user_agent VARCHAR(512),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL
);

CREATE TABLE auth.password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL
);

CREATE TABLE auth.login_attempts (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    ip_address INET NOT NULL,
    success BOOLEAN NOT NULL,
    reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL
);


-- ----------------------------------------------------------------------------
-- SCHEMA: care
-- Description: Sensitive patient/recipient metadata and medical/carer diaries
-- ----------------------------------------------------------------------------

CREATE TABLE care.service_users (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES tenant.agencies(id) ON DELETE CASCADE,
    external_service_user_id VARCHAR(100) NOT NULL, -- Linking ID from partner system (e.g. PASS, CarePlanner)
    encrypted_name BYTEA NOT NULL,                 -- Encrypted using pgcrypto or KMS key
    encrypted_address BYTEA NOT NULL,              -- Encrypted to safeguard vulnerable person PII
    postcode_hash VARCHAR(64) NOT NULL,            -- Hash for distance analysis indexing without revealing exact text
    lat NUMERIC(9,6) NOT NULL CHECK (lat BETWEEN -90.0 AND 90.0),
    lng NUMERIC(9,6) NOT NULL CHECK (lng BETWEEN -180.0 AND 180.0),
    risk_level care.service_user_risk_level NOT NULL DEFAULT 'standard',
    is_vulnerable BOOLEAN NOT NULL DEFAULT TRUE,
    vulnerability_notes_encrypted BYTEA,
    care_plan_reference VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (agency_id, external_service_user_id)
);

CREATE TABLE care.care_notes (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES tenant.agencies(id) ON DELETE CASCADE,
    service_user_id UUID NOT NULL REFERENCES care.service_users(id) ON DELETE RESTRICT,
    submitted_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    external_note_id VARCHAR(100),
    raw_note_text TEXT NOT NULL, -- Raw ingest for semantic context audit before parsing
    source VARCHAR(100) NOT NULL DEFAULT 'webhook',
    idempotency_key VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL
);


-- ----------------------------------------------------------------------------
-- SCHEMA: ops
-- Description: Repair tasks, lifecycle logging, assignments, visits and tokens
-- ----------------------------------------------------------------------------

CREATE TABLE ops.tasks (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES tenant.agencies(id) ON DELETE CASCADE,
    service_user_id UUID NOT NULL REFERENCES care.service_users(id) ON DELETE RESTRICT,
    care_note_id UUID REFERENCES care.care_notes(id) ON DELETE SET NULL,
    created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    category VARCHAR(150) NOT NULL, -- Type of maintenance (e.g. Loose handrails, lock repair)
    urgency ops.task_urgency NOT NULL DEFAULT 'medium',
    status ops.task_status NOT NULL DEFAULT 'draft',
    care_worker_notes TEXT,
    ai_summary TEXT,
    ai_extracted_tasks_json JSONB,              -- Structured data extracted from notes
    preferred_window VARCHAR(100),
    carer_on_site BOOLEAN NOT NULL DEFAULT FALSE,
    vulnerable_adult_flag BOOLEAN NOT NULL DEFAULT TRUE,
    ring_fence_required BOOLEAN NOT NULL DEFAULT FALSE,
    before_photo_url VARCHAR(1024),
    after_photo_url VARCHAR(1024),
    estimated_customer_charge NUMERIC(10,2) CHECK (estimated_customer_charge >= 0),
    payment_status VARCHAR(50),                  -- Clean backend check
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE ops.task_status_events (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES ops.tasks(id) ON DELETE CASCADE,
    agency_id UUID NOT NULL REFERENCES tenant.agencies(id) ON DELETE CASCADE,
    previous_status ops.task_status,
    new_status ops.task_status NOT NULL,
    changed_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reason TEXT,
    metadata_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL
);


-- ----------------------------------------------------------------------------
-- SCHEMA: trader
-- Description: Network management, Qualified Traders registration & safety records
-- ----------------------------------------------------------------------------

CREATE TABLE trader.networks (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    provider_type VARCHAR(100) NOT NULL, -- e.g. 'Local Authority Services', 'Trusted Guild'
    api_base_url VARCHAR(1024),
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL
);

CREATE TABLE trader.traders (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    network_id UUID REFERENCES trader.networks(id) ON DELETE SET NULL,
    external_trader_id VARCHAR(100), -- ID matching third-party maintenance API
    display_name VARCHAR(150) NOT NULL,
    encrypted_full_name BYTEA NOT NULL, -- Registered KYC name
    encrypted_mobile BYTEA NOT NULL, -- Encrypted dispatch contact cell phone
    email VARCHAR(255) CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$'),
    source VARCHAR(100) NOT NULL DEFAULT 'internal',
    lat NUMERIC(9,6) NOT NULL CHECK (lat BETWEEN -90.0 AND 90.0),
    lng NUMERIC(9,6) NOT NULL CHECK (lng BETWEEN -180.0 AND 180.0),
    postcode_area VARCHAR(10) NOT NULL, -- Operational base area prefix (e.g. SW1A, N1)
    hourly_rate NUMERIC(8,2) NOT NULL CHECK (hourly_rate > 0),
    quality_score NUMERIC(3,2) CHECK (quality_score BETWEEN 1.0 AND 5.0),
    status auth.user_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (network_id, external_trader_id)
);

CREATE TABLE trader.trader_services (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    trader_id UUID NOT NULL REFERENCES trader.traders(id) ON DELETE CASCADE,
    service_category VARCHAR(150) NOT NULL, -- Matches ops.tasks.category for smart matching algorithm
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL,
    UNIQUE (trader_id, service_category)
);

CREATE TABLE trader.trader_availability (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    trader_id UUID NOT NULL REFERENCES trader.traders(id) ON DELETE CASCADE,
    available_from TIME NOT NULL,
    available_to TIME NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL,
    CONSTRAINT chk_times_valid CHECK (available_from < available_to)
);

CREATE TABLE trader.dbs_verifications (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    trader_id UUID NOT NULL REFERENCES trader.traders(id) ON DELETE CASCADE,
    provider_session_id VARCHAR(100), -- Secure tracking token with DBS checking partner
    status trader.dbs_status NOT NULL DEFAULT 'not_started',
    outcome VARCHAR(100),
    dbs_status trader.dbs_status NOT NULL DEFAULT 'not_started',
    expiry_date DATE NOT NULL,
    evidence_reference VARCHAR(150) UNIQUE NOT NULL, -- Government Reference certificate number
    checked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL
);

CREATE TABLE trader.insurance_records (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    trader_id UUID NOT NULL REFERENCES trader.traders(id) ON DELETE CASCADE,
    status trader.insurance_status NOT NULL DEFAULT 'unverified',
    provider_name VARCHAR(150),
    policy_reference_encrypted BYTEA,
    expiry_date DATE NOT NULL,
    document_url VARCHAR(1024),
    verified_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL
);

CREATE TABLE trader.qualifications (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    trader_id UUID NOT NULL REFERENCES trader.traders(id) ON DELETE CASCADE,
    qualification_type VARCHAR(100) NOT NULL, -- e.g. 'Electrical', 'Structural'
    title VARCHAR(150) NOT NULL,
    evidence_url VARCHAR(1024),
    expiry_date DATE,
    verified_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL
);


-- ----------------------------------------------------------------------------
-- SCHEMA: ops (continued)
-- Description: Assignments and Dispatch Operations involving approved traders
-- ----------------------------------------------------------------------------

CREATE TABLE ops.assignments (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES ops.tasks(id) ON DELETE CASCADE,
    agency_id UUID NOT NULL REFERENCES tenant.agencies(id) ON DELETE CASCADE,
    trader_id UUID NOT NULL REFERENCES trader.traders(id) ON DELETE RESTRICT,
    assignment_status ops.assignment_status NOT NULL DEFAULT 'not_started',
    match_score NUMERIC(5,2),
    match_reason_json JSONB,
    distance_miles NUMERIC(6,2) CHECK (distance_miles >= 0),
    quoted_price NUMERIC(10,2) CHECK (quoted_price >= 0),
    selected_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    blocked_reason TEXT,
    provider_booking_id VARCHAR(100), -- ID on remote marketplace
    dispatched_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL
);

CREATE TABLE ops.assignment_candidates (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES ops.tasks(id) ON DELETE CASCADE,
    trader_id UUID NOT NULL REFERENCES trader.traders(id) ON DELETE CASCADE,
    agency_id UUID NOT NULL REFERENCES tenant.agencies(id) ON DELETE CASCADE,
    eligible BOOLEAN NOT NULL DEFAULT TRUE,
    rejection_reason TEXT,
    score NUMERIC(5,2),
    distance_miles NUMERIC(6,2) CHECK (distance_miles >= 0),
    price NUMERIC(10,2) CHECK (price >= 0),
    availability_window VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL
);

CREATE TABLE ops.visits (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES ops.tasks(id) ON DELETE CASCADE,
    agency_id UUID NOT NULL REFERENCES tenant.agencies(id) ON DELETE CASCADE,
    assignment_id UUID NOT NULL REFERENCES ops.assignments(id) ON DELETE CASCADE,
    trader_id UUID NOT NULL REFERENCES trader.traders(id) ON DELETE RESTRICT,
    visit_status ops.visit_status NOT NULL DEFAULT 'pending',
    scheduled_window VARCHAR(150),
    check_in_time TIMESTAMP WITH TIME ZONE,
    check_in_lat NUMERIC(9,6) CHECK (check_in_lat BETWEEN -90.0 AND 90.0),
    check_in_lng NUMERIC(9,6) CHECK (check_in_lng BETWEEN -180.0 AND 180.0),
    check_out_time TIMESTAMP WITH TIME ZONE,
    check_out_lat NUMERIC(9,6) CHECK (check_out_lat BETWEEN -90.0 AND 90.0),
    check_out_lng NUMERIC(9,6) CHECK (check_out_lng BETWEEN -180.0 AND 180.0),
    evidence_status VARCHAR(50),
    completion_notes TEXT,
    confirmed_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    disputed_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL
);

CREATE TABLE ops.visit_tokens (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    visit_id UUID NOT NULL REFERENCES ops.visits(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES ops.tasks(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) UNIQUE NOT NULL, -- Salted hash (SHA-256) of ephemeral link token
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL
);

CREATE TABLE ops.visit_evidence (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    visit_id UUID NOT NULL REFERENCES ops.visits(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES ops.tasks(id) ON DELETE CASCADE,
    evidence_type VARCHAR(50) NOT NULL, -- 'photo_before', 'photo_after', 'signature', 'checklist'
    file_url VARCHAR(1024) NOT NULL,
    metadata_json JSONB, -- Coordinates embedded in photo, file size, uploads specs
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL,
    reviewed_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_status VARCHAR(50) NOT NULL DEFAULT 'awaiting_reviews'
);


-- ----------------------------------------------------------------------------
-- SCHEMA: integration
-- Description: Secure external routing, webhook ledgers, providers and retries
-- ----------------------------------------------------------------------------

CREATE TABLE integration.provider_configs (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    provider_type integration.provider_type NOT NULL,
    name VARCHAR(150) NOT NULL,
    api_base_url VARCHAR(1024) NOT NULL,
    credentials_encrypted BYTEA NOT NULL, -- Client secrets / access codes encrypted with PG master keys
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL
);

CREATE TABLE integration.agency_integrations (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES tenant.agencies(id) ON DELETE CASCADE,
    provider_config_id UUID NOT NULL REFERENCES integration.provider_configs(id) ON DELETE CASCADE,
    external_account_id VARCHAR(100) NOT NULL, -- Tenancy mapping ID on remote care provider
    settings_json JSONB DEFAULT '{}'::JSONB NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL,
    UNIQUE (agency_id, provider_config_id)
);

CREATE TABLE integration.webhook_logs (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    agency_id UUID REFERENCES tenant.agencies(id) ON DELETE SET NULL,
    provider_config_id UUID REFERENCES integration.provider_configs(id) ON DELETE SET NULL,
    direction integration.webhook_direction NOT NULL,
    endpoint VARCHAR(1024) NOT NULL,
    event_type VARCHAR(150) NOT NULL,
    idempotency_key VARCHAR(100),
    status integration.webhook_status NOT NULL DEFAULT 'received',
    request_headers_json JSONB,
    request_body_json JSONB,
    response_status INTEGER,
    response_body_json JSONB,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0 NOT NULL,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL,
    -- Prevent duplicate processing of B2B transactions
    CONSTRAINT uniq_webhook_idx UNIQUE (agency_id, idempotency_key)
);

CREATE TABLE integration.provider_events (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    provider_config_id UUID NOT NULL REFERENCES integration.provider_configs(id) ON DELETE CASCADE,
    external_event_id VARCHAR(150) NOT NULL, -- Remote event transaction ID
    event_type VARCHAR(150) NOT NULL,
    payload_json JSONB NOT NULL,
    processed BOOLEAN NOT NULL DEFAULT FALSE,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL,
    UNIQUE (provider_config_id, external_event_id)
);

CREATE TABLE integration.retry_queue (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    webhook_log_id UUID REFERENCES integration.webhook_logs(id) ON DELETE CASCADE,
    job_type VARCHAR(100) NOT NULL,
    payload_json JSONB NOT NULL,
    attempts INTEGER DEFAULT 0 NOT NULL,
    max_attempts INTEGER DEFAULT 5 NOT NULL,
    next_run_at TIMESTAMP WITH TIME ZONE NOT NULL,
    locked_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL
);


-- ----------------------------------------------------------------------------
-- SCHEMA: audit
-- Description: Immutable logs capturing actor interactions and threat indexes
-- ----------------------------------------------------------------------------

CREATE TABLE audit.audit_logs (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Track user executing actions
    actor_role VARCHAR(100),
    agency_id UUID REFERENCES tenant.agencies(id) ON DELETE SET NULL, -- Track tenant segregation boundaries
    action VARCHAR(150) NOT NULL,                                     -- e.g., 'DECRYPT_PATIENT_PII', 'DISPATCH_SMS_CODE'
    entity_type VARCHAR(100) NOT NULL,                               -- e.g., 'care.service_users', 'trader.traders'
    entity_id UUID NOT NULL,
    ip_address INET,
    user_agent VARCHAR(512),
    metadata_json JSONB,                                              -- Context state details
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL
);

-- Deny edits and updates to enforce IMMUTABILITY of the compliance log ledger
CREATE OR REPLACE FUNCTION audit.prevent_delete_and_update()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit Trails are strictly secure immutable records. Writing operations blocked.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_immutable_audit_logs
BEFORE UPDATE OR DELETE ON audit.audit_logs
FOR EACH ROW EXECUTE FUNCTION audit.prevent_delete_and_update();


CREATE TABLE audit.security_events (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email VARCHAR(255),
    event_type VARCHAR(150) NOT NULL, -- e.g., 'MFA_FAILED', 'SQL_INJECTION_REJECT', 'COMPUTED_POSTCODE_OFFSET_BREACH'
    severity VARCHAR(50) NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    ip_address INET NOT NULL,
    user_agent VARCHAR(512),
    metadata_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL
);

CREATE TRIGGER trg_immutable_security_events
BEFORE UPDATE OR DELETE ON audit.security_events
FOR EACH ROW EXECUTE FUNCTION audit.prevent_delete_and_update();


-- ----------------------------------------------------------------------------
-- SCHEMA: billing
-- Description: Non-public commercial bounds and agency/trader transactions
-- ----------------------------------------------------------------------------

CREATE TABLE billing.agency_billing_profiles (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    agency_id UUID UNIQUE NOT NULL REFERENCES tenant.agencies(id) ON DELETE CASCADE,
    billing_email VARCHAR(255) NOT NULL,
    monthly_cap NUMERIC(12,2) NOT NULL DEFAULT 5000.00 CHECK (monthly_cap >= 0),
    current_month_committed NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (current_month_committed >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'GBP',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL
);

CREATE TABLE billing.task_charges (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    task_id UUID UNIQUE NOT NULL REFERENCES ops.tasks(id) ON DELETE RESTRICT,
    agency_id UUID NOT NULL REFERENCES tenant.agencies(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES ops.assignments(id) ON DELETE SET NULL,
    handyman_amount NUMERIC(10,2) NOT NULL CHECK (handyman_amount >= 0),
    platform_fee NUMERIC(10,2) NOT NULL CHECK (platform_fee >= 0),
    total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'GBP',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL,
    CONSTRAINT chk_total_sum CHECK (total_amount = handyman_amount + platform_fee)
);

CREATE TABLE billing.invoices (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES tenant.agencies(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'GBP',
    status VARCHAR(50) NOT NULL DEFAULT 'issued',
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL,
    CONSTRAINT chk_period CHECK (period_start <= period_end)
);

CREATE TABLE billing.payouts (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    trader_id UUID NOT NULL REFERENCES trader.traders(id) ON DELETE RESTRICT,
    assignment_id UUID UNIQUE NOT NULL REFERENCES ops.assignments(id) ON DELETE RESTRICT,
    amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'GBP',
    status VARCHAR(50) NOT NULL DEFAULT 'payable',
    payable_after TIMESTAMP WITH TIME ZONE NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL
);


-- ============================================================================
--                           4. AUTOMATED UPDATED_AT TRIGGERS
-- ============================================================================
CREATE TRIGGER trg_update_agencies PRIOR UPDATE ON tenant.agencies FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_update_agency_settings PRIOR UPDATE ON tenant.agency_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_update_agency_webhook_configs PRIOR UPDATE ON tenant.agency_webhook_configs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_update_users PRIOR UPDATE ON auth.users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_update_service_users PRIOR UPDATE ON care.service_users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_update_tasks PRIOR UPDATE ON ops.tasks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_update_traders PRIOR UPDATE ON trader.traders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_update_dbs_verifications PRIOR UPDATE ON trader.dbs_verifications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_update_insurance_records PRIOR UPDATE ON trader.insurance_records FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_update_assignments PRIOR UPDATE ON ops.assignments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_update_visits PRIOR UPDATE ON ops.visits FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_update_provider_configs PRIOR UPDATE ON integration.provider_configs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_update_agency_integrations PRIOR UPDATE ON integration.agency_integrations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_update_agency_billing_profiles PRIOR UPDATE ON billing.agency_billing_profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_update_task_charges PRIOR UPDATE ON billing.task_charges FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================================================
--                           5. PERFORMANCE INDEXES
-- ============================================================================

-- Fast lookup of task records within individual agencies sorted by lifecycle stage
CREATE INDEX idx_ops_tasks_agency_status ON ops.tasks(agency_id, status);

-- Unique external identifier mapper index for patient registry
CREATE INDEX idx_care_service_users_external ON care.service_users(agency_id, external_service_user_id) WHERE deleted_at IS NULL;

-- Fast validation performance index for incoming webhooks routing
CREATE INDEX idx_integration_webhook_log_idemp ON integration.webhook_logs(agency_id, idempotency_key);

-- DBS compliance checker lookups (expired vs active)
CREATE INDEX idx_dbs_verifications_status_expiry ON trader.dbs_verifications(trader_id, status, expiry_date);

-- Quick assignment lookups for admin queues
CREATE INDEX idx_ops_assignments_composite ON ops.assignments(task_id, trader_id, assignment_status);

-- Security Logs timestamps sequence tracking
CREATE INDEX idx_audit_logs_timestamp_agency ON audit.audit_logs(created_at DESC, agency_id);
CREATE INDEX idx_security_events_timestamp ON audit.security_events(created_at DESC);

-- Cache lookups for active authentication sessions
CREATE INDEX idx_auth_sessions_user_active ON auth.sessions(user_id, refresh_token_hash) WHERE revoked_at IS NULL;

-- Prefix keys for API dispatching authentication
CREATE INDEX idx_agency_api_keys_prefix ON tenant.agency_api_keys(key_prefix) WHERE revoked_at IS NULL AND (expires_at IS NULL OR expires_at > CLOCK_TIMESTAMP());


-- ============================================================================
--                           6. SEEDING STRATEGY (DEVELOPMENT ONLY)
-- ============================================================================

-- Establish 1 test tenant agency ("Primrose Care Services")
INSERT INTO tenant.agencies (id, name, slug, primary_contact_name, primary_contact_email, work_email_domain, status)
VALUES (
    'a0e0a0e0-a0e0-a0e0-a0e0-a0e0a0e0a0e0',
    'Primrose Care Services',
    'primrose-care',
    'Sarah Jenkins & Regional Leads',
    'lead@primrose.org',
    'primrose.org',
    'active'
);

INSERT INTO tenant.agency_settings (agency_id, vulnerable_adult_requires_enhanced_dbs, allow_carer_on_site_supervision, default_visit_radius_miles, completion_requires_care_confirmation)
VALUES ('a0e0a0e0-a0e0-a0e0-a0e0-a0e0a0e0a0e0', TRUE, TRUE, 12.50);

-- Insert public prefix reference API key (hash matches secret code generated locally)
INSERT INTO tenant.agency_api_keys (agency_id, key_prefix, key_hash, expires_at)
VALUES (
    'a0e0a0e0-a0e0-a0e0-a0e0-a0e0a0e0a0e0',
    'tb_live_agc101',
    '87df6a11eecba909819289aa89cb0d1a73fbed410b0fbac61ba909fbcd2f801a', -- Mock hashed secret
    '2030-01-01 00:00:00+00'
);

-- Seed role-based user authentication entries
-- All seed standard passwords are 'TaskBridgeAdminPassSecure!!' encrypt-ready
INSERT INTO auth.users (id, agency_id, full_name, email, email_domain, password_hash, password_algorithm, role, status)
VALUES 
    -- 1. Care Coordinator
    ('c001c001-c001-c001-c001-c001c001c001', 'a0e0a0e0-a0e0-a0e0-a0e0-a0e0a0e0a0e0', 'Claire Redfield', 'claire@primrose.org', 'primrose.org', '$scrypt$N=16384,r=8,p=1$uH3j1$01E7d2b8fe78dfab993f31ee', 'scrypt', 'care_coordinator', 'active'),
    -- 2. TaskBridge Admin
    ('a001a001-a001-a001-a001-a001a001a001', NULL, 'James Carter', 'james.carter@taskbridge.com', 'taskbridge.com', '$scrypt$N=16384,r=8,p=1$uH3j1$01E7d2b8fe78dfab993f31ee', 'scrypt', 'taskbridge_admin', 'active'),
    -- 3. Super Admin
    ('s001s001-s001-s001-s001-s001s001s001', NULL, 'Sarah Cooper', 'sarah.super@taskbridge.com', 'taskbridge.com', '$scrypt$N=16384,r=8,p=1$uH3j1$01E7d2b8fe78dfab993f31ee', 'scrypt', 'taskbridge_super_admin', 'active');

-- Seed two service users with mock encrypted PII structures using AES key "tb_kms_secret_london"
INSERT INTO care.service_users (id, agency_id, external_service_user_id, encrypted_name, encrypted_address, postcode_hash, lat, lng, risk_level, is_vulnerable)
VALUES 
    ('u001u001-u001-u001-u001-u001u001u001', 'a0e0a0e0-a0e0-a0e0-a0e0-a0e0a0e0a0e0', 'EXT-PAS-8812', 
     pgp_sym_encrypt('Eleanor Vance', 'tb_kms_secret_london'), 
     pgp_sym_encrypt('Flat 4B, Primrose Court, London SW1A 1AA', 'tb_kms_secret_london'), 
     sha256('SW1A 1AA'), 51.5014, -0.1419, 'vulnerable_adult', TRUE),
     
    ('u002u002-u002-u002-u002-u002u002u002', 'a0e0a0e0-a0e0-a0e0-a0e0-a0e0a0e0a0e0', 'EXT-PAS-7761', 
     pgp_sym_encrypt('Arthur Pendelton', 'tb_kms_secret_london'), 
     pgp_sym_encrypt('House 12, Sovereign Drive, London SW1Y 4QQ', 'tb_kms_secret_london'), 
     sha256('SW1Y 4QQ'), 51.5074, -0.1278, 'high_risk', TRUE);

-- Seed three traders with varying levels of qualification, DBS checkouts, and ratings
INSERT INTO trader.networks (id, name, provider_type, api_base_url, status)
VALUES ('n001n001-n001-n001-n001-n001n001n001', 'CareFix Pro Handymen Network', 'Handyman network B2B API', 'https://api.carefixhandymen.co.uk/v2', 'active');

INSERT INTO trader.traders (id, network_id, external_trader_id, display_name, encrypted_full_name, encrypted_mobile, email, source, lat, lng, postcode_area, hourly_rate, quality_score, status)
VALUES 
    -- 1. Fully vetted local worker
    ('t001t001-t001-t001-t001-t001t001t001', 'n001n001-n001-n001-n001-n001n001n001', 'CFP-1120', 'David Miller', pgp_sym_encrypt('David Miller', 'tb_kms_secret_london'), pgp_sym_encrypt('+447700900077', 'tb_kms_secret_london'), 'david.miller@homeshield.co.uk', 'internal', 51.5014, -0.1419, 'SW1A', 45.00, 4.80, 'active'),
    -- 2. Pending compliance re-eval worker
    ('t002t002-t002-t002-t002-t002t002t002', 'n001n001-n001-n001-n001-n001n001n001', 'CFP-1130', 'George Sterling', pgp_sym_encrypt('George Sterling', 'tb_kms_secret_london'), pgp_sym_encrypt('+447700900188', 'tb_kms_secret_london'), 'george@carefixhandymen.co.uk', 'internal', 51.5090, -0.1340, 'SW1Y', 50.00, 4.60, 'active'),
    -- 3. Suspended operator due to license default
    ('t003t003-t003-t003-t003-t003t003t003', 'n001n001-n001-n001-n001-n001n001n001', 'CFP-9921', 'Aiden Vance', pgp_sym_encrypt('Aiden Vance', 'tb_kms_secret_london'), pgp_sym_encrypt('+447700900222', 'tb_kms_secret_london'), 'aiden.vance@outage.com', 'internal', 51.4812, -0.1912, 'SW3', 38.00, 3.40, 'suspended');

-- Insert DBS statuses
INSERT INTO trader.dbs_verifications (trader_id, provider_session_id, status, outcome, expiry_date, evidence_reference)
VALUES 
    ('t001t001-t001-t001-t001-t001t001t001', 'DBS-SESS-9831A', 'approved', 'Clear', '2028-04-12', 'GOV-DBS-009831'),
    ('t002t002-t002-t002-t002-t002t002t002', 'DBS-SESS-7731E', 'pending', NULL, '2027-09-30', 'GOV-DBS-007731'),
    ('t003t003-t003-t003-t003-t003t003t003', 'DBS-SESS-8801C', 'rejected', 'Vulnerabilities flagged: Failure to comply', '2024-03-10', 'GOV-DBS-008801');

-- Trader skills matching
INSERT INTO trader.trader_services (trader_id, service_category)
VALUES 
    ('t001t001-t001-t001-t001-t001t001t001', 'Path clearing'),
    ('t001t001-t001-t001-t001-t001t001t001', 'Trip hazard removal'),
    ('t002t002-t002-t002-t002-t002t002t002', 'Loose rail repair');

-- Sample workflow logs (Task creation -> Assignment -> Dispatch -> Completion)
INSERT INTO ops.tasks (id, agency_id, service_user_id, category, urgency, status, care_worker_notes, ai_summary, ai_extracted_tasks_json)
VALUES (
    'e001e001-e001-e001-e001-e001e001e001',
    'a0e0a0e0-a0e0-a0e0-a0e0-a0e0a0e0a0e0',
    'u001u001-u001-u001-u001-u001u001u001',
    'Path clearing',
    'urgent',
    'dispatched',
    'Daughter reported high risk slip hazard: moss and algae on the main pathway starting from back door.',
    'Clear thick moss/algae slip hazard from main rear pathway to ensure safe exit.',
    '{"actions": ["scrape moss", "apply non-slip formula"], "safety_level": "Enhanced DBS Verified Required"}'::JSONB
);

INSERT INTO ops.task_status_events (task_id, agency_id, previous_status, new_status, reason)
VALUES ('e001e001-e001-e001-e001-e001e001e001', 'a0e0a0e0-a0e0-a0e0-a0e0-a0e0a0e0a0e0', 'draft', 'pending_taskbridge_assignment', 'Ingested via external CMS API webhook');

-- Create an active assignment & SMS token dispatch logic
INSERT INTO ops.assignments (id, task_id, agency_id, trader_id, assignment_status, distance_miles, quoted_price, dispatched_at)
VALUES (
    'f001f001-f001-f001-f001-f001f001f001',
    'e001e001-e001-e001-e001-e001e001e001',
    'a0e0a0e0-a0e0-a0e0-a0e0-a0e0a0e0a0e0',
    't001t001-t001-t001-t001-t001t001t001',
    'dispatched',
    1.20,
    45.00,
    CLOCK_TIMESTAMP() - INTERVAL '2 hours'
);

INSERT INTO ops.visits (id, task_id, agency_id, assignment_id, trader_id, visit_status, scheduled_window)
VALUES (
    'v001v001-v001-v001-v001-v001v001v001',
    'e001e001-e001-e001-e001-e001e001e001',
    'a0e0a0e0-a0e0-a0e0-a0e0-a0e0a0e0a0e0',
    'f001f001-f001-f001-f001-f001f001f001',
    't001t001-t001-t001-t001-t001t001t001',
    'link_sent',
    'Morning (09:00 - 12:00)'
);

INSERT INTO ops.visit_tokens (visit_id, task_id, token_hash, expires_at)
VALUES (
    'v001v001-v001-v001-v001-v001v001v001',
    'e001e001-e001-e001-e001-e001e001e001',
    'f3ca98ea32ffff12ca923bb65878da6ccc72411eeac83a99bb8b839aa8df920c', -- SHA-256 secure hash for "vst_test_token_code"
    CLOCK_TIMESTAMP() + INTERVAL '24 hours'
);
