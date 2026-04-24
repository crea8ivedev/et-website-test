import { fetchAPI } from "@/lib/api";
import { unstable_cache } from "next/cache";

export async function getPostByCategory(
  categoryId,
  { perPage = 10, page = 1, exclude = [], fields = "" } = {}
) {
  const fetchPosts = async () => {
    let url = "/wp-json/wp/v2/posts?";

    const params = new URLSearchParams();
    if (categoryId != null) params.append("categories", categoryId);
    params.append("per_page", perPage);
    params.append("page", page);
    if (exclude.length > 0) params.append("exclude", exclude.join(","));

    const defaultFields =
      "slug,date,title,content,link,excerpt,status,featured_image_url,categories,author,tags,yoast_head_json";
    params.append("_fields", fields || defaultFields);

    url += params.toString();

    try {
      const response = await fetchAPI(url);
      return {
        data: response || [],
      };
    } catch (error) {
      console.error(`Error fetching posts for categoryId ${categoryId}:`, error);
      return { data: [] };
    }
  };

  const cacheKey = `posts-cat-${categoryId || "all"}-p${page}-l${perPage}-ex${exclude.join("-")}`;

  return unstable_cache(fetchPosts, [cacheKey], { revalidate: 600 })();
}

export default getPostByCategory;
