
-- Create database schema for SecTracker
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE bug_severity AS ENUM ('Critical', 'High', 'Medium', 'Low', 'Informational');
CREATE TYPE bug_status AS ENUM ('Draft', 'Submitted', 'Triaged', 'Accepted', 'Duplicate', 'Not Applicable', 'Resolved', 'Bounty Awarded');
CREATE TYPE platform_type AS ENUM ('bug_bounty', 'vdp', 'private', 'ctf');

-- Create tables
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT,
    last_name TEXT,
    username TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE platforms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    url TEXT,
    platform_type platform_type NOT NULL DEFAULT 'bug_bounty',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    company TEXT NOT NULL,
    scope TEXT NOT NULL,
    platform_id UUID REFERENCES platforms(id),
    program_url TEXT,
    min_bounty NUMERIC,
    max_bounty NUMERIC,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE bugs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    severity bug_severity NOT NULL,
    status bug_status NOT NULL DEFAULT 'Draft',
    vulnerability_type TEXT,
    impact_description TEXT,
    poc_steps TEXT,
    remediation_suggestion TEXT,
    program_id UUID REFERENCES programs(id),
    user_id UUID NOT NULL,
    submission_date DATE,
    resolution_date DATE,
    bounty_amount NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE personal_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE security_checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    checklist_type TEXT NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE checklist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text TEXT NOT NULL,
    checklist_id UUID REFERENCES security_checklists(id),
    is_completed BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE security_tips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    tags TEXT[],
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE useful_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    category TEXT,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE link_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE reading_list (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    category TEXT,
    priority INTEGER DEFAULT 1,
    is_read BOOLEAN DEFAULT false,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE rss_feeds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE rss_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    link TEXT NOT NULL,
    description TEXT,
    author TEXT,
    pub_date TIMESTAMP WITH TIME ZONE,
    guid TEXT,
    feed_id UUID REFERENCES rss_feeds(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_platform_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT NOT NULL,
    platform_id UUID REFERENCES platforms(id),
    user_id UUID NOT NULL,
    profile_url TEXT,
    reputation_points INTEGER DEFAULT 0,
    rank_position TEXT,
    total_bounties_earned NUMERIC DEFAULT 0,
    bugs_submitted INTEGER DEFAULT 0,
    bugs_accepted INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_rss_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    feed_id UUID REFERENCES rss_feeds(id),
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data
INSERT INTO platforms (name, platform_type, description) VALUES
('HackerOne', 'bug_bounty', 'Leading bug bounty platform'),
('Bugcrowd', 'bug_bounty', 'Crowdsourced security platform'),
('Intigriti', 'bug_bounty', 'European bug bounty platform'),
('YesWeHack', 'bug_bounty', 'Global bug bounty platform');

INSERT INTO rss_feeds (name, url, category, is_default) VALUES
('Security News', 'https://feeds.feedburner.com/oreilly/security', 'Security', true),
('Krebs on Security', 'https://krebsonsecurity.com/feed/', 'Security', true),
('The Hacker News', 'https://feeds.feedburner.com/TheHackersNews', 'Security', true);
