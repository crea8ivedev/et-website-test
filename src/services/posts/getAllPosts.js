import { fetchAPI } from "@/lib/api";
import { unstable_cache } from "next/cache";

const MAX_PAGES = 100;

async function fetchAllPosts() {
  const perPage = 100;
  let page = 1;
  let allPosts = [];

  while (page <= MAX_PAGES) {
    const url = `/wp-json/wp/v2/posts?per_page=${perPage}&page=${page}&_fields=slug,modified,link`;

    const data = await fetchAPI(url);

    if (!data || !Array.isArray(data) || data.length === 0 || data === null) {
      break;
    }

    allPosts = [...allPosts, ...data];

    if (data.length < perPage) {
      break;
    }

    page++;
  }

  return {
    data: allPosts,
  };
}

const getAllPosts = unstable_cache(fetchAllPosts, ["all-posts"], {
  revalidate: 1800,
});

export default getAllPosts;
