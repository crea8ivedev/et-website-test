import { fetchAPI } from "@/lib/api";
import { unstable_cache } from "next/cache";

const fetchTagsByIds = async (ids) => {
  if (!ids || ids.length === 0) return [];

  const url = `/wp-json/wp/v2/tags?include=${ids.join(",")}&_fields=id,name,slug,link`;
  try {
    const data = await fetchAPI(url);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching tags:", error);
    return [];
  }
};

export const getTagsByIds = async (ids) => {
  if (!ids || ids.length === 0) return [];

  return unstable_cache(async () => fetchTagsByIds(ids), [`tags-${ids.join("-")}`], {
    revalidate: 3600,
  })();
};
