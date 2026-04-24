import { fetchAPI } from "@/lib/api";
import { unstable_cache } from "next/cache";

const getPostByTagSeo = async ({ slug }) => {
  return unstable_cache(
    async () => {
      try {
        const url = `/wp-json/wp/v2/tags?slug=${slug}&_fields=yoast_head_json`;
        const response = await fetchAPI(url);
        return response?.[0]?.yoast_head_json || null;
      } catch (error) {
        console.error("Error fetching post by tag SEO:", error);
        return null;
      }
    },
    [`post-by-tag-seo-${slug}`],
    {
      revalidate: 1800,
    }
  )();
};

export default getPostByTagSeo;
