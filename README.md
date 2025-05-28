
# Security Bug Bounty Tracker

A comprehensive web application for security researchers to track bug bounty hunting activities, manage platform profiles, organize bug reports, and stay updated with security news.

## Features

### Core Functionality
- **Dashboard**: Overview of all activities with drag-and-drop customizable cards
- **Platform Profiles**: Manage profiles across different bug bounty platforms
- **Bug Reports**: Create, edit, archive, and track vulnerability reports
- **Program Management**: Track bug bounty programs and their details
- **Reading List**: Save and organize security articles and writeups
- **RSS Feeds**: Stay updated with latest security news
- **Security Checklists**: Create and manage testing checklists
- **Security Tips**: Store and organize personal security knowledge
- **Personal Notes**: Take and organize notes with markdown support

### Technical Features
- **Authentication**: Secure user authentication with Supabase Auth
- **Real-time Updates**: Live data synchronization
- **Responsive Design**: Mobile-friendly interface
- **Data Export**: Export data for backup and analysis
- **Search & Filtering**: Advanced filtering across all modules
- **Dark Theme**: Professional dark interface optimized for long sessions

## Technology Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - High-quality UI components
- **Lucide React** - Beautiful icons
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Row Level Security (RLS)
  - Real-time subscriptions
  - Edge Functions
  - Authentication
  - File storage

### Build Tools
- **Vite** - Fast build tool and dev server
- **ESLint** - Code linting
- **PostCSS** - CSS processing

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd security-bug-bounty-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following environment variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   - Create a new Supabase project
   - Run the database schema (see Database Schema section)
   - Configure authentication providers

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

## Database Schema

The application uses a PostgreSQL database with the following main tables:

### Core Tables
- `profiles` - User profile information
- `platforms` - Bug bounty platforms (HackerOne, Bugcrowd, etc.)
- `user_platform_profiles` - User profiles on different platforms
- `programs` - Bug bounty programs
- `bugs` - Bug reports and vulnerability tracking

### Content Tables
- `security_checklists` - Testing checklists
- `checklist_items` - Individual checklist items
- `security_tips` - User's security tips and knowledge
- `personal_notes` - User notes with markdown support
- `reading_list` - Saved articles and writeups
- `useful_links` - Organized bookmark collection

### RSS Tables
- `rss_feeds` - RSS feed sources
- `rss_articles` - Fetched RSS articles
- `user_rss_subscriptions` - User RSS subscriptions

## Deployment

### Docker Deployment

1. **Build the Docker image**
   ```bash
   docker build -t security-tracker .
   ```

2. **Run the container**
   ```bash
   docker run -p 3000:3000 \
     -e VITE_SUPABASE_URL=your_supabase_url \
     -e VITE_SUPABASE_ANON_KEY=your_supabase_anon_key \
     security-tracker
   ```

### Docker Compose

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - VITE_SUPABASE_URL=your_supabase_url
      - VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Production Deployment

#### Vercel
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

#### Netlify
1. Connect repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables

#### Traditional Hosting
1. Build the application: `npm run build`
2. Upload `dist` folder to your web server
3. Configure web server to serve `index.html` for all routes

## API Documentation

### Supabase Edge Functions

#### fetch-rss-feeds
Fetches and parses RSS feeds, storing articles in the database.

**Endpoint**: `/functions/v1/fetch-rss-feeds`
**Method**: POST
**Authentication**: Required

### Database API

All database operations use Supabase's auto-generated REST API with Row Level Security (RLS) policies ensuring users can only access their own data.

## Security

### Authentication
- Secure authentication via Supabase Auth
- Email/password and OAuth providers supported
- JWT-based session management

### Data Security
- Row Level Security (RLS) on all user data
- Encrypted data transmission (HTTPS)
- Secure API endpoints
- Input validation and sanitization

### Privacy
- Users can only access their own data
- No data sharing between users
- Optional data export for user control

## Development

### Project Structure
```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   └── ...             # Feature-specific components
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
├── lib/                # Utility functions
├── pages/              # Page components
└── main.tsx           # Application entry point
```

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Conventional commits for git history

### Testing
```bash
npm run test          # Run tests
npm run test:coverage # Run tests with coverage
```

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Environment Variables

### Required
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

### Optional
- `VITE_APP_TITLE` - Custom application title
- `VITE_SENTRY_DSN` - Sentry error tracking DSN

## Troubleshooting

### Common Issues

1. **Build Errors**
   - Ensure Node.js version is 18+
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`

2. **Database Connection Issues**
   - Verify Supabase URL and API key
   - Check if RLS policies are configured correctly
   - Ensure user is authenticated

3. **RSS Feed Issues**
   - Check if Edge Function is deployed
   - Verify RSS feed URLs are valid
   - Check Edge Function logs in Supabase dashboard

### Support

For support and questions:
1. Check the documentation
2. Search existing GitHub issues
3. Create a new issue with detailed information

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Supabase for the backend infrastructure
- Shadcn/UI for the beautiful components
- Tailwind CSS for the styling system
- React team for the amazing framework
```

Now I'll create the Dockerfile:

<lov-write file_path="Dockerfile">
# Build stage
FROM node:18-alpine as builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

Now I'll create the nginx configuration:

<lov-write file_path="nginx.conf">
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    # Basic settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        application/javascript
        application/json
        application/xml
        text/css
        text/javascript
        text/plain
        text/xml;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    server {
        listen 80;
        listen [::]:80;
        server_name _;

        root /usr/share/nginx/html;
        index index.html index.htm;

        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Cache HTML files for a shorter period
        location ~* \.html$ {
            expires 1h;
            add_header Cache-Control "public";
        }

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        # Security: Don't serve hidden files
        location ~ /\. {
            deny all;
        }

        # Security: Don't serve source maps in production
        location ~ \.map$ {
            deny all;
        }
    }
}
```

Now I'll create a docker-compose file for easier deployment:

<lov-write file_path="docker-compose.yml">
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Optional: Add a reverse proxy for HTTPS
  nginx-proxy:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx-proxy.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/ssl:ro
    depends_on:
      - app
    restart: unless-stopped
    profiles:
      - production

# Optional: Networks for better isolation
networks:
  default:
    driver: bridge
```

Finally, I'll create the complete database schema file:

<lov-write file_path="database-schema.sql">
-- Security Bug Bounty Tracker - Complete Database Schema
-- This file contains the complete database schema for the application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE platform_type AS ENUM ('bug_bounty', 'vdp', 'private', 'ctf');
CREATE TYPE bug_severity AS ENUM ('Critical', 'High', 'Medium', 'Low', 'Informational');
CREATE TYPE bug_status AS ENUM ('Draft', 'Submitted', 'Triaged', 'Accepted', 'Duplicate', 'Not Applicable', 'Resolved', 'Bounty Awarded');

-- User profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    username TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Platforms table (bug bounty platforms like HackerOne, Bugcrowd, etc.)
CREATE TABLE IF NOT EXISTS public.platforms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT,
    platform_type platform_type DEFAULT 'bug_bounty',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User platform profiles (user's profile on each platform)
CREATE TABLE IF NOT EXISTS public.user_platform_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    platform_id UUID REFERENCES public.platforms,
    username TEXT NOT NULL,
    profile_url TEXT,
    reputation_points INTEGER DEFAULT 0,
    rank_position TEXT,
    total_bounties_earned NUMERIC DEFAULT 0,
    bugs_submitted INTEGER DEFAULT 0,
    bugs_accepted INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Programs table (bug bounty programs)
CREATE TABLE IF NOT EXISTS public.programs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    platform_id UUID REFERENCES public.platforms,
    name TEXT NOT NULL,
    company TEXT NOT NULL,
    scope TEXT NOT NULL,
    max_bounty NUMERIC,
    min_bounty NUMERIC,
    program_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bugs table (vulnerability reports)
CREATE TABLE IF NOT EXISTS public.bugs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    program_id UUID REFERENCES public.programs,
    title TEXT NOT NULL,
    description TEXT,
    severity bug_severity NOT NULL,
    status bug_status DEFAULT 'Draft',
    vulnerability_type TEXT,
    poc_steps TEXT,
    impact_description TEXT,
    remediation_suggestion TEXT,
    bounty_amount NUMERIC,
    submission_date DATE,
    resolution_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security checklists table
CREATE TABLE IF NOT EXISTS public.security_checklists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    name TEXT NOT NULL,
    checklist_type TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Checklist items table
CREATE TABLE IF NOT EXISTS public.checklist_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    checklist_id UUID REFERENCES public.security_checklists,
    text TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security tips table
CREATE TABLE IF NOT EXISTS public.security_tips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Personal notes table
CREATE TABLE IF NOT EXISTS public.personal_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reading list table
CREATE TABLE IF NOT EXISTS public.reading_list (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    category TEXT,
    priority INTEGER DEFAULT 1,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, url)
);

-- Useful links table
CREATE TABLE IF NOT EXISTS public.useful_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Link categories table
CREATE TABLE IF NOT EXISTS public.link_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RSS feeds table
CREATE TABLE IF NOT EXISTS public.rss_feeds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RSS articles table
CREATE TABLE IF NOT EXISTS public.rss_articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    feed_id UUID REFERENCES public.rss_feeds,
    title TEXT NOT NULL,
    description TEXT,
    link TEXT NOT NULL,
    author TEXT,
    pub_date TIMESTAMP WITH TIME ZONE,
    guid TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(feed_id, guid)
);

-- User RSS subscriptions table
CREATE TABLE IF NOT EXISTS public.user_rss_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users,
    feed_id UUID REFERENCES public.rss_feeds,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default RSS feeds
INSERT INTO public.rss_feeds (name, url, category, description, is_default) VALUES
('PortSwigger Daily Swig', 'https://portswigger.net/daily-swig/rss', 'Security News', 'Latest web security news from PortSwigger', true),
('Krebs on Security', 'https://krebsonsecurity.com/feed/', 'Security News', 'Brian Krebs security blog', true),
('Troy Hunt Blog', 'https://www.troyhunt.com/rss/', 'Security Research', 'Security researcher Troy Hunt blog', true),
('Google Project Zero', 'https://googleprojectzero.blogspot.com/feeds/posts/default', 'Vulnerability Research', 'Google Project Zero vulnerability research', true),
('HackerOne Hacktivity', 'https://hackerone.com/hacktivity.rss', 'Bug Bounty', 'Public HackerOne disclosures', true)
ON CONFLICT DO NOTHING;

-- Insert default platforms
INSERT INTO public.platforms (name, url, platform_type, description) VALUES
('HackerOne', 'https://hackerone.com', 'bug_bounty', 'Leading bug bounty platform'),
('Bugcrowd', 'https://bugcrowd.com', 'bug_bounty', 'Crowdsourced security platform'),
('Intigriti', 'https://intigriti.com', 'bug_bounty', 'European bug bounty platform'),
('YesWeHack', 'https://yeswehack.com', 'bug_bounty', 'Bug bounty and VDP platform'),
('Synack', 'https://synack.com', 'bug_bounty', 'Crowdsourced security testing'),
('Cobalt', 'https://cobalt.io', 'bug_bounty', 'Pentesting as a service platform')
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (RLS) on all user tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_platform_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.useful_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rss_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for user_platform_profiles
CREATE POLICY "Users can view own platform profiles" ON public.user_platform_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own platform profiles" ON public.user_platform_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own platform profiles" ON public.user_platform_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own platform profiles" ON public.user_platform_profiles FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for bugs
CREATE POLICY "Users can view own bugs" ON public.bugs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own bugs" ON public.bugs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bugs" ON public.bugs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own bugs" ON public.bugs FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for security_checklists
CREATE POLICY "Users can view own checklists" ON public.security_checklists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own checklists" ON public.security_checklists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own checklists" ON public.security_checklists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own checklists" ON public.security_checklists FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for checklist_items (through checklist ownership)
CREATE POLICY "Users can view own checklist items" ON public.checklist_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.security_checklists WHERE id = checklist_id AND user_id = auth.uid())
);
CREATE POLICY "Users can create own checklist items" ON public.checklist_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.security_checklists WHERE id = checklist_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update own checklist items" ON public.checklist_items FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.security_checklists WHERE id = checklist_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete own checklist items" ON public.checklist_items FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.security_checklists WHERE id = checklist_id AND user_id = auth.uid())
);

-- RLS Policies for security_tips
CREATE POLICY "Users can view own tips" ON public.security_tips FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own tips" ON public.security_tips FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tips" ON public.security_tips FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tips" ON public.security_tips FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for personal_notes
CREATE POLICY "Users can view own notes" ON public.personal_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own notes" ON public.personal_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON public.personal_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON public.personal_notes FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for reading_list
CREATE POLICY "Users can view own reading list" ON public.reading_list FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own reading list items" ON public.reading_list FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reading list items" ON public.reading_list FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reading list items" ON public.reading_list FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for useful_links
CREATE POLICY "Users can view own links" ON public.useful_links FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own links" ON public.useful_links FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own links" ON public.useful_links FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own links" ON public.useful_links FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for link_categories
CREATE POLICY "Users can view own categories" ON public.link_categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own categories" ON public.link_categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own categories" ON public.link_categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON public.link_categories FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_rss_subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.user_rss_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own subscriptions" ON public.user_rss_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own subscriptions" ON public.user_rss_subscriptions FOR DELETE USING (auth.uid() = user_id);

-- Public read access for platforms, programs, rss_feeds, and rss_articles
CREATE POLICY "Anyone can view platforms" ON public.platforms FOR SELECT USING (true);
CREATE POLICY "Anyone can view programs" ON public.programs FOR SELECT USING (true);
CREATE POLICY "Anyone can view rss feeds" ON public.rss_feeds FOR SELECT USING (true);
CREATE POLICY "Anyone can view rss articles" ON public.rss_articles FOR SELECT USING (true);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_user_platform_profiles_updated_at BEFORE UPDATE ON public.user_platform_profiles
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_platforms_updated_at BEFORE UPDATE ON public.platforms
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON public.programs
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_bugs_updated_at BEFORE UPDATE ON public.bugs
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_security_checklists_updated_at BEFORE UPDATE ON public.security_checklists
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_security_tips_updated_at BEFORE UPDATE ON public.security_tips
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_personal_notes_updated_at BEFORE UPDATE ON public.personal_notes
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_reading_list_updated_at BEFORE UPDATE ON public.reading_list
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_useful_links_updated_at BEFORE UPDATE ON public.useful_links
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_platform_profiles_user_id ON public.user_platform_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_bugs_user_id ON public.bugs(user_id);
CREATE INDEX IF NOT EXISTS idx_bugs_program_id ON public.bugs(program_id);
CREATE INDEX IF NOT EXISTS idx_bugs_status ON public.bugs(status);
CREATE INDEX IF NOT EXISTS idx_bugs_severity ON public.bugs(severity);
CREATE INDEX IF NOT EXISTS idx_security_checklists_user_id ON public.security_checklists(user_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_checklist_id ON public.checklist_items(checklist_id);
CREATE INDEX IF NOT EXISTS idx_security_tips_user_id ON public.security_tips(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_notes_user_id ON public.personal_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_list_user_id ON public.reading_list(user_id);
CREATE INDEX IF NOT EXISTS idx_useful_links_user_id ON public.useful_links(user_id);
CREATE INDEX IF NOT EXISTS idx_rss_articles_feed_id ON public.rss_articles(feed_id);
CREATE INDEX IF NOT EXISTS idx_rss_articles_pub_date ON public.rss_articles(pub_date DESC);

-- Enable realtime for tables that need it
ALTER PUBLICATION supabase_realtime ADD TABLE public.bugs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reading_list;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rss_articles;

-- Set replica identity for realtime updates
ALTER TABLE public.bugs REPLICA IDENTITY FULL;
ALTER TABLE public.reading_list REPLICA IDENTITY FULL;
ALTER TABLE public.rss_articles REPLICA IDENTITY FULL;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
```
