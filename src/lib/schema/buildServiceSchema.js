import { normalizeSiteUrl, normalizePathname, stripHtml } from "@/lib/schema/urls";

export function buildServiceSchema({
  themeOptions,
  pathname,
  serviceName,
  description,
  areaServed = ["IN", "US", "GB"],
  serviceType = "Web Development",
}) {
  const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_DOMAIN);
  const orgId = `${siteUrl}/#organization`;

  const p = normalizePathname(pathname);
  const name =
    typeof serviceName === "string" && serviceName.trim()
      ? serviceName.trim()
      : stripHtml(serviceName || "");

  const desc =
    typeof description === "string" && description.trim() ? stripHtml(description) : undefined;

  if (!name) return null;

  const url = p === "/" ? `${siteUrl}/` : `${siteUrl}${p}`;

  const node = {
    "@type": "Service",
    name,
    url,
    provider: { "@id": orgId },
    serviceType,
    areaServed,
  };
  if (desc) node.description = desc;

  // If global graph isn't present for some reason, add minimal provider fallback
  if (!themeOptions) {
    node.provider = { "@type": "Organization", name: "Encircle Technologies" };
  }

  return node;
}
