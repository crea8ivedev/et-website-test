import { fetchAPI } from "@/lib/api";
import { unstable_cache } from "next/cache";

const fetchAuthorBySlug = async (slug) => {
  if (!slug) return null;

  const url = `/wp-json/wp/v2/users?slug=${slug}&_fields=id,name,description,url,link,slug,avatar_urls,acf,yoast_head_json`;
  try {
    const data = await fetchAPI(url);
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error(`Error fetching author with slug ${slug}:`, error);
    return null;
  }
};

export const getAuthorBySlug = async (slug) => {
  if (!slug) return null;

  return unstable_cache(async () => fetchAuthorBySlug(slug), [`author-slug-${slug}`], {
    revalidate: 3600,
  })();
};
