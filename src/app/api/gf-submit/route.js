import { NextResponse } from "next/server";
import { getWpSiteOrigin } from "@/lib/api";

const WP_ORIGIN = getWpSiteOrigin();
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;
const CSRF_COOKIE_NAME = "__Host-et_csrf";
const CSRF_COOKIE_FALLBACK_NAME = "et_csrf";

// Server-side allowlist — keeps arbitrary GF form IDs from being targeted
const ALLOWED_FORM_IDS = new Set(
  [
    process.env.NEXT_PUBLIC_CONTACT_FORM_ID,
    process.env.NEXT_PUBLIC_BLOG_DETAILS_FORM_ID,
    process.env.NEXT_PUBLIC_BLOG_DETAILS_BOTTOM_FORM_ID,
  ].filter(Boolean)
);

async function verifyRecaptcha(token) {
  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `secret=${encodeURIComponent(RECAPTCHA_SECRET)}&response=${encodeURIComponent(token)}`,
    signal: AbortSignal.timeout(5000),
  });
  const data = await res.json();
  return data.success === true;
}

function isAllowedOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const site = process.env.NEXT_PUBLIC_SITE_DOMAIN;
  if (!site) return true; // allow if not configured (avoid hard failure in previews)
  try {
    return new URL(origin).origin === new URL(site).origin;
  } catch {
    return false;
  }
}

function isValidCsrf(request) {
  const cookieToken =
    request.cookies.get(CSRF_COOKIE_NAME)?.value ||
    request.cookies.get(CSRF_COOKIE_FALLBACK_NAME)?.value;
  const headerToken = request.headers.get("x-csrf-token");
  return Boolean(cookieToken && headerToken && cookieToken === headerToken);
}

export async function POST(request) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!isValidCsrf(request)) {
    return NextResponse.json({ error: "CSRF check failed" }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { formId, recaptchaToken, ...fields } = body;

  if (!formId || !ALLOWED_FORM_IDS.has(String(formId))) {
    return NextResponse.json({ error: "Invalid form" }, { status: 400 });
  }

  if (!recaptchaToken) {
    return NextResponse.json({ error: "reCAPTCHA token required" }, { status: 400 });
  }

  // Server-side reCAPTCHA verification (consumes the token)
  if (RECAPTCHA_SECRET) {
    const isHuman = await verifyRecaptcha(recaptchaToken).catch(() => false);
    if (!isHuman) {
      return NextResponse.json({ error: "reCAPTCHA verification failed" }, { status: 403 });
    }
  }

  // Strip client-side reCAPTCHA fields — verified above, not forwarded to GF
  delete fields["g-recaptcha-response"];
  delete fields.recaptchaToken;

  if (!WP_ORIGIN) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const wpUrl = `${WP_ORIGIN}/wp-json/gf/v2/forms/${encodeURIComponent(String(formId))}/submissions`;
  try {
    const wpRes = await fetch(wpUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
      signal: AbortSignal.timeout(10000),
    });
    const data = await wpRes.json().catch(() => null);
    return NextResponse.json(data ?? {}, { status: wpRes.status });
  } catch {
    return NextResponse.json({ error: "Submission failed" }, { status: 502 });
  }
}
