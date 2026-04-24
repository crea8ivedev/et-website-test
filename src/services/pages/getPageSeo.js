import { fetchAPI } from "@/lib/api";
import getAllPages from "@/services/pages/getAllPages";
import { unstable_cache } from "next/cache";

const getCachedPages = unstable_cache(getAllPages, ["all-pages"], { revalidate: 3600 });

const getPathname = (link) => {
  try {
    const urlString = link.startsWith("http")
      ? link
      : `http://localhost${link.startsWith("/") ? "" : "/"}${link}`;
    return new URL(urlString).pathname.replace(/^\/|\/$/g, "");
  } catch {
    return "";
  }
};

export default async function getPageSeo(slug) {
  let api = "";
  let cleanSlug = slug;
  try {
    if (!slug || slug === "home") {
      api = `/wp-json/wp/v2/pages?slug=home&_fields=acf,id,yoast_head_json`;
    } else {
      const allPages = await getCachedPages();
      const pageLink = allPages.data.find((data) => getPathname(data.link) === slug);

      if (pageLink?.slug) {
        cleanSlug = pageLink.slug;
        api = `/wp-json/wp/v2/pages?slug=${cleanSlug}&_fields=yoast_head_json,acf`;
      } else {
        return null;
      }
    }

    const response = await fetchAPI(api);
    const data = response?.[0];
    if (!data) return null;

    if (data.acf?.meta_title || data.acf?.meta_description) {
      return { ...data.acf };
    }

    if (data.yoast_head_json) {
      const y = data.yoast_head_json;
      return {
        meta_title: y.title,
        meta_description: y.og_description || y.description,
        meta_image: y.og_image?.[0]
          ? {
              url: y.og_image[0].url,
              width: y.og_image[0].width,
              height: y.og_image[0].height,
              alt: y.og_image[0].alt || "",
            }
          : null,
        meta_robots_no_index: y.robots?.index === "noindex",
        meta_robots_no_follow: y.robots?.follow === "nofollow",
        canonical: y.canonical,
        og_url: y.og_url,
        twitter_card: y.twitter_card,
      };
    }

    return null;
  } catch (error) {
    console.error("getPageSeo error:", error);
    return null;
  }
}
