-- ============================================
-- STEP 1: Clean up existing data (run this first!)
-- ============================================

-- Delete all existing departments and positions (they don't have user_id yet)
DELETE FROM public.departments;
DELETE FROM public.positions;

-- ============================================
-- STEP 2: Add user_id columns (run after Step 1)
-- ============================================

ALTER TABLE public.departments 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.positions 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- ============================================
-- STEP 3: Drop old unique constraints (run after Step 2)
-- ============================================

ALTER TABLE public.departments DROP CONSTRAINT IF EXISTS departments_name_key;
ALTER TABLE public.positions DROP CONSTRAINT IF EXISTS positions_name_key;

-- ============================================
-- STEP 4: Add new composite unique constraints (run after Step 3)
-- ============================================

ALTER TABLE public.departments ADD CONSTRAINT departments_user_name_unique UNIQUE (user_id, name);
ALTER TABLE public.positions ADD CONSTRAINT positions_user_name_unique UNIQUE (user_id, name);

-- ============================================
-- STEP 5: Set NOT NULL constraints (run after Step 4)
-- ============================================

ALTER TABLE public.departments ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.positions ALTER COLUMN user_id SET NOT NULL;

-- ============================================
-- STEP 6: Add indexes (run after Step 5)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_departments_user_id ON public.departments(user_id);
CREATE INDEX IF NOT EXISTS idx_positions_user_id ON public.positions(user_id);

-- ============================================
-- STEP 7: Update RLS Policies for per-user isolation
-- ============================================

-- Departments
DROP POLICY IF EXISTS "Anyone can view departments" ON public.departments;
DROP POLICY IF EXISTS "Authenticated users can insert departments" ON public.departments;
DROP POLICY IF EXISTS "Authenticated users can update departments" ON public.departments;
DROP POLICY IF EXISTS "Authenticated users can delete departments" ON public.departments;

CREATE POLICY "Users can view own departments" ON public.departments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own departments" ON public.departments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own departments" ON public.departments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own departments" ON public.departments
    FOR DELETE USING (auth.uid() = user_id);

-- Positions
DROP POLICY IF EXISTS "Anyone can view positions" ON public.positions;
DROP POLICY IF EXISTS "Authenticated users can insert positions" ON public.positions;
DROP POLICY IF EXISTS "Authenticated users can update positions" ON public.positions;
DROP POLICY IF EXISTS "Authenticated users can delete positions" ON public.positions;

CREATE POLICY "Users can view own positions" ON public.positions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own positions" ON public.positions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own positions" ON public.positions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own positions" ON public.positions
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- VERIFY
-- ============================================

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
