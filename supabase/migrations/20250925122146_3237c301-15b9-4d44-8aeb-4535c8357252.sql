-- Add created_by column to users to track row ownership
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS created_by uuid;

-- Create a trigger function to set created_by to the current auth user on insert when missing
CREATE OR REPLACE FUNCTION public.set_users_created_by()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to apply the function before insert
DROP TRIGGER IF EXISTS trg_set_users_created_by ON public.users;
CREATE TRIGGER trg_set_users_created_by
BEFORE INSERT ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.set_users_created_by();

-- RLS policies to allow creators to view/update/delete their own user rows
-- View own created users
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'Users can view users they created'
  ) THEN
    CREATE POLICY "Users can view users they created"
    ON public.users
    FOR SELECT
    USING (created_by = auth.uid());
  END IF;
END $$;

-- Update own created users
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'Users can update users they created'
  ) THEN
    CREATE POLICY "Users can update users they created"
    ON public.users
    FOR UPDATE
    USING (created_by = auth.uid());
  END IF;
END $$;

-- Delete own created users
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'Users can delete users they created'
  ) THEN
    CREATE POLICY "Users can delete users they created"
    ON public.users
    FOR DELETE
    USING (created_by = auth.uid());
  END IF;
END $$;

-- Ensure insert is allowed (keep existing permissive policy; add fallback if missing)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'Users can create users (fallback)'
  ) THEN
    CREATE POLICY "Users can create users (fallback)"
    ON public.users
    FOR INSERT
    WITH CHECK (true);
  END IF;
END $$;