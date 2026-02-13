import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function supabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export function supabaseSSR() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // Next App Router: set cookies via Response in middleware (ici no-op)
          // on gère le set dans middleware & actions côté server si besoin
          cookiesToSet.forEach(() => {});
        },
      },
    }
  );
}
