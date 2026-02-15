-- Database Initialization Script

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create profiles table (mocking auth.users for standalone DB)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Changed to gen_random_uuid()
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'user',
    full_name TEXT,
    avatar_url TEXT, -- Added avatar_url
    settings JSONB DEFAULT '{}', -- Kept for compatibility if needed, though not in snippet
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create devices table (without end_user_id FK initially to avoid circular dependency)
CREATE TABLE IF NOT EXISTS public.devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Changed to gen_random_uuid()
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- Changed from user_id to owner_id
    code TEXT UNIQUE, -- Added UNIQUE constraint
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    specs JSONB DEFAULT '{}', -- Renamed from device_info? Snippet has specs. Kept specs.
    location TEXT, -- Added
    purchase_date TIMESTAMP, -- Added
    warranty_exp TIMESTAMP, -- Added
    notes TEXT, -- Added
    end_user_id UUID UNIQUE, -- 1-1 relationship with end_users, FK added later
    device_info JSONB DEFAULT '{}', -- Kept to avoid breaking existing logic if any
    file_name TEXT, -- Kept
    metadata JSONB DEFAULT '{}', -- Kept
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create departments table
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT departments_user_name_unique UNIQUE (user_id, name)
);

-- 5. Create positions table
CREATE TABLE IF NOT EXISTS public.positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT positions_user_name_unique UNIQUE (user_id, name)
);

-- 6. Create end_users table
CREATE TABLE IF NOT EXISTS public.end_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    device_id UUID UNIQUE REFERENCES public.devices(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    department TEXT, -- Legacy field, kept for backward compatibility
    position TEXT, -- Legacy field, kept for backward compatibility
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    position_id UUID REFERENCES public.positions(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create device_sheets table
CREATE TABLE IF NOT EXISTS public.device_sheets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE,
    sheet_name TEXT NOT NULL,
    sheet_data JSONB DEFAULT '[]',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Create activity_logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id SERIAL PRIMARY KEY,
    device_id UUID REFERENCES public.devices(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Add Circular Foreign Key for devices -> end_users
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_devices_end_user'
    ) THEN
        ALTER TABLE public.devices 
        ADD CONSTRAINT fk_devices_end_user 
        FOREIGN KEY (end_user_id) REFERENCES public.end_users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 10. Add Indexes
CREATE INDEX IF NOT EXISTS idx_devices_owner_id ON public.devices(owner_id);
CREATE INDEX IF NOT EXISTS idx_devices_end_user_id ON public.devices(end_user_id);
CREATE INDEX IF NOT EXISTS idx_device_sheets_device_id ON public.device_sheets(device_id);
CREATE INDEX IF NOT EXISTS idx_end_users_device_id ON public.end_users(device_id);
CREATE INDEX IF NOT EXISTS idx_end_users_user_id ON public.end_users(user_id);
CREATE INDEX IF NOT EXISTS idx_end_users_department_id ON public.end_users(department_id);
CREATE INDEX IF NOT EXISTS idx_end_users_position_id ON public.end_users(position_id);
CREATE INDEX IF NOT EXISTS idx_departments_user_id ON public.departments(user_id);
CREATE INDEX IF NOT EXISTS idx_positions_user_id ON public.positions(user_id);
CREATE INDEX IF NOT EXISTS idx_end_users_position_id ON public.end_users(position_id);

-- 11. Setup RLS (Row Level Security)
ALTER TABLE public.end_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;

-- 12. RLS Policies for end_users
DO $$
BEGIN
    -- Drop existing policies to avoid errors on re-run
    DROP POLICY IF EXISTS "Users can view own end_users" ON public.end_users;
    DROP POLICY IF EXISTS "Users can insert own end_users" ON public.end_users;
    DROP POLICY IF EXISTS "Users can update own end_users" ON public.end_users;
    DROP POLICY IF EXISTS "Users can delete own end_users" ON public.end_users;

    -- Create policies
    CREATE POLICY "Users can view own end_users" ON public.end_users
        FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own end_users" ON public.end_users
        FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own end_users" ON public.end_users
        FOR UPDATE USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete own end_users" ON public.end_users
        FOR DELETE USING (auth.uid() = user_id);
END $$;

-- 13. RLS Policies for departments (Per-User Isolation)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view own departments" ON public.departments;
    DROP POLICY IF EXISTS "Users can insert own departments" ON public.departments;
    DROP POLICY IF EXISTS "Users can update own departments" ON public.departments;
    DROP POLICY IF EXISTS "Users can delete own departments" ON public.departments;

    CREATE POLICY "Users can view own departments" ON public.departments
        FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own departments" ON public.departments
        FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own departments" ON public.departments
        FOR UPDATE USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete own departments" ON public.departments
        FOR DELETE USING (auth.uid() = user_id);
END $$;

-- 14. RLS Policies for positions (Per-User Isolation)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view own positions" ON public.positions;
    DROP POLICY IF EXISTS "Users can insert own positions" ON public.positions;
    DROP POLICY IF EXISTS "Users can update own positions" ON public.positions;
    DROP POLICY IF EXISTS "Users can delete own positions" ON public.positions;

    CREATE POLICY "Users can view own positions" ON public.positions
        FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own positions" ON public.positions
        FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own positions" ON public.positions
        FOR UPDATE USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete own positions" ON public.positions
        FOR DELETE USING (auth.uid() = user_id);
END $$;
