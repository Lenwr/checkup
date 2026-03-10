import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(req: NextRequest) {
  const res = NextResponse.next();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Hard fail clair si env manquantes
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase env vars in middleware");
    return res;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookies) {
        cookies.forEach(({ name, value, options }) => {
          res.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.getUser();

  // Si erreur auth, on considère non connecté
  const user = error ? null : data.user;

  const pathname = req.nextUrl.pathname;

  const isDashboard = pathname.startsWith("/dashboard");
  const isAdminApi = pathname.startsWith("/api/admin");
  const isLogin = pathname.startsWith("/login");

  // 🔒 Bloque dashboard + admin api si pas loggé
  if ((isDashboard || isAdminApi) && !user) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // ✨ Bonus UX : si déjà loggé et tu vas sur /login -> renvoie vers dashboard
  if (isLogin && user) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard/interventions";
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/admin/:path*", "/login"],
};
