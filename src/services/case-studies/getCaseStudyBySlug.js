import { fetchAPI } from "@/lib/api";
import { unstable_cache } from "next/cache";

const getCaseStudyBySlug = async (slug) => {
  return unstable_cache(
    async () => {
      const api = `/wp-json/wp/v2/case_study?slug=${encodeURIComponent(slug)}&_fields=id,slug,title,acf,yoast_head_json`;
      try {
        const response = await fetchAPI(api);
        return response?.[0] || null;
      } catch (error) {
        console.error("Error fetching case study by slug:", error);
        return null;
      }
    },
    [`case-study-detail-${slug}`],
    {
      revalidate: 3600,
    }
  )();
};

export default getCaseStudyBySlug;
