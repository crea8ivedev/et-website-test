import { fetchAPI } from "@/lib/api";
import getAllPages from "@/services/pages/getAllPages";
import { isEmpty } from "@/utils/isEmpty";

export default async function getPageContent(slug) {
  try {
    if (slug === "home") {
      const response = await fetchAPI(`/wp-json/wp/v2/pages?slug=home&_fields=acf,yoast_head_json`);
      const data = response?.[0] ?? null;
      return { data };
    }

    const allPages = await getAllPages();

    const findPageMatch = (targetSlug) => {
      return allPages.data.find((page) => {
        try {
          const urlString = page.link.startsWith("http")
            ? page.link
            : `http://localhost${page.link.startsWith("/") ? "" : "/"}${page.link}`;
          return new URL(urlString).pathname.replace(/^\/|\/$/g, "") === targetSlug;
        } catch {
          return false;
        }
      });
    };

    const pageLink = findPageMatch(slug);

    if (!pageLink) return { data: null };

    const { slug: pageSlug } = pageLink;
    const api = `/wp-json/wp/v2/pages?slug=${encodeURIComponent(pageSlug)}&_fields=acf,yoast_head_json`;
    const response = await fetchAPI(api);
    const data = response?.[0] ?? null;
    return { data };
  } catch (error) {
    console.error("Error fetching page content:", error);
    return { data: null };
  }
}
