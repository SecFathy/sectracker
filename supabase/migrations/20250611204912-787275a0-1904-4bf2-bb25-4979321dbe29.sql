
-- Add new columns to the programs table for enhanced bug bounty program management
ALTER TABLE public.programs 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS program_type TEXT DEFAULT 'Public Bug Bounty Programs' CHECK (program_type IN ('Public Bug Bounty Programs', 'Private', 'VDP')),
ADD COLUMN IF NOT EXISTS management_type TEXT DEFAULT 'Not Managed' CHECK (management_type IN ('Managed', 'Not Managed'));

-- Update the existing programs to have default values
UPDATE public.programs 
SET program_type = 'Public Bug Bounty Programs' 
WHERE program_type IS NULL;

UPDATE public.programs 
SET management_type = 'Not Managed' 
WHERE management_type IS NULL;

-- Add RLS policies for programs table if they don't exist
DROP POLICY IF EXISTS "Users can view all programs" ON public.programs;
DROP POLICY IF EXISTS "Users can create programs" ON public.programs;
DROP POLICY IF EXISTS "Users can update programs" ON public.programs;
DROP POLICY IF EXISTS "Users can delete programs" ON public.programs;

CREATE POLICY "Users can view all programs" ON public.programs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create programs" ON public.programs
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update programs" ON public.programs
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users can delete programs" ON public.programs
  FOR DELETE TO authenticated USING (true);

-- Add RLS policies for security_checklists if they don't exist
DROP POLICY IF EXISTS "Users can view their own checklists" ON public.security_checklists;
DROP POLICY IF EXISTS "Users can create their own checklists" ON public.security_checklists;
DROP POLICY IF EXISTS "Users can update their own checklists" ON public.security_checklists;
DROP POLICY IF EXISTS "Users can delete their own checklists" ON public.security_checklists;

CREATE POLICY "Users can view their own checklists" ON public.security_checklists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own checklists" ON public.security_checklists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own checklists" ON public.security_checklists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own checklists" ON public.security_checklists
  FOR DELETE USING (auth.uid() = user_id);

-- Add RLS policies for checklist_items if they don't exist
DROP POLICY IF EXISTS "Users can view checklist items" ON public.checklist_items;
DROP POLICY IF EXISTS "Users can create checklist items" ON public.checklist_items;
DROP POLICY IF EXISTS "Users can update checklist items" ON public.checklist_items;
DROP POLICY IF EXISTS "Users can delete checklist items" ON public.checklist_items;

CREATE POLICY "Users can view checklist items" ON public.checklist_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.security_checklists 
      WHERE id = checklist_items.checklist_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create checklist items" ON public.checklist_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.security_checklists 
      WHERE id = checklist_items.checklist_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update checklist items" ON public.checklist_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.security_checklists 
      WHERE id = checklist_items.checklist_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete checklist items" ON public.checklist_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.security_checklists 
      WHERE id = checklist_items.checklist_id 
      AND user_id = auth.uid()
    )
  );
