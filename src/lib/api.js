const RAW_WP_URL = process.env.WORDPRESS_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_API_URL;

const WP_V2_PREFIX = "/wp-json/wp/v2";

function normalizeBaseUrl(raw) {
  if (!raw) return "";
  try {
    const url = new URL(raw);
    // Keep origin + pathname; drop search/hash.
    return `${url.origin}${url.pathname}`.replace(/\/$/, "");
  } catch {
    return String(raw).replace(/\/$/, "");
  }
}

export function getWpRestBaseUrl() {
  const base = normalizeBaseUrl(RAW_WP_URL);
  if (!base) return "";
  return base.includes(WP_V2_PREFIX) ? base : `${base}${WP_V2_PREFIX}`;
}

export function getWpSiteOrigin() {
  const base = normalizeBaseUrl(RAW_WP_URL);
  if (!base) return "";
  try {
    return new URL(base).origin;
  } catch {
    return "";
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchAPI(
  endpoint,
  { retries = 4, baseDelay = 1000, revalidate = 3600 } = {}
) {
  const restBase = getWpRestBaseUrl();
  const siteOrigin = getWpSiteOrigin();
  if (!restBase && !siteOrigin) {
    console.warn(`[fetchAPI] WORDPRESS_API_URL is not defined. Skipping fetch for: ${endpoint}`);
    return null;
  }

  const rawEndpoint = String(endpoint || "");

  // Some endpoints (ACF options, Gravity Forms, etc.) are under /wp-json/* but NOT /wp-json/wp/v2.
  // Use the site origin for those, and the WP v2 REST base for standard wp/v2 endpoints.
  const url =
    rawEndpoint.startsWith("/wp-json/") && !rawEndpoint.startsWith(WP_V2_PREFIX)
      ? `${siteOrigin}${rawEndpoint}`
      : (() => {
          const safeEndpoint = rawEndpoint.startsWith(WP_V2_PREFIX)
            ? rawEndpoint.slice(WP_V2_PREFIX.length)
            : rawEndpoint;
          return `${restBase}${safeEndpoint}`;
        })();

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        next: { revalidate },
        signal: AbortSignal.timeout(15000),
      });

      if (res.status === 429) {
        if (attempt === retries) {
          console.error(`[fetchAPI] Rate limited on: ${endpoint}`);
          return null;
        }
        const retryAfter = res.headers.get("Retry-After");
        const delay = retryAfter
          ? parseInt(retryAfter, 10) * 1000
          : baseDelay * Math.pow(2, attempt);
        await sleep(delay);
        continue;
      }

      if (!res.ok) {
        console.error(`[fetchAPI] HTTP ${res.status} for: ${endpoint}`);
        return null;
      }
      return res.json();
    } catch (err) {
      if (attempt < retries) {
        await sleep(baseDelay * Math.pow(2, attempt));
        continue;
      }
      console.error(`[fetchAPI] Fetch error for: ${endpoint}`, err);
      return null;
    }
  }
}
