
-- Complete PostgreSQL Schema for SecTracker Application
-- This file contains the complete database structure and sample data

-- Create database (uncomment if creating fresh database)
-- CREATE DATABASE sectracker;
-- \c sectracker;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom enum types
DO $$ BEGIN
    CREATE TYPE bug_severity AS ENUM ('Critical', 'High', 'Medium', 'Low', 'Informational');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE bug_status AS ENUM ('Draft', 'Submitted', 'Triaged', 'Accepted', 'Duplicate', 'Not Applicable', 'Resolved', 'Bounty Awarded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE platform_type AS ENUM ('bug_bounty', 'vdp', 'private', 'ctf');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create auth schema and users table (for standalone PostgreSQL)
CREATE SCHEMA IF NOT EXISTS auth;

-- Create users table for authentication (simplified version)
CREATE TABLE IF NOT EXISTS auth.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    encrypted_password TEXT,
    email_confirmed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    raw_user_meta_data JSONB DEFAULT '{}'
);

-- Create main application tables
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    username TEXT UNIQUE,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.platforms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    url TEXT,
    platform_type platform_type NOT NULL DEFAULT 'bug_bounty',
    description TEXT,
    favicon_url TEXT,
    category TEXT DEFAULT 'Public',
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    company TEXT NOT NULL,
    scope TEXT NOT NULL,
    platform_id UUID REFERENCES public.platforms(id) ON DELETE SET NULL,
    program_url TEXT,
    logo_url TEXT,
    program_type TEXT DEFAULT 'Public Bug Bounty Programs' CHECK (program_type IN ('Public Bug Bounty Programs', 'Private', 'VDP')),
    management_type TEXT DEFAULT 'Not Managed' CHECK (management_type IN ('Managed', 'Not Managed')),
    min_bounty NUMERIC,
    max_bounty NUMERIC,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bugs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    severity bug_severity NOT NULL,
    status bug_status NOT NULL DEFAULT 'Draft',
    vulnerability_type TEXT,
    impact_description TEXT,
    poc_steps TEXT,
    remediation_suggestion TEXT,
    program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    submission_date DATE,
    resolution_date DATE,
    bounty_amount NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.personal_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.security_checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    checklist_type TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.checklist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text TEXT NOT NULL,
    checklist_id UUID REFERENCES public.security_checklists(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.security_tips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    tags TEXT[],
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.useful_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    category TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.link_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(name, user_id)
);

CREATE TABLE IF NOT EXISTS public.reading_list (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    category TEXT,
    priority INTEGER DEFAULT 1,
    is_read BOOLEAN DEFAULT false,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rss_feeds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rss_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    link TEXT NOT NULL,
    description TEXT,
    author TEXT,
    pub_date TIMESTAMP WITH TIME ZONE,
    guid TEXT UNIQUE,
    feed_id UUID REFERENCES public.rss_feeds(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_platform_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT NOT NULL,
    platform_id UUID REFERENCES public.platforms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_url TEXT,
    reputation_points INTEGER DEFAULT 0,
    rank_position TEXT,
    total_bounties_earned NUMERIC DEFAULT 0,
    bugs_submitted INTEGER DEFAULT 0,
    bugs_accepted INTEGER DEFAULT 0,
    api_credentials JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, platform_id)
);

CREATE TABLE IF NOT EXISTS public.user_rss_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    feed_id UUID REFERENCES public.rss_feeds(id) ON DELETE CASCADE,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, feed_id)
);

CREATE TABLE IF NOT EXISTS public.bounty_targets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    target_amount NUMERIC NOT NULL,
    current_amount NUMERIC DEFAULT 0,
    deadline DATE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bugs_user_id ON public.bugs(user_id);
CREATE INDEX IF NOT EXISTS idx_bugs_program_id ON public.bugs(program_id);
CREATE INDEX IF NOT EXISTS idx_bugs_status ON public.bugs(status);
CREATE INDEX IF NOT EXISTS idx_bugs_severity ON public.bugs(severity);
CREATE INDEX IF NOT EXISTS idx_programs_platform_id ON public.programs(platform_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_checklist_id ON public.checklist_items(checklist_id);
CREATE INDEX IF NOT EXISTS idx_security_checklists_user_id ON public.security_checklists(user_id);
CREATE INDEX IF NOT EXISTS idx_rss_articles_feed_id ON public.rss_articles(feed_id);
CREATE INDEX IF NOT EXISTS idx_user_platform_profiles_user_id ON public.user_platform_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_platform_profiles_platform_id ON public.user_platform_profiles(platform_id);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_platform_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.useful_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bounty_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rss_subscriptions ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user ID (for standalone PostgreSQL)
CREATE OR REPLACE FUNCTION auth.uid() RETURNS UUID AS $$
BEGIN
    -- In a real application, this would get the current user from session
    -- For development/testing, we'll return the first user
    RETURN (SELECT id FROM auth.users LIMIT 1);
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for bugs
DROP POLICY IF EXISTS "Users can view their own bugs" ON public.bugs;
CREATE POLICY "Users can view their own bugs" ON public.bugs
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own bugs" ON public.bugs;
CREATE POLICY "Users can create their own bugs" ON public.bugs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own bugs" ON public.bugs;
CREATE POLICY "Users can update their own bugs" ON public.bugs
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own bugs" ON public.bugs;
CREATE POLICY "Users can delete their own bugs" ON public.bugs
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for programs (public read, authenticated write)
DROP POLICY IF EXISTS "Everyone can view programs" ON public.programs;
CREATE POLICY "Everyone can view programs" ON public.programs
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create programs" ON public.programs;
CREATE POLICY "Authenticated users can create programs" ON public.programs
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update programs" ON public.programs;
CREATE POLICY "Authenticated users can update programs" ON public.programs
    FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can delete programs" ON public.programs;
CREATE POLICY "Authenticated users can delete programs" ON public.programs
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create RLS policies for platforms (public read, authenticated write)
DROP POLICY IF EXISTS "Everyone can view platforms" ON public.platforms;
CREATE POLICY "Everyone can view platforms" ON public.platforms
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create platforms" ON public.platforms;
CREATE POLICY "Authenticated users can create platforms" ON public.platforms
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update platforms" ON public.platforms;
CREATE POLICY "Authenticated users can update platforms" ON public.platforms
    FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can delete platforms" ON public.platforms;
CREATE POLICY "Authenticated users can delete platforms" ON public.platforms
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create RLS policies for security checklists
DROP POLICY IF EXISTS "Users can view their own checklists" ON public.security_checklists;
CREATE POLICY "Users can view their own checklists" ON public.security_checklists
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own checklists" ON public.security_checklists;
CREATE POLICY "Users can create their own checklists" ON public.security_checklists
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own checklists" ON public.security_checklists;
CREATE POLICY "Users can update their own checklists" ON public.security_checklists
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own checklists" ON public.security_checklists;
CREATE POLICY "Users can delete their own checklists" ON public.security_checklists
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for checklist items
DROP POLICY IF EXISTS "Users can view checklist items" ON public.checklist_items;
CREATE POLICY "Users can view checklist items" ON public.checklist_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.security_checklists 
            WHERE id = checklist_items.checklist_id 
            AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can create checklist items" ON public.checklist_items;
CREATE POLICY "Users can create checklist items" ON public.checklist_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.security_checklists 
            WHERE id = checklist_items.checklist_id 
            AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update checklist items" ON public.checklist_items;
CREATE POLICY "Users can update checklist items" ON public.checklist_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.security_checklists 
            WHERE id = checklist_items.checklist_id 
            AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete checklist items" ON public.checklist_items;
CREATE POLICY "Users can delete checklist items" ON public.checklist_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.security_checklists 
            WHERE id = checklist_items.checklist_id 
            AND user_id = auth.uid()
        )
    );

-- Create RLS policies for other user-specific tables
DROP POLICY IF EXISTS "Users can manage their own notes" ON public.personal_notes;
CREATE POLICY "Users can manage their own notes" ON public.personal_notes
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own tips" ON public.security_tips;
CREATE POLICY "Users can manage their own tips" ON public.security_tips
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own links" ON public.useful_links;
CREATE POLICY "Users can manage their own links" ON public.useful_links
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own link categories" ON public.link_categories;
CREATE POLICY "Users can manage their own link categories" ON public.link_categories
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own reading list" ON public.reading_list;
CREATE POLICY "Users can manage their own reading list" ON public.reading_list
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own bounty targets" ON public.bounty_targets;
CREATE POLICY "Users can manage their own bounty targets" ON public.bounty_targets
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own platform profiles" ON public.user_platform_profiles;
CREATE POLICY "Users can manage their own platform profiles" ON public.user_platform_profiles
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own rss subscriptions" ON public.user_rss_subscriptions;
CREATE POLICY "Users can manage their own rss subscriptions" ON public.user_rss_subscriptions
    USING (auth.uid() = user_id);

-- Create trigger function for handling new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data ->> 'first_name',
        NEW.raw_user_meta_data ->> 'last_name'
    );
    RETURN NEW;
END;
$$;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample data
INSERT INTO public.platforms (name, platform_type, description, category) VALUES
('HackerOne', 'bug_bounty', 'Leading bug bounty platform with thousands of programs', 'Public'),
('Bugcrowd', 'bug_bounty', 'Crowdsourced security platform connecting businesses with security researchers', 'Public'),
('Intigriti', 'bug_bounty', 'European bug bounty platform with focus on quality', 'Public'),
('YesWeHack', 'bug_bounty', 'Global bug bounty platform with presence in Europe and Asia', 'Public'),
('Synack', 'bug_bounty', 'Invite-only bug bounty platform with vetted researchers', 'Private'),
('Open Bug Bounty', 'vdp', 'Free vulnerability disclosure platform', 'Public')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.rss_feeds (name, url, category, description, is_default) VALUES
('Krebs on Security', 'https://krebsonsecurity.com/feed/', 'Security News', 'In-depth security news and investigation', true),
('The Hacker News', 'https://feeds.feedburner.com/TheHackersNews', 'Security News', 'Latest cybersecurity news and updates', true),
('Threatpost', 'https://threatpost.com/feed/', 'Security News', 'Information security news, analysis and research', true),
('Security Week', 'https://www.securityweek.com/feed', 'Security News', 'Information security news for executives', true),
('Schneier on Security', 'https://www.schneier.com/blog/atom.xml', 'Security Analysis', 'Security analysis and commentary by Bruce Schneier', true),
('SANS Internet Storm Center', 'https://isc.sans.edu/rssfeed.xml', 'Threat Intelligence', 'Daily network security monitoring and threat detection', true)
ON CONFLICT (url) DO NOTHING;

-- Insert sample user (for testing)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data) VALUES
('00000000-0000-0000-0000-000000000001', 'demo@sectracker.com', '$2a$10$dummy_encrypted_password', NOW(), '{"first_name": "Demo", "last_name": "User"}')
ON CONFLICT (email) DO NOTHING;

-- Insert corresponding profile
INSERT INTO public.profiles (id, first_name, last_name, username) VALUES
('00000000-0000-0000-0000-000000000001', 'Demo', 'User', 'demo_user')
ON CONFLICT (id) DO NOTHING;

-- Create sample programs
DO $$
DECLARE
    hackerone_id UUID;
    bugcrowd_id UUID;
BEGIN
    SELECT id INTO hackerone_id FROM public.platforms WHERE name = 'HackerOne' LIMIT 1;
    SELECT id INTO bugcrowd_id FROM public.platforms WHERE name = 'Bugcrowd' LIMIT 1;

    IF hackerone_id IS NOT NULL THEN
        INSERT INTO public.programs (name, company, scope, platform_id, program_url, min_bounty, max_bounty, program_type, management_type) VALUES
        ('Shopify', 'Shopify Inc.', '*.shopify.com, *.myshopify.com', hackerone_id, 'https://hackerone.com/shopify', 500, 25000, 'Public Bug Bounty Programs', 'Managed'),
        ('GitLab', 'GitLab Inc.', 'gitlab.com, *.gitlab.com', hackerone_id, 'https://hackerone.com/gitlab', 100, 12000, 'Public Bug Bounty Programs', 'Managed')
        ON CONFLICT DO NOTHING;
    END IF;

    IF bugcrowd_id IS NOT NULL THEN
        INSERT INTO public.programs (name, company, scope, platform_id, program_url, min_bounty, max_bounty, program_type, management_type) VALUES
        ('Tesla', 'Tesla Inc.', 'tesla.com, *.tesla.com', bugcrowd_id, 'https://bugcrowd.com/tesla', 25, 15000, 'Public Bug Bounty Programs', 'Managed')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Insert sample security checklists
INSERT INTO public.security_checklists (id, name, description, checklist_type, user_id) VALUES
('11111111-1111-1111-1111-111111111111', 'Web Application Security Checklist', 'Comprehensive security testing for web applications', 'web', '00000000-0000-0000-0000-000000000001'),
('22222222-2222-2222-2222-222222222222', 'Mobile Application Security Checklist', 'Security testing checklist for mobile applications', 'mobile', '00000000-0000-0000-0000-000000000001'),
('33333333-3333-3333-3333-333333333333', 'API Security Testing Checklist', 'Security testing checklist for APIs', 'api', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Insert sample checklist items
INSERT INTO public.checklist_items (text, checklist_id, is_completed, order_index) VALUES
('**SQL Injection Testing**

Test for SQL injection vulnerabilities in all input fields and parameters:
- Test numeric, string, and boolean parameters
- Test headers, cookies, and POST data
- Use both error-based and blind SQL injection techniques', '11111111-1111-1111-1111-111111111111', false, 1),

('**Cross-Site Scripting (XSS)**

Test for all types of XSS vulnerabilities:
- **Reflected XSS**: Test all input parameters for reflection
- **Stored XSS**: Test data persistence areas like comments, profiles
- **DOM-based XSS**: Review client-side JavaScript for unsafe DOM manipulation', '11111111-1111-1111-1111-111111111111', false, 2),

('**Cross-Site Request Forgery (CSRF)**

Test for CSRF vulnerabilities:
- Check if sensitive actions require CSRF tokens
- Test token validation and randomness
- Verify SameSite cookie attributes', '11111111-1111-1111-1111-111111111111', false, 3),

('**Authentication & Session Management**

Test authentication mechanisms:
- Test for weak password policies
- Check for session fixation vulnerabilities
- Verify proper session invalidation on logout
- Test for concurrent session handling', '11111111-1111-1111-1111-111111111111', false, 4),

('**Insecure Data Storage**

Test for insecure data storage on mobile devices:
- Check local databases (SQLite, Realm)
- Examine shared preferences/user defaults
- Review log files and crash reports
- Test backup and restore functionality', '22222222-2222-2222-2222-222222222222', false, 1),

('**Weak Cryptography**

Assess cryptographic implementations:
- Review encryption algorithms used
- Check key management practices
- Test random number generation
- Verify certificate pinning implementation', '22222222-2222-2222-2222-222222222222', false, 2),

('**Authentication Mechanisms**

Test API authentication:
- Verify JWT token security
- Test OAuth implementation
- Check API key management
- Assess multi-factor authentication', '33333333-3333-3333-3333-333333333333', false, 1),

('**Authorization Controls**

Test API authorization:
- Verify role-based access controls
- Test horizontal privilege escalation
- Check vertical privilege escalation
- Test resource-based permissions', '33333333-3333-3333-3333-333333333333', false, 2)
ON CONFLICT DO NOTHING;

-- Create helpful views
CREATE OR REPLACE VIEW public.bug_summary AS
SELECT 
    b.id,
    b.title,
    b.severity,
    b.status,
    b.bounty_amount,
    p.name as program_name,
    pl.name as platform_name,
    b.created_at
FROM public.bugs b
LEFT JOIN public.programs p ON b.program_id = p.id
LEFT JOIN public.platforms pl ON p.platform_id = pl.id;

CREATE OR REPLACE VIEW public.checklist_progress AS
SELECT 
    sc.id,
    sc.name,
    sc.checklist_type,
    COUNT(ci.id) as total_items,
    COUNT(CASE WHEN ci.is_completed THEN 1 END) as completed_items,
    CASE 
        WHEN COUNT(ci.id) > 0 THEN 
            ROUND((COUNT(CASE WHEN ci.is_completed THEN 1 END) * 100.0 / COUNT(ci.id)), 2)
        ELSE 0 
    END as completion_percentage
FROM public.security_checklists sc
LEFT JOIN public.checklist_items ci ON sc.id = ci.checklist_id
GROUP BY sc.id, sc.name, sc.checklist_type;

-- Grant necessary permissions (for standalone PostgreSQL)
GRANT USAGE ON SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres;

-- Final cleanup and optimization
VACUUM ANALYZE;

-- Print completion message
DO $$
BEGIN
    RAISE NOTICE 'SecTracker database schema has been successfully created and populated with sample data.';
    RAISE NOTICE 'Database includes % platforms, % programs, % checklists, and % checklist items.',
        (SELECT COUNT(*) FROM public.platforms),
        (SELECT COUNT(*) FROM public.programs),
        (SELECT COUNT(*) FROM public.security_checklists),
        (SELECT COUNT(*) FROM public.checklist_items);
END $$;
