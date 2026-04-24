import DOMPurify from "isomorphic-dompurify";

function stripHtml(s) {
  if (!s || typeof s !== "string") return "";
  const clean = DOMPurify.sanitize(s, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  return clean.replace(/\s+/g, " ").trim();
}

/**
 * Builds a FAQPage JSON-LD schema from ACF page_content blocks.
 * Returns null if no faq_section block exists or has no valid items.
 */
export function buildFaqSchema(pageContent) {
  const sections = Array.isArray(pageContent) ? pageContent : [];
  const faqSection = sections.find((s) => s.acf_fc_layout === "faq_section");
  if (!faqSection) return null;

  const items = faqSection.faqs || faqSection.faq || [];
  const mainEntity = items
    .map((item) => ({
      "@type": "Question",
      name: stripHtml(item.question || item.heading || ""),
      acceptedAnswer: {
        "@type": "Answer",
        text: stripHtml(item.answer || item.description || ""),
      },
    }))
    .filter((q) => q.name && q.acceptedAnswer.text);

  if (!mainEntity.length) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity,
  };
}

function getSchemaTypes(node) {
  const type = node?.["@type"];
  if (Array.isArray(type)) return type;
  return typeof type === "string" ? [type] : [];
}

function isFaqPageNode(node) {
  return getSchemaTypes(node).includes("FAQPage");
}

/**
 * Keeps a single FAQPage node in Yoast schema and returns FAQ count.
 * All non-FAQ schema nodes remain unchanged.
 */
export function dedupeFaqSchemas(schema) {
  if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
    return { schema, faqCount: 0 };
  }

  let faqCount = 0;
  let keepFaqAssigned = false;
  const nextSchema = { ...schema };

  if (isFaqPageNode(nextSchema)) {
    faqCount += 1;
    keepFaqAssigned = true;
  }

  if (Array.isArray(nextSchema["@graph"])) {
    const originalGraph = nextSchema["@graph"];
    const filteredGraph = [];

    for (const node of originalGraph) {
      if (isFaqPageNode(node)) {
        faqCount += 1;
        if (!keepFaqAssigned) {
          filteredGraph.push(node);
          keepFaqAssigned = true;
        }
        continue;
      }
      filteredGraph.push(node);
    }

    if (filteredGraph.length !== originalGraph.length) {
      nextSchema["@graph"] = filteredGraph;
    }
  }

  return { schema: nextSchema, faqCount };
}

/**
 * Builds a BreadcrumbList JSON-LD schema.
 * Each crumb: { name, url, description?, image? }
 * Flat structure — item is a plain URL string, extra fields sit directly on ListItem.
 */
export function buildBreadcrumbSchema(crumbs) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => {
      const entry = {
        "@type": "ListItem",
        position: i + 1,
        name: crumb.name,
        item: crumb.url,
      };
      if (crumb.description) entry.description = crumb.description;
      if (crumb.image) entry.image = crumb.image;
      return entry;
    }),
  };
}
