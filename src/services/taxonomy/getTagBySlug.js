import { fetchAPI } from "@/lib/api";
import { unstable_cache } from "next/cache";

const getTagBySlug = async (slug) => {
  return unstable_cache(
    async () => {
      try {
        const url = `/wp-json/wp/v2/tags?slug=${slug}&_fields=id,name,slug,link`;
        const response = await fetchAPI(url);
        return response?.[0] || null;
      } catch (error) {
        console.error("Error fetching tag by slug:", error);
        return null;
      }
    },
    [`tag-by-slug-${slug}`],
    {
      revalidate: 3600,
    }
  )();
};

export default getTagBySlug;
