import { fetchAPI } from "@/lib/api";
import { unstable_cache } from "next/cache";

async function fetchPostsForSearch() {
  const perPage = 100;
  let page = 1;
  let content = [];

  while (true) {
    const api = `/wp-json/wp/v2/posts?per_page=${perPage}&page=${page}&_fields=featured_image_url,title,slug,date,type,link`;

    try {
      const data = await fetchAPI(api);

      if (!data || !Array.isArray(data) || data.length === 0) {
        break;
      }

      content = [...content, ...data];

      if (data.length < perPage) {
        break;
      }

      page++;
    } catch (error) {
      console.error("[getPostForSearch] Fetch error:", error);
      break;
    }
  }

  return {
    data: content,
  };
}

const getPostsForSearch = unstable_cache(fetchPostsForSearch, ["posts-for-search"], {
  revalidate: 600,
});

export default getPostsForSearch;
