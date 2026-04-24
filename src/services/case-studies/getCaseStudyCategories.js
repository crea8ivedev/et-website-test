import { fetchAPI } from "@/lib/api";
import { unstable_cache } from "next/cache";

const MAX_PAGES = 100;

async function fetchCaseStudyCategories() {
  const perPage = 100;
  let page = 1;
  let allCategories = [];

  while (page <= MAX_PAGES) {
    const url = `/wp-json/wp/v2/case_study_category?per_page=${perPage}&page=${page}&_fields=id,slug,name,count`;

    try {
      const data = await fetchAPI(url);
      if (!data || !Array.isArray(data) || data.length === 0) {
        break;
      }

      allCategories = [...allCategories, ...data];

      if (data.length < perPage) {
        break;
      }

      page++;
    } catch (error) {
      console.error("Error fetching case study categories:", error);
      break;
    }
  }

  return {
    data: allCategories.filter((cat) => cat.count > 0),
  };
}

const getCaseStudyCategories = unstable_cache(
  fetchCaseStudyCategories,
  ["all-case-study-categories"],
  {
    revalidate: 3600,
  }
);

export default getCaseStudyCategories;
