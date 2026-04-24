import { fetchAPI } from "@/lib/api";
import { unstable_cache } from "next/cache";

const MAX_PAGES = 100;

async function fetchAllCaseStudies() {
  const perPage = 100;
  let page = 1;
  let all = [];

  while (page <= MAX_PAGES) {
    const url = `/wp-json/wp/v2/case_study?per_page=${perPage}&page=${page}&_fields=slug,modified,link`;

    const data = await fetchAPI(url);

    if (!data || !Array.isArray(data) || data.length === 0) {
      break;
    }

    all = [...all, ...data];

    if (data.length < perPage) {
      break;
    }

    page++;
  }

  return { data: all };
}

const getAllCaseStudies = unstable_cache(fetchAllCaseStudies, ["all-case-studies"], {
  revalidate: 1800,
});

export default getAllCaseStudies;
