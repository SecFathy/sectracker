
-- First, let's ensure we have proper RLS policies for all tables that need them
-- Using IF NOT EXISTS or DROP IF EXISTS to handle conflicts

-- Enable RLS on tables that don't have it yet (these are safe operations)
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

-- Drop existing policies first, then recreate them
DROP POLICY IF EXISTS "Users can view their own bugs" ON public.bugs;
DROP POLICY IF EXISTS "Users can create their own bugs" ON public.bugs;
DROP POLICY IF EXISTS "Users can update their own bugs" ON public.bugs;
DROP POLICY IF EXISTS "Users can delete their own bugs" ON public.bugs;

-- Create RLS policies for bugs table
CREATE POLICY "Users can view their own bugs" ON public.bugs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bugs" ON public.bugs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bugs" ON public.bugs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bugs" ON public.bugs
  FOR DELETE USING (auth.uid() = user_id);

-- Drop existing policies for programs
DROP POLICY IF EXISTS "Everyone can view programs" ON public.programs;
DROP POLICY IF EXISTS "Authenticated users can create programs" ON public.programs;
DROP POLICY IF EXISTS "Authenticated users can update programs" ON public.programs;
DROP POLICY IF EXISTS "Authenticated users can delete programs" ON public.programs;

-- Create RLS policies for programs table
CREATE POLICY "Everyone can view programs" ON public.programs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create programs" ON public.programs
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update programs" ON public.programs
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete programs" ON public.programs
  FOR DELETE TO authenticated USING (true);

-- Drop existing policies for platforms
DROP POLICY IF EXISTS "Everyone can view platforms" ON public.platforms;
DROP POLICY IF EXISTS "Authenticated users can create platforms" ON public.platforms;
DROP POLICY IF EXISTS "Authenticated users can update platforms" ON public.platforms;
DROP POLICY IF EXISTS "Authenticated users can delete platforms" ON public.platforms;

-- Create RLS policies for platforms table
CREATE POLICY "Everyone can view platforms" ON public.platforms
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create platforms" ON public.platforms
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update platforms" ON public.platforms
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete platforms" ON public.platforms
  FOR DELETE TO authenticated USING (true);

-- Drop existing policies for user_platform_profiles
DROP POLICY IF EXISTS "Users can view their own platform profiles" ON public.user_platform_profiles;
DROP POLICY IF EXISTS "Users can create their own platform profiles" ON public.user_platform_profiles;
DROP POLICY IF EXISTS "Users can update their own platform profiles" ON public.user_platform_profiles;
DROP POLICY IF EXISTS "Users can delete their own platform profiles" ON public.user_platform_profiles;

-- Create RLS policies for user_platform_profiles
CREATE POLICY "Users can view their own platform profiles" ON public.user_platform_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own platform profiles" ON public.user_platform_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own platform profiles" ON public.user_platform_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own platform profiles" ON public.user_platform_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Create a bounty targets table for the bounty functionality
CREATE TABLE IF NOT EXISTS public.bounty_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_amount NUMERIC NOT NULL,
  current_amount NUMERIC DEFAULT 0,
  deadline DATE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for bounty_targets
ALTER TABLE public.bounty_targets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for bounty_targets
DROP POLICY IF EXISTS "Users can view their own bounty targets" ON public.bounty_targets;
DROP POLICY IF EXISTS "Users can create their own bounty targets" ON public.bounty_targets;
DROP POLICY IF EXISTS "Users can update their own bounty targets" ON public.bounty_targets;
DROP POLICY IF EXISTS "Users can delete their own bounty targets" ON public.bounty_targets;

-- Create RLS policies for bounty_targets
CREATE POLICY "Users can view their own bounty targets" ON public.bounty_targets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bounty targets" ON public.bounty_targets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bounty targets" ON public.bounty_targets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bounty targets" ON public.bounty_targets
  FOR DELETE USING (auth.uid() = user_id);

-- Add missing foreign key relationships (using IF NOT EXISTS equivalent for constraints)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'bugs_program_id_fkey') THEN
    ALTER TABLE public.bugs ADD CONSTRAINT bugs_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.programs(id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'programs_platform_id_fkey') THEN
    ALTER TABLE public.programs ADD CONSTRAINT programs_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.platforms(id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'user_platform_profiles_platform_id_fkey') THEN
    ALTER TABLE public.user_platform_profiles ADD CONSTRAINT user_platform_profiles_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.platforms(id);
  END IF;
END $$;
