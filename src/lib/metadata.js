import { DefaultDescription, DefaultTitle } from "@/constants";
import getPageSeo from "@/services/pages/getPageSeo";
import { isEmpty } from "@/utils/isEmpty";
import he from "he";

const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN || "http://localhost:3000";

export async function generatePageMetadata(slug, manualData = null) {
  const pageSeoData = manualData || (await getPageSeo(slug));

  if (isEmpty(pageSeoData)) {
    const fallbackTitle = DefaultTitle;
    const fallbackDesc = DefaultDescription;
    const fallbackUrl = `${SITE_DOMAIN}${slug === "home" ? "" : `/${slug}`}`;

    return {
      metadataBase: new URL(SITE_DOMAIN),
      title: fallbackTitle,
      description: fallbackDesc,
      openGraph: {
        url: fallbackUrl,
        type: "website",
        title: fallbackTitle,
        description: fallbackDesc,
        images: ["/images/brand/ET-logo.svg"],
      },
    };
  }

  const seoData = pageSeoData;

  function decodeHtmlEntities(str) {
    return str ? he.decode(str) : "";
  }

  const generateMeta = (field, defaultValue) => decodeHtmlEntities(seoData[field] || defaultValue);

  const authorName = "Encircle Technologies Pvt. Ltd.";
  const keywords = seoData?.meta_keywords || generateMeta("focus_keyword", "");

  const title = seoData?.meta_title || generateMeta("title", "");
  const description = seoData?.meta_description || generateMeta("description", "");

  const buildSiteUrl = (apiUrl) => {
    if (apiUrl) {
      return apiUrl.replace(/https:\/\/[^\/]+/, SITE_DOMAIN);
    }
    return SITE_DOMAIN;
  };

  const ogImages = seoData?.meta_image
    ? [
        {
          url: seoData.meta_image.url,
          width: seoData.meta_image.width || 1200,
          height: seoData.meta_image.height || 627,
          alt: seoData.meta_image.alt || "",
        },
      ]
    : [];

  const shouldIndex = seoData?.meta_robots_no_index !== true;
  const shouldFollow = seoData?.meta_robots_no_follow !== true;

  const robotsConfig = {
    index: shouldIndex,
    follow: shouldFollow,
    googleBot: {
      index: shouldIndex,
      follow: shouldFollow,
    },
  };

  const twitterImages =
    ogImages.length > 0 ? ogImages.map((img) => img.url) : [`${SITE_DOMAIN}/logo.svg`];

  const canonicalSlug = slug === "home" ? "" : `/${slug}`;
  const customCanonical = generateMeta("canonical");
  const canonicalUrl = customCanonical
    ? buildSiteUrl(customCanonical)
    : `${SITE_DOMAIN}${canonicalSlug}`;

  return {
    metadataBase: new URL(SITE_DOMAIN),
    title,
    description,
    authors: [{ name: authorName }],
    creator: authorName,
    publisher: authorName,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: robotsConfig,
    openGraph: {
      locale: "en_US",
      type: "website",
      url:
        generateMeta("og_url") || generateMeta("canonical")
          ? buildSiteUrl(generateMeta("og_url") || generateMeta("canonical"))
          : canonicalUrl,
      siteName: "Encircle Technologies Pvt. Ltd.",
      title,
      description,
      publishedTime: generateMeta("article_published_time"),
      modifiedTime: generateMeta("article_modified_time"),
      authors: authorName,
      publisher: authorName,
      images:
        ogImages.length > 0
          ? ogImages.map((img) => ({
              ...img,
              url: img.url,
            }))
          : [
              {
                url: `${SITE_DOMAIN}/logo.svg`,
                width: 1200,
                height: 627,
              },
            ],
    },
    twitter: {
      card: generateMeta("twitter_card", "summary_large_image"),
      site: generateMeta("twitter_site"),
      creator: generateMeta("twitter_creator"),
      domain: "Encircle Technologies Pvt. Ltd.",
      title,
      description,
      images: twitterImages,
    },
  };
}
