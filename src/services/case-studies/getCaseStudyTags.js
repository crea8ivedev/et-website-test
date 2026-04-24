import { fetchAPI } from "@/lib/api";
import { unstable_cache } from "next/cache";

const MAX_PAGES = 100;

async function fetchCaseStudyTags() {
  const perPage = 100;
  let page = 1;
  let allTags = [];

  while (page <= MAX_PAGES) {
    const url = `/wp-json/wp/v2/case_study_tag?per_page=${perPage}&page=${page}&_fields=id,slug,name`;

    try {
      const data = await fetchAPI(url);
      if (!data || !Array.isArray(data) || data.length === 0) {
        break;
      }

      allTags = [...allTags, ...data];

      if (data.length < perPage) {
        break;
      }

      page++;
    } catch (error) {
      console.error("Error fetching case study tags:", error);
      break;
    }
  }

  return {
    data: allTags,
  };
}

const getCaseStudyTags = unstable_cache(fetchCaseStudyTags, ["all-case-study-tags"], {
  revalidate: 3600,
});

export default getCaseStudyTags;
