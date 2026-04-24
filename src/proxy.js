import { NextResponse } from "next/server";

const MAX_PATH_LENGTH = 500;

const DEFAULT_FRAME_SRC_DOMAINS = [
  "https://www.youtube.com",
  "https://www.youtube-nocookie.com",
  "https://youtube.com",
  "https://player.vimeo.com",
  "https://www.google.com",
  "https://maps.google.com",
  "https://open.spotify.com",
  "https://w.soundcloud.com",
  "https://www.loom.com",
  "https://loom.com",
  "https://player.twitch.tv",
  "https://www.facebook.com",
  "https://calendly.com",
  "https://share.vidyard.com",
  "https://fast.wistia.com",
  "https://www.ted.com",
  "https://embed.ted.com",
];

const FRAME_SRC_DOMAINS = [
  ...DEFAULT_FRAME_SRC_DOMAINS,
  ...(process.env.NEXT_PUBLIC_FRAME_SRC_ALLOWLIST
    ? process.env.NEXT_PUBLIC_FRAME_SRC_ALLOWLIST.split(/\s+/).filter(Boolean)
    : []),
].join(" ");

const CSRF_COOKIE_NAME = "__Host-et_csrf";
const CSRF_COOKIE_FALLBACK_NAME = "et_csrf";

function getOrCreateCsrfToken(request) {
  const existing =
    request.cookies.get(CSRF_COOKIE_NAME)?.value ||
    request.cookies.get(CSRF_COOKIE_FALLBACK_NAME)?.value;
  if (existing) return { token: existing, isNew: false };
  const token = crypto.randomUUID();
  return { token, isNew: true };
}

function buildCsp() {
  const isDev = process.env.NODE_ENV === "development";
  const wpOrigin = process.env.NEXT_PUBLIC_WORDPRESS_API_URL
    ? (() => {
        try {
          return new URL(process.env.NEXT_PUBLIC_WORDPRESS_API_URL).origin;
        } catch {
          return "";
        }
      })()
    : "";
  const wpImageHost = process.env.NEXT_PUBLIC_WORDPRESS_IMAGE_HOSTNAME
    ? `https://${process.env.NEXT_PUBLIC_WORDPRESS_IMAGE_HOSTNAME}`
    : "";

  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://cdn.lordicon.com https://cdn.jsdelivr.net https://www.google.com https://www.gstatic.com`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: https://secure.gravatar.com https://i.ytimg.com ${wpImageHost} ${wpOrigin}`.trimEnd(),
    "font-src 'self' data:",
    `connect-src 'self' ${wpOrigin} https://cdn.lordicon.com https://www.google.com https://www.gstatic.com https://vitals.vercel-insights.com`,
    `media-src 'self' https://videos.files.wordpress.com https://www.youtube-nocookie.com https://player.vimeo.com https://vimeo.com ${wpOrigin || wpImageHost}`.trimEnd(),
    `frame-src 'self' ${FRAME_SRC_DOMAINS}`,
    "frame-ancestors 'none'",
  ].join("; ");
}

export function proxy(request) {
  const { pathname } = request.nextUrl;

  if (pathname.includes("\0") || pathname.length > MAX_PATH_LENGTH) {
    return new NextResponse(null, { status: 400 });
  }

  const { token: csrfToken, isNew: isNewCsrf } = getOrCreateCsrfToken(request);

  const response = NextResponse.next();

  response.headers.set("Content-Security-Policy", buildCsp());

  if (isNewCsrf) {
    const cookieOptions = {
      value: csrfToken,
      httpOnly: false,
      sameSite: "lax",
      path: "/",
    };

    response.cookies.set({
      name: CSRF_COOKIE_NAME,
      ...cookieOptions,
      secure: true,
    });

    response.cookies.set({
      name: CSRF_COOKIE_FALLBACK_NAME,
      ...cookieOptions,
      secure: process.env.NODE_ENV !== "development",
    });
  } else {
    response.cookies.set({
      name: CSRF_COOKIE_FALLBACK_NAME,
      value: csrfToken,
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV !== "development",
      path: "/",
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets/).*)"],
};
