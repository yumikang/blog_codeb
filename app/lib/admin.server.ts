import { redirect } from "@remix-run/node";
import { parse, serialize } from "@supabase/ssr";
import crypto from "crypto";
import { supabaseAdmin } from "./supabase.server";

// Session duration: 24 hours
const SESSION_DURATION = 24 * 60 * 60 * 1000;

export async function requireAdminAuth(request: Request) {
  const cookies = parse(request.headers.get("Cookie") ?? "");
  const sessionToken = cookies.admin_session;
  
  if (!sessionToken) {
    throw redirect("/admin/login");
  }
  
  // Validate session token against database
  const { data: session, error } = await supabaseAdmin
    .from('admin_sessions')
    .select('id, admin_user_id, expires_at')
    .eq('token', sessionToken)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !session) {
    throw redirect("/admin/login");
  }
  
  // Get admin user details
  const { data: admin } = await supabaseAdmin
    .from('admin_users')
    .select('id, username')
    .eq('id', session.admin_user_id)
    .single();
    
  if (!admin) {
    throw redirect("/admin/login");
  }
  
  return { admin };
}

export async function getAdminSession(request: Request) {
  const cookies = parse(request.headers.get("Cookie") ?? "");
  const sessionToken = cookies.admin_session;
  
  if (!sessionToken) {
    return null;
  }
  
  const { data: session } = await supabaseAdmin
    .from('admin_sessions')
    .select('*')
    .eq('token', sessionToken)
    .gt('expires_at', new Date().toISOString())
    .single();
    
  return session;
}

export async function createAdminSession(adminUserId: string) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DURATION).toISOString();
  
  const { data, error } = await supabaseAdmin
    .from('admin_sessions')
    .insert({
      admin_user_id: adminUserId,
      token,
      expires_at: expiresAt
    })
    .select()
    .single();
    
  if (error) {
    throw new Error('Failed to create session');
  }
  
  return {
    token,
    cookie: serialize('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION / 1000,
      path: '/'
    })
  };
}

export async function destroyAdminSession(request: Request) {
  const cookies = parse(request.headers.get("Cookie") ?? "");
  const sessionToken = cookies.admin_session;
  
  if (sessionToken) {
    await supabaseAdmin
      .from('admin_sessions')
      .delete()
      .eq('token', sessionToken);
  }
  
  return serialize('admin_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  });
}