import { fetchAPI } from "@/lib/api";
import { unstable_cache } from "next/cache";

const getPostByCategoriesSeo = async ({ slug }) => {
  return unstable_cache(
    async () => {
      try {
        const url = `/wp-json/wp/v2/categories?slug=${slug}&_fields=yoast_head_json`;
        const response = await fetchAPI(url);

        const data = response?.[0]?.yoast_head_json;

        return data;
      } catch (error) {
        console.error("Error fetching post by categories SEO:", error);
        return null;
      }
    },
    [`post-by-categories-seo-${slug}`],
    {
      revalidate: 1800,
    }
  )();
};

export default getPostByCategoriesSeo;
