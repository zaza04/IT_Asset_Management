-- ============================================
-- QUICK FIX: Enable RLS policies for departments and positions
-- Run this in Supabase SQL Editor to fix the RLS error
-- ============================================

-- 1. Enable RLS on departments and positions tables
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;

-- 2. Create RLS Policies for departments
DO $$
BEGIN
    -- Drop existing policies to avoid errors on re-run
    DROP POLICY IF EXISTS "Anyone can view departments" ON public.departments;
    DROP POLICY IF EXISTS "Authenticated users can insert departments" ON public.departments;
    DROP POLICY IF EXISTS "Authenticated users can update departments" ON public.departments;
    DROP POLICY IF EXISTS "Authenticated users can delete departments" ON public.departments;

    -- Create policies
    CREATE POLICY "Anyone can view departments" ON public.departments
        FOR SELECT USING (true);

    CREATE POLICY "Authenticated users can insert departments" ON public.departments
        FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

    CREATE POLICY "Authenticated users can update departments" ON public.departments
        FOR UPDATE USING (auth.uid() IS NOT NULL);

    CREATE POLICY "Authenticated users can delete departments" ON public.departments
        FOR DELETE USING (auth.uid() IS NOT NULL);
END $$;

-- 3. Create RLS Policies for positions
DO $$
BEGIN
    -- Drop existing policies to avoid errors on re-run
    DROP POLICY IF EXISTS "Anyone can view positions" ON public.positions;
    DROP POLICY IF EXISTS "Authenticated users can insert positions" ON public.positions;
    DROP POLICY IF EXISTS "Authenticated users can update positions" ON public.positions;
    DROP POLICY IF EXISTS "Authenticated users can delete positions" ON public.positions;

    -- Create policies
    CREATE POLICY "Anyone can view positions" ON public.positions
        FOR SELECT USING (true);

    CREATE POLICY "Authenticated users can insert positions" ON public.positions
        FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

    CREATE POLICY "Authenticated users can update positions" ON public.positions
        FOR UPDATE USING (auth.uid() IS NOT NULL);

    CREATE POLICY "Authenticated users can delete positions" ON public.positions
        FOR DELETE USING (auth.uid() IS NOT NULL);
END $$;

-- 4. Verify policies are created
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('departments', 'positions')
ORDER BY tablename, policyname;
