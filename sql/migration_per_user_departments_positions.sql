-- ============================================
-- MIGRATION: Add user_id to departments and positions tables
-- For Per-User Isolation (Option 2)
-- ============================================

-- 1. Add user_id column to departments table
ALTER TABLE public.departments 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 2. Add user_id column to positions table
ALTER TABLE public.positions 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 3. Drop old unique constraints on name
ALTER TABLE public.departments DROP CONSTRAINT IF EXISTS departments_name_key;
ALTER TABLE public.positions DROP CONSTRAINT IF EXISTS positions_name_key;

-- 4. Add new composite unique constraints (user_id + name)
ALTER TABLE public.departments ADD CONSTRAINT departments_user_name_unique UNIQUE (user_id, name);
ALTER TABLE public.positions ADD CONSTRAINT positions_user_name_unique UNIQUE (user_id, name);

-- 5. Set NOT NULL constraints for user_id
ALTER TABLE public.departments ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.positions ALTER COLUMN user_id SET NOT NULL;

-- 6. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_departments_user_id ON public.departments(user_id);
CREATE INDEX IF NOT EXISTS idx_positions_user_id ON public.positions(user_id);

-- 7. Update RLS Policies for per-user isolation

-- Drop existing RLS policies for departments
DO $$
BEGIN
    DROP POLICY IF EXISTS "Anyone can view departments" ON public.departments;
    DROP POLICY IF EXISTS "Authenticated users can insert departments" ON public.departments;
    DROP POLICY IF EXISTS "Authenticated users can update departments" ON public.departments;
    DROP POLICY IF EXISTS "Authenticated users can delete departments" ON public.departments;
END $$;

-- Create new per-user RLS policies for departments
DO $$
BEGIN
    CREATE POLICY "Users can view own departments" ON public.departments
        FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own departments" ON public.departments
        FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own departments" ON public.departments
        FOR UPDATE USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete own departments" ON public.departments
        FOR DELETE USING (auth.uid() = user_id);
END $$;

-- Drop existing RLS policies for positions
DO $$
BEGIN
    DROP POLICY IF EXISTS "Anyone can view positions" ON public.positions;
    DROP POLICY IF EXISTS "Authenticated users can insert positions" ON public.positions;
    DROP POLICY IF EXISTS "Authenticated users can update positions" ON public.positions;
    DROP POLICY IF EXISTS "Authenticated users can delete positions" ON public.positions;
END $$;

-- Create new per-user RLS policies for positions
DO $$
BEGIN
    CREATE POLICY "Users can view own positions" ON public.positions
        FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own positions" ON public.positions
        FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own positions" ON public.positions
        FOR UPDATE USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete own positions" ON public.positions
        FOR DELETE USING (auth.uid() = user_id);
END $$;

-- 8. Verify the changes
SELECT 
    'departments' as table_name,
    COUNT(*) as total,
    COUNT(DISTINCT user_id) as unique_users
FROM public.departments
UNION ALL
SELECT 
    'positions' as table_name,
    COUNT(*) as total,
    COUNT(DISTINCT user_id) as unique_users
FROM public.positions;
