import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";

type AppRole = "admin" | "doctor" | "patient";

function roleToDashboard(role: AppRole | null): string {
  const map: Record<AppRole, string> = {
    admin: "/dashboard/admin",
    doctor: "/dashboard/doctor",
    patient: "/dashboard/patient",
  };
  return role ? map[role] : "/dashboard/admin";
}

function getRoleFromUser(user: User | null): AppRole | null {
  const role = user?.app_metadata?.role;
  return role === "admin" || role === "doctor" || role === "patient" ? role : null;
}

async function getSafeRole(supabase: unknown, user: User): Promise<AppRole | null> {
  // 1) Prefer secure app_metadata role (server-set, not user-editable)
  const metaRole = getRoleFromUser(user);
  if (metaRole) return metaRole;

  // 2) Fallback to profiles for older accounts
  try {
    const sb = supabase as {
      from: (t: string) => {
        select: (c: string) => {
          eq: (k: string, v: string) => { maybeSingle: () => Promise<{ data: { role?: string } | null; error: { message: string } | null }> };
        };
      };
    };

    const { data, error } = await sb
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (error) return null;
    const role = data?.role;
    return role === "admin" || role === "doctor" || role === "patient" ? role : null;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/signup") {
    return NextResponse.next({ request: { headers: req.headers } });
  }

  const response = NextResponse.next({ request: { headers: req.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          response.cookies.set({ name, value, ...(options as any) });
        },
        remove(name: string, options: Record<string, unknown>) {
          response.cookies.set({ name, value: "", ...(options as any) });
        },
      },
    }
  );

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  const isLoggedIn = !userError && !!user;

  // /login
  if (pathname === "/login") {
    if (!isLoggedIn) return response;
    const role = await getSafeRole(supabase, user!);
    if (!role) return response;
    return NextResponse.redirect(new URL(roleToDashboard(role), req.url));
  }

  // /dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) {
      const url = new URL("/login", req.url);
      url.searchParams.set("redirected", "true");
      return NextResponse.redirect(url);
    }

    const role = await getSafeRole(supabase, user!);

    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      return NextResponse.redirect(new URL(roleToDashboard(role), req.url));
    }

    if (role) {
      const correct = roleToDashboard(role);
      const wrongAdmin = pathname.startsWith("/dashboard/admin") && role !== "admin";
      const wrongDoctor = pathname.startsWith("/dashboard/doctor") && role !== "doctor";
      const wrongPatient = pathname.startsWith("/dashboard/patient") && role !== "patient";

      if (wrongAdmin || wrongDoctor || wrongPatient) {
        return NextResponse.redirect(new URL(correct, req.url));
      }
    }

    return response;
  }

  return response;
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/login", "/signup"],
};