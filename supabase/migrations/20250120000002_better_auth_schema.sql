-- Better Auth required tables
-- This migration adds the necessary tables for Better Auth

-- Users table (Better Auth format)
CREATE TABLE IF NOT EXISTS auth.better_auth_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table
CREATE TABLE IF NOT EXISTS auth.better_auth_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    token TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT,
    user_id UUID NOT NULL REFERENCES auth.better_auth_users(id) ON DELETE CASCADE
);

-- Accounts table (for social providers and credentials)
CREATE TABLE IF NOT EXISTS auth.better_auth_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.better_auth_users(id) ON DELETE CASCADE,
    access_token TEXT,
    refresh_token TEXT,
    id_token TEXT,
    access_token_expires_at TIMESTAMP WITH TIME ZONE,
    refresh_token_expires_at TIMESTAMP WITH TIME ZONE,
    scope TEXT,
    password TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verifications table (for email verification, password reset, etc.)
CREATE TABLE IF NOT EXISTS auth.better_auth_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_better_auth_sessions_user_id ON auth.better_auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_better_auth_sessions_token ON auth.better_auth_sessions(token);
CREATE INDEX IF NOT EXISTS idx_better_auth_accounts_user_id ON auth.better_auth_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_better_auth_accounts_provider ON auth.better_auth_accounts(provider_id, account_id);
CREATE INDEX IF NOT EXISTS idx_better_auth_verifications_identifier ON auth.better_auth_verifications(identifier);

-- Function to sync Better Auth users with existing profiles table
CREATE OR REPLACE FUNCTION sync_better_auth_user_to_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert or update the profile when a Better Auth user is created/updated
    INSERT INTO public.profiles (id, username, email, avatar_url, created_at, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.name, split_part(NEW.email, '@', 1)),
        NEW.email,
        NEW.image,
        NEW.created_at,
        NEW.updated_at
    )
    ON CONFLICT (id) DO UPDATE SET
        username = COALESCE(NEW.name, split_part(NEW.email, '@', 1)),
        email = NEW.email,
        avatar_url = NEW.image,
        updated_at = NEW.updated_at;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to sync Better Auth users with profiles
CREATE OR REPLACE TRIGGER sync_better_auth_user_trigger
    AFTER INSERT OR UPDATE ON auth.better_auth_users
    FOR EACH ROW
    EXECUTE FUNCTION sync_better_auth_user_to_profile();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON auth.better_auth_users TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON auth.better_auth_sessions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON auth.better_auth_accounts TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON auth.better_auth_verifications TO anon, authenticated;