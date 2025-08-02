import { createServerClient, parse, serialize } from "@supabase/ssr";
import type { Database } from "~/types/database";

export function createSupabaseServerClient(request: Request) {
  const cookies = parse(request.headers.get("Cookie") ?? "");
  const headers = new Headers();

  const supabase = createServerClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
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

  return { supabase, headers };
}

export async function getUser(request: Request) {
  const { supabase } = createSupabaseServerClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireUser(request: Request) {
  const user = await getUser(request);
  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }
  return user;
}