import { fetchAPI } from "@/lib/api";
import { unstable_cache } from "next/cache";

export async function getPostBySlug(slug) {
  return unstable_cache(
    async () => {
      const api = `/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&_fields=id,slug,date,title,content,featured_image_url,categories,tags,author,yoast_head_json`;
      try {
        const response = await fetchAPI(api);
        return response?.[0] || null;
      } catch (error) {
        console.error("Error fetching post by slug:", error);
        return null;
      }
    },
    [`post-detail-${slug}`],
    {
      revalidate: 1800,
    }
  )();
}
