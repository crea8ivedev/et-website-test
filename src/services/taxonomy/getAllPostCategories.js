import { fetchAPI } from "@/lib/api";
import { unstable_cache } from "next/cache";

const MAX_PAGES = 100;

async function fetchAllPostCategories() {
  const perPage = 100;
  let page = 1;
  let allPostCategories = [];

  while (page <= MAX_PAGES) {
    const url = `/wp-json/wp/v2/categories?per_page=${perPage}&page=${page}&_fields=count,slug,name,link,id`;

    const data = await fetchAPI(url);
    if (!data || !Array.isArray(data) || data.length === 0 || data === null) {
      break;
    }

    allPostCategories = [...allPostCategories, ...data];

    if (data.length < perPage) {
      break;
    }

    page++;
  }

  return {
    data: allPostCategories.filter((cat) => cat.count > 0),
  };
}

const getAllPostCategories = unstable_cache(fetchAllPostCategories, ["all-post-categories"], {
  revalidate: 3600,
});

export default getAllPostCategories;
