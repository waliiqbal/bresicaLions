import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { apiError, isSameOrigin } from "@/lib/api";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  signSessionToken,
  verifySessionToken,
} from "@/lib/session-token";
import {
  getAdminById,
  toAdminUser,
  type AdminUser,
} from "@/modules/auth/auth.service";

export async function createSession(admin: AdminUser) {
  const token = await signSessionToken({
    sub: admin.id,
    sv: admin.sessionVersion,
  });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/**
 * The logged-in admin, or null. Checks the cookie signature AND the database,
 * so a password reset (which bumps sessionVersion) logs old sessions out.
 */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await verifySessionToken(token);
  if (!session) return null;

  const admin = await getAdminById(session.sub);
  if (!admin || admin.sessionVersion !== session.sv) return null;
  return toAdminUser(admin);
}

/** For admin pages: sends visitors who are not logged in to the login page. */
export async function requireAdminPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

type AdminHandler<C> = (
  req: NextRequest,
  ctx: C & { admin: AdminUser },
) => Promise<Response>;

/**
 * Wraps a route handler so only the logged-in admin can call it. Every
 * mutating admin route must use this; proxy.ts alone is not enough.
 */
// Routes without a dynamic segment still receive `{ params }` from Next.js; the
// default says so, which keeps the type check of `next build --webpack` happy.
export function withAdmin<C = { params: Promise<object> }>(handler: AdminHandler<C>) {
  return async (req: NextRequest, ctx: C): Promise<Response> => {
    if (req.method !== "GET" && !isSameOrigin(req)) {
      return apiError("forbidden", "Cross-site request blocked.", 403);
    }
    const admin = await getCurrentAdmin();
    if (!admin) return apiError("unauthorized", "Please log in.", 401);
    return handler(req, { ...ctx, admin });
  };
}
