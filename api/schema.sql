-- Ignite Health Database Schema
-- Epic 00: Foundation & Authentication

-- Create pii schema for personally identifiable information
CREATE SCHEMA IF NOT EXISTS pii;

-- User profile table (isolated in pii schema)
CREATE TABLE IF NOT EXISTS pii.user_profile (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    mobile TEXT,
    zipcode TEXT,
    birth_month INTEGER CHECK (birth_month >= 1 AND birth_month <= 12),
    birth_year INTEGER CHECK (birth_year >= 1900 AND birth_year <= 2100),
    display_name TEXT,
    handle TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Profile properties (key-value extensions)
CREATE TABLE IF NOT EXISTS pii.user_profile_properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES pii.user_profile(user_id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    value_json JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, key)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_profile_handle ON pii.user_profile(handle);
CREATE INDEX IF NOT EXISTS idx_user_profile_properties_user_id ON pii.user_profile_properties(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profile_properties_key ON pii.user_profile_properties(key);

-- Updated timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_user_profile_updated_at ON pii.user_profile;
CREATE TRIGGER update_user_profile_updated_at
    BEFORE UPDATE ON pii.user_profile
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profile_properties_updated_at ON pii.user_profile_properties;
CREATE TRIGGER update_user_profile_properties_updated_at
    BEFORE UPDATE ON pii.user_profile_properties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE pii.user_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE pii.user_profile_properties ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own profile
DROP POLICY IF EXISTS user_profile_select_own ON pii.user_profile;
CREATE POLICY user_profile_select_own ON pii.user_profile
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS user_profile_update_own ON pii.user_profile;
CREATE POLICY user_profile_update_own ON pii.user_profile
    FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS user_profile_insert_own ON pii.user_profile;
CREATE POLICY user_profile_insert_own ON pii.user_profile
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can only read/write their own properties
DROP POLICY IF EXISTS user_profile_properties_select_own ON pii.user_profile_properties;
CREATE POLICY user_profile_properties_select_own ON pii.user_profile_properties
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS user_profile_properties_insert_own ON pii.user_profile_properties;
CREATE POLICY user_profile_properties_insert_own ON pii.user_profile_properties
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_profile_properties_update_own ON pii.user_profile_properties;
CREATE POLICY user_profile_properties_update_own ON pii.user_profile_properties
    FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS user_profile_properties_delete_own ON pii.user_profile_properties;
CREATE POLICY user_profile_properties_delete_own ON pii.user_profile_properties
    FOR DELETE
    USING (auth.uid() = user_id);
