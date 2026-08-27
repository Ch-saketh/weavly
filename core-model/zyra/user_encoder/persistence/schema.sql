-- ==============================================================================
-- Zyra User Encoder Persistence Schema (Phase U7)
-- ==============================================================================

-- 1. Enable pgvector extension for future direct vector queries / fallback
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. User Zyra Representation Table (Structured JSONB & Qdrant Reference)
CREATE TABLE IF NOT EXISTS user_zyra_representations (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    unified_user_representation JSONB NOT NULL,
    embedding_reference JSONB NOT NULL,
    representation_generation_id UUID NOT NULL,
    representation_version VARCHAR(32) NOT NULL,
    fusion_version VARCHAR(32) NOT NULL,
    encoder_versions JSONB NOT NULL,
    synchronization_status VARCHAR(32) NOT NULL DEFAULT 'SYNCHRONIZED',
    generated_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

-- Unique index on userId ensures exactly one current active representation per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_zyra_rep_user_id 
    ON user_zyra_representations (user_id);

CREATE INDEX IF NOT EXISTS idx_user_zyra_rep_gen_id 
    ON user_zyra_representations (representation_generation_id);

-- 3. Beta Recommendation Storage Table (User-specific product recommendations)
CREATE TABLE IF NOT EXISTS user_recommendations (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    product_id UUID NOT NULL,
    score DOUBLE PRECISION NOT NULL,
    rank INT NOT NULL,
    reason TEXT,
    recommendation_metadata JSONB,
    recommendation_version VARCHAR(32) NOT NULL DEFAULT 'v0-beta',
    model_version VARCHAR(32) NOT NULL DEFAULT 'v0-beta',
    status VARCHAR(32) NOT NULL DEFAULT 'CURRENT',
    generated_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_recs_user_status 
    ON user_recommendations (user_id, status);

CREATE INDEX IF NOT EXISTS idx_user_recs_product_id 
    ON user_recommendations (product_id);
