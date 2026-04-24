import { normalizePathname, normalizeSiteUrl, titleFromSlugSegment } from "@/lib/schema/urls";
import { buildBreadcrumbSchema } from "@/lib/schema/buildJsonLdSchemas";

function makeUrl(base, pathname) {
  const b = normalizeSiteUrl(base);
  const p = normalizePathname(pathname);
  return p === "/" ? `${b}/` : `${b}${p.startsWith("/") ? "" : "/"}${p}`;
}

export function buildBreadcrumbsForPath({ baseUrl, pathname, label = null }) {
  const p = normalizePathname(pathname);
  const segs = p.split("/").filter(Boolean);

  const crumbs = [{ name: "Home", url: makeUrl(baseUrl, "/") }];
  let acc = "";
  for (let i = 0; i < segs.length; i++) {
    acc += `/${segs[i]}`;
    const isLast = i === segs.length - 1;
    const name = isLast && label ? label : titleFromSlugSegment(segs[i]);
    crumbs.push({ name, url: makeUrl(baseUrl, acc) });
  }
  return buildBreadcrumbSchema(crumbs);
}

export function buildBreadcrumbsForBlogPost({ baseUrl, slug, title }) {
  const crumbs = [
    { name: "Home", url: makeUrl(baseUrl, "/") },
    { name: "Blog", url: makeUrl(baseUrl, "/blog") },
    { name: title || titleFromSlugSegment(slug), url: makeUrl(baseUrl, `/blog/${slug}`) },
  ];
  return buildBreadcrumbSchema(crumbs);
}

export function buildBreadcrumbsForCaseStudy({ baseUrl, slug, title }) {
  const crumbs = [
    { name: "Home", url: makeUrl(baseUrl, "/") },
    { name: "Case Studies", url: makeUrl(baseUrl, "/case-study") },
    { name: title || titleFromSlugSegment(slug), url: makeUrl(baseUrl, `/case-study/${slug}`) },
  ];
  return buildBreadcrumbSchema(crumbs);
}
