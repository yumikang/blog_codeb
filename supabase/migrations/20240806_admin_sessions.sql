-- Create admin_sessions table for secure session management
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_admin_sessions_token ON admin_sessions(token);
CREATE INDEX idx_admin_sessions_expires_at ON admin_sessions(expires_at);

-- Add password_hash column to admin_users if it doesn't exist
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Update existing admin user with a hashed password
-- Note: This is a placeholder hash for 'admin123' - CHANGE THIS IN PRODUCTION!
-- To generate a new hash, use: bcrypt.hash('your-secure-password', 10)
UPDATE admin_users 
SET password_hash = '$2b$10$YourHashedPasswordHere' 
WHERE username = 'admin' AND password_hash IS NULL;

-- Remove the old password column if it exists (after verifying password_hash is populated)
-- ALTER TABLE admin_users DROP COLUMN IF EXISTS password;

-- Add RLS policies for admin_sessions
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- Only service role can access admin_sessions
CREATE POLICY "Service role can manage admin sessions" 
ON admin_sessions 
FOR ALL 
TO service_role 
USING (true);