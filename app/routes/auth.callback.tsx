import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { createServerClient, parse, serialize } from "@supabase/ssr";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const cookies = parse(request.headers.get("Cookie") ?? "");
  const headers = new Headers();

  if (code) {
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
    
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(key) {
            return cookies[key];
          },
          set(key, value, options) {
            headers.append("Set-Cookie", serialize(key, value, options));
          },
          remove(key, options) {
            headers.append("Set-Cookie", serialize(key, "", options));
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("OAuth error:", error);
      return redirect("/login?error=auth_failed", { headers });
    }
  }

  // Redirect to home page after successful authentication
  return redirect("/", { headers });
};