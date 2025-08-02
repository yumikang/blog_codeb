import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { useState } from "react";
import Layout from "~/components/Layout";
import { createServerClient, parse, serialize } from "@supabase/ssr";
import crypto from "crypto";
import { validateUsername, validatePassword } from "~/utils/validation";
import { dbHelpers } from "~/lib/supabase.server";
import { createAdminSession, getAdminSession } from "~/lib/admin.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Admin Login - Magzin Blog" },
    { name: "description", content: "Admin login for Magzin Blog management" },
  ];
};

// Check if already logged in
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getAdminSession(request);
  
  if (session) {
    return redirect("/admin");
  }
  
  return json({});
};

// Handle login form submission
export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  // Validate input
  const usernameValidation = validateUsername(username);
  if (!usernameValidation.valid) {
    return json({ 
      error: usernameValidation.error,
      fieldErrors: { username: usernameValidation.error }
    }, { status: 400 });
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return json({ 
      error: passwordValidation.error,
      fieldErrors: { password: passwordValidation.error }
    }, { status: 400 });
  }

  // Verify credentials against database
  try {
    const admin = await dbHelpers.admin.verifyAdmin(username, password);
    
    if (!admin) {
      // Don't reveal whether username or password was wrong
      return json({ 
        error: "Invalid username or password" 
      }, { status: 401 });
    }

    // Create secure session
    const { cookie } = await createAdminSession(admin.id);
    const headers = new Headers();
    headers.append("Set-Cookie", cookie);
    
    return redirect("/admin", { headers });
  }

  return json({ error: "Invalid username or password" }, { status: 401 });
};

export default function AdminLogin() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <Layout>
      <div className="container py-5">
        <div className="row">
          <div className="col-lg-5 col-md-7 mx-auto">
            <div className="card shadow">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h2 className="mb-3">Admin Login</h2>
                  <p className="text-muted">Sign in to manage your blog</p>
                </div>

                {actionData?.error && (
                  <div className="alert alert-danger" role="alert">
                    {actionData.error}
                  </div>
                )}

                <Form method="post">
                  <div className="mb-4">
                    <label htmlFor="username" className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      id="username"
                      name="username"
                      required
                      autoComplete="username"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      required
                      autoComplete="current-password"
                    />
                  </div>

                  <div className="d-grid">
                    <button
                      type="submit"
                      className="btn btn-primary py-3"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Signing in...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </button>
                  </div>
                </Form>

                <div className="text-center mt-4">
                  <a href="/" className="text-muted text-decoration-none">
                    <small>← Back to site</small>
                  </a>
                </div>
              </div>
            </div>

            <div className="text-center mt-4">
              <p className="text-muted small">
                Protected area. Authorized personnel only.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}