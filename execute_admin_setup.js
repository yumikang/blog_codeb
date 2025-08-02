import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Supabase 연결 정보
const supabaseUrl = 'https://taxztmphioixwsxsveko.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRheHp0bXBoaW9peHdzeHN2ZWtvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDAzNzE0MSwiZXhwIjoyMDY5NjEzMTQxfQ.VvMNCGJW1qB4MNnzszmeehTYVde1eOYgZBKzk_bk7B8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeAdminSetup() {
  try {
    console.log('Setting up admin authentication...');
    
    // Step 1: Create pgcrypto extension
    console.log('1. Creating pgcrypto extension...');
    const { error: extError } = await supabase.rpc('query', {
      query: 'CREATE EXTENSION IF NOT EXISTS pgcrypto;'
    });
    if (extError && !extError.message.includes('already exists')) {
      console.error('Extension error:', extError);
    }
    
    // Step 2: Create verify_admin_password function
    console.log('2. Creating verify_admin_password function...');
    const functionSQL = `
      CREATE OR REPLACE FUNCTION verify_admin_password(p_username TEXT, p_password TEXT)
      RETURNS TABLE(id UUID, username TEXT, email TEXT, full_name TEXT, is_active BOOLEAN)
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        RETURN QUERY
        SELECT a.id, a.username, a.email, a.full_name, a.is_active
        FROM admin_users a
        WHERE a.username = p_username
          AND a.is_active = true
          AND a.password_hash = crypt(p_password, a.password_hash);
      END;
      $$;
    `;
    
    const { error: funcError } = await supabase.rpc('query', {
      query: functionSQL
    });
    if (funcError) {
      console.error('Function creation error:', funcError);
    }
    
    // Step 3: Grant permissions
    console.log('3. Granting permissions...');
    const grantSQL = `
      GRANT EXECUTE ON FUNCTION verify_admin_password TO anon;
      GRANT EXECUTE ON FUNCTION verify_admin_password TO authenticated;
    `;
    
    const { error: grantError } = await supabase.rpc('query', {
      query: grantSQL
    });
    if (grantError) {
      console.error('Grant error:', grantError);
    }
    
    // Step 4: Check if admin exists
    console.log('4. Checking if admin user exists...');
    const { data: adminCheck, error: checkError } = await supabase
      .from('admin_users')
      .select('id, username')
      .eq('username', 'admin')
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Check error:', checkError);
    }
    
    if (!adminCheck) {
      // Step 5: Create admin user
      console.log('5. Creating admin user...');
      const { error: insertError } = await supabase.rpc('query', {
        query: `
          INSERT INTO public.admin_users (username, password_hash, email, full_name, is_active) 
          VALUES ('admin', crypt('admin123!', gen_salt('bf')), 'admin@magzin.com', '관리자', true)
          ON CONFLICT (username) DO NOTHING;
        `
      });
      
      if (insertError) {
        console.error('Insert error:', insertError);
      }
    } else {
      console.log('Admin user already exists');
    }
    
    // Step 6: Test the function
    console.log('6. Testing verify_admin_password function...');
    const { data: testResult, error: testError } = await supabase
      .rpc('verify_admin_password', {
        p_username: 'admin',
        p_password: 'admin123!'
      });
    
    if (testError) {
      console.error('Test error:', testError);
    } else if (testResult && testResult.length > 0) {
      console.log('✅ Admin authentication setup successful!');
      console.log('Admin user:', testResult[0]);
    } else {
      console.log('❌ Authentication test failed');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

executeAdminSetup();