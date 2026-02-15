-- ============================================
-- MIGRATION: Create departments and positions tables
-- ============================================

-- 1. Create departments table
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create positions table
CREATE TABLE IF NOT EXISTS public.positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Add foreign key columns to end_users
ALTER TABLE public.end_users 
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS position_id UUID REFERENCES public.positions(id) ON DELETE SET NULL;

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_end_users_department_id ON public.end_users(department_id);
CREATE INDEX IF NOT EXISTS idx_end_users_position_id ON public.end_users(position_id);

-- 5. Migration: Import existing department/position names to new tables
INSERT INTO public.departments (name)
SELECT DISTINCT department 
FROM public.end_users 
WHERE department IS NOT NULL 
AND department != ''
AND NOT EXISTS (SELECT 1 FROM public.departments WHERE name = public.end_users.department);

INSERT INTO public.positions (name)
SELECT DISTINCT position 
FROM public.end_users 
WHERE position IS NOT NULL 
AND position != ''
AND NOT EXISTS (SELECT 1 FROM public.positions WHERE name = public.end_users.position);

-- 6. Update end_users with department_id and position_id
UPDATE public.end_users
SET department_id = (
    SELECT id FROM public.departments WHERE name = end_users.department
)
WHERE department IS NOT NULL AND department != '';

UPDATE public.end_users
SET position_id = (
    SELECT id FROM public.positions WHERE name = end_users.position
)
WHERE position IS NOT NULL AND position != '';

-- 7. Enable RLS on departments and positions tables
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS Policies for departments
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

-- 9. Create RLS Policies for positions
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

-- Verify
SELECT 
    'departments' as table_name,
    COUNT(*) as total
FROM public.departments
UNION ALL
SELECT 
    'positions' as table_name,
    COUNT(*) as total
FROM public.positions;
