import { fetchAPI } from "@/lib/api";
import { unstable_cache } from "next/cache";

export async function getPostSeo(slug) {
  return unstable_cache(
    async () => {
      const api = `/wp-json/wp/v2/posts?slug=${slug}&_fields=yoast_head_json`;
      try {
        const response = await fetchAPI(api);
        return response?.[0];
      } catch (error) {
        console.error(`[getPostSeo] Error fetching SEO for slug "${slug}":`, error);
        return null;
      }
    },
    [`post-seo-${slug}`],
    {
      revalidate: 1800,
    }
  )();
}
