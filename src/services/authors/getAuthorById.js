import { fetchAPI } from "@/lib/api";
import { unstable_cache } from "next/cache";

const fetchAuthorById = async (id) => {
  if (!id) return null;

  const url = `/wp-json/wp/v2/users/${id}?_fields=id,name,description,url,link,slug,avatar_urls,acf,yoast_head_json`;
  try {
    const data = await fetchAPI(url);
    return data || null;
  } catch (error) {
    console.error(`Error fetching author with ID ${id}:`, error);
    return null;
  }
};

export const getAuthorById = async (id) => {
  if (!id) return null;

  return unstable_cache(async () => fetchAuthorById(id), [`author-${id}`], { revalidate: 3600 })();
};
