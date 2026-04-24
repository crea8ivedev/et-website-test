import parse from "html-react-parser";

const JSON_LD_SCRIPT_RE =
  /<script[^>]+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi;

// Lightweight server-safe sanitizer: strips dangerous tags/attributes without
// requiring jsdom or isomorphic-dompurify (which cause ERR_REQUIRE_ESM on Vercel).
const DANGEROUS_TAGS_RE =
  /<(script|style|iframe|object|embed|form|input|button|link)[^>]*>[\s\S]*?<\/\1>|<(script|style|iframe|object|embed|form|input|button|link)[^>]*\/?>/gi;
const DANGEROUS_ATTRS_RE = /\s(on\w+|javascript:|srcdoc|data:)[^"'>]*(["'])[^"']*\2/gi;

function serverSanitize(html) {
  return html
    .replace(JSON_LD_SCRIPT_RE, "")
    .replace(DANGEROUS_TAGS_RE, "")
    .replace(DANGEROUS_ATTRS_RE, "");
}

const stripJsonLdReplace = (node) => {
  if (
    node.type === "script" &&
    (node.attribs?.type === "application/ld+json" || node.attribs?.type === "application/ld%2Bjson")
  ) {
    return <></>;
  }
};

/**
 * Drop-in for parse() — strips application/ld+json <script> tags that
 * WordPress/Yoast may embed inline in content fields. Pass existing options
 * (e.g. parseOptions with a replace fn) via extraOptions; both replacers run.
 *
 * Uses a lightweight regex-based sanitizer instead of isomorphic-dompurify to
 * avoid ESM/CJS incompatibility errors in Vercel's Node.js runtime.
 */
export function parseWpHtml(html, extraOptions = {}) {
  if (!html || typeof html !== "string") return null;
  const replace = extraOptions.replace
    ? (node) => extraOptions.replace(node) ?? stripJsonLdReplace(node)
    : stripJsonLdReplace;
  return parse(serverSanitize(html), { ...extraOptions, replace });
}

/**
 * Sanitize an HTML string for dangerouslySetInnerHTML — removes any
 * application/ld+json <script> blocks before injecting raw HTML.
 */
export function sanitizeWpHtml(html) {
  if (!html || typeof html !== "string") return "";
  return html.replace(JSON_LD_SCRIPT_RE, "");
}
