import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

export function ok<T extends object>(data?: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, ...data }, init);
}

export function apiError(
  code: string,
  message: string,
  status = 400,
  extra?: Record<string, unknown>,
) {
  return NextResponse.json(
    { ok: false, error: { code, message, ...extra } },
    { status },
  );
}

/** The visitor's address as seen by the host (used only for rate limiting). */
export function clientIp(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || req.headers.get("x-real-ip") || "unknown";
}

/**
 * Blocks cross-site form posts. Browsers always send Origin on POST, so a
 * mismatch means the request came from another site.
 */
export function isSameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

type ParseResult<S extends z.ZodType> =
  | { data: z.infer<S>; response?: never }
  | { data?: never; response: NextResponse };

/** Reads a JSON body and validates it. Used by every controller. */
export async function parseBody<S extends z.ZodType>(
  req: NextRequest,
  schema: S,
): Promise<ParseResult<S>> {
  if (!isSameOrigin(req)) {
    return { response: apiError("forbidden", "Cross-site request blocked.", 403) };
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return { response: apiError("bad_request", "Send a valid JSON body.") };
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    const first = (Object.values(fieldErrors) as string[][]).flat()[0];
    return {
      response: apiError("validation", first ?? "Check the form and try again.", 422, {
        fields: fieldErrors,
      }),
    };
  }
  return { data: parsed.data };
}

const STATUS_BY_CODE: Record<string, number> = {
  not_configured: 503,
  not_allowed: 403,
  closed: 409,
  cooldown: 429,
  locked: 429,
  invalid_code: 400,
  invalid_credentials: 401,
  mail_failed: 502,
};

export function statusForAuthError(code: string) {
  return STATUS_BY_CODE[code] ?? 400;
}

/** Turns a failed auth service result into a JSON error response. */
export function authFailure(result: {
  code: string;
  message: string;
  retryAfter?: number;
}) {
  return apiError(
    result.code,
    result.message,
    statusForAuthError(result.code),
    result.retryAfter ? { retryAfter: result.retryAfter } : undefined,
  );
}

const SERVICE_STATUS: Record<string, number> = {
  not_found: 404,
  not_allowed: 403,
  slug_taken: 409,
  name_taken: 409,
  in_use: 409,
  needs_image: 422,
  invalid: 422,
};

/** Turns a failed service result (not_found, slug_taken...) into a response. */
export function serviceFailure(result: { code: string; message: string }) {
  return apiError(result.code, result.message, SERVICE_STATUS[result.code] ?? 400);
}
