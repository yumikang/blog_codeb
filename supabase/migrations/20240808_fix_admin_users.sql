-- Fix admin_users table and add default admin account

-- 1. Ensure admin_users table exists
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL CHECK (length(username) >= 3 AND length(username) <= 50),
    password_hash TEXT NOT NULL,
    email TEXT UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    full_name TEXT CHECK (length(full_name) <= 100),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create trigger for updated_at if not exists
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON public.admin_users;
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON public.admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. Insert default admin user with plain text password for development
-- NOTE: In production, use proper bcrypt hashing
INSERT INTO public.admin_users (username, password_hash, email, full_name, is_active) 
VALUES 
  ('admin', 'admin123!', 'admin@magzin.com', '관리자', true)
ON CONFLICT (username) DO UPDATE
SET password_hash = 'admin123!',
    email = 'admin@magzin.com',
    full_name = '관리자',
    is_active = true;

-- 4. Verify the admin user was created
SELECT id, username, email, is_active, created_at
FROM public.admin_users
WHERE username = 'admin';