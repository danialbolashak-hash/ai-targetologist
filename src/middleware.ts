import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse, type NextRequest } from "next/server";

// Routes that require a logged-in session
const PROTECTED = ["/dashboard", "/assistant", "/campaigns", "/audiences", "/creatives", "/offers", "/analytics", "/optimization", "/leads", "/settings", "/admin", "/onboarding"];
// Auth pages — redirect away if already logged in
const AUTH_PAGES = ["/login", "/register"];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  const path = req.nextUrl.pathname;
  const isProtected = PROTECTED.some((p) => path === p || path.startsWith(p + "/"));
  const isAuthPage = AUTH_PAGES.some((p) => path.startsWith(p));

  // Not logged in → block protected routes
  if (isProtected && !session) {
    const url = new URL("/login", req.url);
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  // Logged in → keep away from login/register
  if (isAuthPage && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Security headers on every response
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  return res;
}

export const config = {
  // Run on everything except static assets and Next internals
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
