import { cache } from "react";
import { fetchAPI } from "@/lib/api";

const MAX_PAGES = 100;

export default cache(async function getAllPages() {
  const perPage = 100;
  let page = 1;
  let allPages = [];

  while (page <= MAX_PAGES) {
    const url = `/wp-json/wp/v2/pages?per_page=${perPage}&page=${page}&_fields=slug,modified,link,id,modified,yoast_head_json`;

    let response = null;
    try {
      response = await fetchAPI(url);
    } catch (err) {
      console.error("Error fetching pages:", err);
      break;
    }

    if (!response || !Array.isArray(response) || response.length === 0) break;

    allPages = allPages.concat(response);

    if (response.length < perPage) break;

    page++;
  }
  return {
    data: allPages,
  };
});
