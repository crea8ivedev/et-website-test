import he from "he";

export function decodeHtmlEntities(str) {
  return str ? he.decode(str) : "";
}

export function buildSiteUrl(apiUrl, fallbackPath = "") {
  if (apiUrl) {
    return apiUrl.replace(/https:\/\/[^/]+/, process.env.NEXT_PUBLIC_SITE_DOMAIN);
  }
  const base = process.env.NEXT_PUBLIC_SITE_DOMAIN;
  return fallbackPath ? `${base}/${fallbackPath}` : base;
}

function titleCase(str) {
  return str
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function buildFallbackMetadata(title, description, pathName = "") {
  const base = process.env.NEXT_PUBLIC_SITE_DOMAIN || "http://localhost:3000";
  const url = pathName ? `${base}/${pathName}` : base;

  const formattedTitle =
    title && (title.includes("-") || title.includes("_")) && !title.includes(" ")
      ? `${titleCase(title)} - Encircle Technologies`
      : title;

  return {
    metadataBase: new URL(base),
    title: formattedTitle,
    description,
    openGraph: {
      url,
      type: "website",
      title: formattedTitle,
      description,
      images: ["/images/brand/ET-Thumbnail-Final.webp"],
    },
  };
}

export function buildMetadata(yoastData, options = {}) {
  const {
    pathName = "",
    defaultTitle = "Encircle Technologies",
    defaultDesc = "Encircle Technologies",
  } = options;

  const generateMeta = (field, defaultValue = "") =>
    decodeHtmlEntities(yoastData[field] || defaultValue);

  const authorName = "Encircle Technologies";
  const keywords = yoastData?.focus_keyword || generateMeta("focus_keyword", "");

  const siteUrl = (apiUrl) => buildSiteUrl(apiUrl, pathName);

  const ogImages = (yoastData.og_image || []).map((img) => ({
    url: img.url || img,
    width: img.width || 1200,
    height: img.height || 630,
    alt: img.alt || "",
  }));

  const metaBase = {
    title: generateMeta("og_title", generateMeta("title", defaultTitle)),
    description: generateMeta("og_description", generateMeta("description", defaultDesc)),
    url: siteUrl(generateMeta("og_url", generateMeta("canonical"))),
    images: ogImages.length > 0 ? ogImages : [{ url: "/images/brand/ET-Thumbnail-Final.webp" }],
  };

  const robotsConfig = {
    index: generateMeta("robots.index") !== "noindex",
    follow: generateMeta("robots.follow") !== "nofollow",
    googleBot: {
      index: generateMeta("robots.index") !== "noindex",
      follow: generateMeta("robots.follow") !== "nofollow",
      "max-snippet": generateMeta("robots.max-snippet") || -1,
      "max-image-preview": generateMeta("robots.max-image-preview") || "large",
      "max-video-preview": generateMeta("robots.max-video-preview") || -1,
    },
  };

  const twitterImages = generateMeta("twitter_image")
    ? [generateMeta("twitter_image")]
    : metaBase.images.map((img) => img.url);

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_DOMAIN || "http://localhost:3000"),
    title: metaBase.title,
    description: metaBase.description,
    authors: [{ name: authorName }],
    publisher: authorName,
    keywords,
    alternates: {
      canonical: siteUrl(generateMeta("canonical")),
    },
    robots: robotsConfig,
    openGraph: {
      locale: generateMeta("og_locale", "en_US"),
      type: generateMeta("og_type", "website"),
      url: metaBase.url,
      siteName: generateMeta("og_site_name", "Encircle Technologies"),
      title: metaBase.title,
      description: metaBase.description,
      publishedTime: generateMeta("article_published_time"),
      modifiedTime: generateMeta("article_modified_time"),
      authors: generateMeta("article_author"),
      publisher: generateMeta("article_publisher"),
      images: metaBase.images,
    },
    twitter: {
      card: generateMeta("twitter_card", "summary_large_image"),
      site: generateMeta("twitter_site"),
      creator: generateMeta("twitter_creator"),
      domain: "Encircle Technologies",
      title: metaBase.title,
      description: metaBase.description,
      images: twitterImages,
    },
  };
}
