const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN
  ? new URL(process.env.NEXT_PUBLIC_SITE_DOMAIN).hostname
  : "";
const WP_HOSTNAME = process.env.NEXT_PUBLIC_WORDPRESS_IMAGE_HOSTNAME || "";

const ALLOWED_DOMAINS = [
  "secure.gravatar.com",
  "i.ytimg.com",
  "files.wordpress.com",
  "youtube.com",
  "youtu.be",
  "youtube-nocookie.com",
  "cdn.lordicon.com",
  WP_HOSTNAME,
  SITE_DOMAIN,
].filter(Boolean);

function isAllowedUrl(value) {
  if (typeof value !== "string") return true;
  if (!value.startsWith("http://") && !value.startsWith("https://")) return true;
  try {
    const { hostname } = new URL(value);
    return ALLOWED_DOMAINS.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

function isSafeLink(value) {
  if (typeof value !== "string" || !value) return true;
  if (!value.startsWith("http://") && !value.startsWith("https://")) return true;
  try {
    const { protocol } = new URL(value);
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
}

function warn(path, value) {
  if (process.env.NODE_ENV === "development") {
    console.warn(
      `[SEC-SUPPLY-CHAIN] Blocked asset at "${path}": ${value}\n` +
        `  → Update the URL in WordPress ACF to use an allowed domain.`
    );
  }
}

export function sanitizeExternalUrls(obj, path = "acf", linkFields = new Set()) {
  if (typeof obj === "string") {
    if (!isAllowedUrl(obj)) {
      warn(path, obj);
      return "";
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item, i) => sanitizeExternalUrls(item, `${path}[${i}]`, linkFields));
  }

  if (typeof obj === "object" && obj !== null) {
    const out = {};
    for (const key in obj) {
      if (linkFields.has(key)) {
        const val = obj[key];
        if (typeof val === "string" && val && !isSafeLink(val)) {
          warn(`${path}.${key}`, val);
          out[key] = "";
        } else {
          out[key] = val;
        }
      } else {
        out[key] = sanitizeExternalUrls(obj[key], `${path}.${key}`, linkFields);
      }
    }
    return out;
  }

  return obj;
}
