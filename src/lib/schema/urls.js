export function normalizeSiteUrl(domain) {
  const d = (domain || "").trim();
  if (!d) return "http://localhost:3000";
  return d.replace(/\/$/, "");
}

export function normalizePathname(input) {
  if (!input || typeof input !== "string") return "/";
  try {
    const url = input.startsWith("http") ? new URL(input) : new URL(input, "http://localhost");
    const path = url.pathname || "/";
    return path.replace(/\/+$/, "") || "/";
  } catch {
    const path = input.startsWith("/") ? input : `/${input}`;
    return path.replace(/\/+$/, "") || "/";
  }
}

export function stripHtml(input) {
  if (!input || typeof input !== "string") return "";
  return input
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function titleFromSlugSegment(seg) {
  const s = String(seg || "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!s) return "";
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}
