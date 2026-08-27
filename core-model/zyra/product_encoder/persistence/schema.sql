-- ==============================================================================
-- Zyra Product Encoder Persistence Schema (Phase P7)
-- ==============================================================================

-- 1. Enable pgvector extension if not exists
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Product Profiles Table (Canonical Structured JSONB Intelligence & Versioning)
CREATE TABLE IF NOT EXISTS zyra_product_profiles (
    product_id VARCHAR(255) PRIMARY KEY,
    product_profile JSONB NOT NULL,
    schema_version VARCHAR(32) NOT NULL DEFAULT 'v1',
    encoder_version VARCHAR(32) NOT NULL DEFAULT 'v0-foundation',
    fusion_version VARCHAR(32) NOT NULL DEFAULT 'v0-foundation',
    embedding_version VARCHAR(32) NOT NULL DEFAULT 'v0-foundation',
    synchronization_status VARCHAR(32) NOT NULL DEFAULT 'SYNCHRONIZED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index on updated_at for cache freshness and synchronization tracking
CREATE INDEX IF NOT EXISTS idx_zyra_product_profiles_updated_at 
    ON zyra_product_profiles (updated_at);
