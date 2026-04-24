import getAllPages from "@/services/pages/getAllPages";
import getAllPosts from "@/services/posts/getAllPosts";
import getCaseStudyList from "@/services/case-studies/getCaseStudyList";
import getAllPostCategories from "@/services/taxonomy/getAllPostCategories";

function escapeXml(unsafe) {
  return String(unsafe)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

const MAX_SITEMAP_PAGES = 50;

async function fetchAllCaseStudies() {
  const allItems = [];
  let page = 1;
  while (page <= MAX_SITEMAP_PAGES) {
    try {
      const res = await getCaseStudyList({ page });
      if (!res?.data?.length) break;
      allItems.push(...res.data);
      if (res.pagination?.isLastPage || !res.pagination?.hasNext) break;
      page++;
    } catch (err) {
      console.error("Error fetching case study list page", page, err);
      break;
    }
  }
  return allItems;
}

function buildImageTags(images) {
  if (!images?.length) return "";
  return images
    .map(({ url, title, caption }) => {
      if (!url) return "";
      const titleTag = title ? `\n    <image:title>${escapeXml(title)}</image:title>` : "";
      const captionTag = caption
        ? `\n    <image:caption>${escapeXml(caption)}</image:caption>`
        : "";
      return `\n  <image:image>\n    <image:loc>${escapeXml(url)}</image:loc>${titleTag}${captionTag}\n  </image:image>`;
    })
    .join("");
}

function extractOgImage(yoast) {
  const ogImage = yoast?.og_image?.[0];
  if (!ogImage?.url) return null;
  return { url: ogImage.url, title: yoast?.og_title || yoast?.title || "" };
}

function buildUrlEntry({ loc, lastmod, changefreq, priority, images }) {
  const safeLoc = String(loc).replace(/\/$/, "");
  const lastmodTag = lastmod ? `\n  <lastmod>${escapeXml(lastmod)}</lastmod>` : "";
  const changefreqTag = changefreq ? `\n  <changefreq>${escapeXml(changefreq)}</changefreq>` : "";
  const priorityTag =
    typeof priority === "number"
      ? `\n  <priority>${escapeXml(priority.toFixed(1))}</priority>`
      : "";
  const imageTags = buildImageTags(images);

  return `<url>\n  <loc>${escapeXml(safeLoc)}</loc>${lastmodTag}${changefreqTag}${priorityTag}${imageTags}\n</url>`;
}

export async function GET() {
  const baseDomain = (process.env.NEXT_PUBLIC_SITE_DOMAIN || "").replace(/\/$/, "");

  try {
    const [pagesResult, postsResult, caseStudies, categoriesResult] = await Promise.all([
      getAllPages(),
      getAllPosts(),
      fetchAllCaseStudies(),
      getAllPostCategories(),
    ]);

    const homeUrl = buildUrlEntry({
      loc: baseDomain || "",
      changefreq: "monthly",
      priority: 1.0,
    });

    const legalSlugs = new Set(["privacy-policy", "accessibility-statement"]);
    const lowPrioritySlugs = new Set(["life-at-encircle", "company-profile"]);
    const coreServiceSlugs = new Set([
      "best-web-development-agency",
      "e-commerce-web-development-company",
      "headless-cms-development-company",
      "custom-web-application-development",
      "website-maintenance-support",
      "website-performance-optimization",
      "custom-ai-development-solutions",
      "accessibility-development-services",
    ]);

    const pageUrls = (pagesResult?.data || [])
      .filter((p) => p.slug && p.slug !== "home")
      .map((p) => {
        const slug = String(p.slug).replace(/^\/+/, "");
        let priority = 0.8;
        if (legalSlugs.has(slug)) priority = 0.3;
        else if (lowPrioritySlugs.has(slug)) priority = 0.5;
        else if (coreServiceSlugs.has(slug)) priority = 0.9;

        const ogImage = extractOgImage(p.yoast_head_json);
        return buildUrlEntry({
          loc: `${baseDomain}/${slug}`,
          lastmod: p.modified,
          changefreq: "monthly",
          priority,
          images: ogImage ? [ogImage] : undefined,
        });
      });

    const blogUrls = (postsResult?.data || [])
      .filter((p) => p.slug)
      .map((p) =>
        buildUrlEntry({
          loc: `${baseDomain}/blog/${p.slug}`,
          lastmod: p.modified,
          changefreq: "monthly",
          priority: 0.7,
        })
      );

    const categoryUrls = (categoriesResult?.data || [])
      .filter((cat) => cat.slug)
      .map((cat) =>
        buildUrlEntry({
          loc: `${baseDomain}/blog/category/${cat.slug}`,
          changefreq: "weekly",
          priority: 0.6,
        })
      );

    const caseStudyUrls = (caseStudies || [])
      .filter((cs) => cs.slug)
      .map((cs) => {
        const images = [];
        if (cs.featured_image_url) {
          images.push({
            url: cs.featured_image_url,
            title: cs.yoast_head_json?.og_title || cs.title?.rendered || "",
          });
        } else {
          const ogImage = extractOgImage(cs.yoast_head_json);
          if (ogImage) images.push(ogImage);
        }
        return buildUrlEntry({
          loc: `${baseDomain}/case-study/${cs.slug}`,
          lastmod: cs.modified,
          changefreq: "monthly",
          priority: 0.8,
          images,
        });
      });

    const urls = [homeUrl, ...pageUrls, ...blogUrls, ...categoryUrls, ...caseStudyUrls].join("\n");

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
      },
    });
  } catch (err) {
    console.error("sitemap.xml generation failed:", err);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"></urlset>`,
      { headers: { "Content-Type": "application/xml" } }
    );
  }
}
