import { fetchAPI, getWpRestBaseUrl } from "@/lib/api";
import { unstable_cache } from "next/cache";
import { createHash } from "crypto";

const toSafeInt = (val) => {
  const n = parseInt(val, 10);
  return isNaN(n) || n < 1 ? null : n;
};

const hashInput = (val) =>
  val ? createHash("sha256").update(String(val)).digest("hex").slice(0, 16) : "all";

const getPostList = async ({
  page = 1,
  search = "",
  categoryId = "",
  tagId = "",
  authorId = "",
}) => {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeCategoryId = toSafeInt(categoryId);
  const safeTagId = toSafeInt(tagId);
  const safeAuthorId = toSafeInt(authorId);

  return unstable_cache(
    async () => {
      const perPage = 6;
      let url = `/wp-json/wp/v2/posts?per_page=${perPage}&page=${safePage}&_fields=slug,date,title,link,excerpt,status,featured_image_url,categories,tags,author`;

      if (search) {
        url += `&search=${encodeURIComponent(search)}&search_columns=post_title`;
      }

      if (safeCategoryId) {
        url += `&categories=${safeCategoryId}`;
      }

      if (safeTagId) {
        url += `&tags=${safeTagId}`;
      }

      if (safeAuthorId) {
        url += `&author=${safeAuthorId}`;
      }

      try {
        const restBase = getWpRestBaseUrl();
        if (!restBase) {
          console.warn("[getPostList] WORDPRESS_API_URL is not defined");
          return {
            data: [],
            pagination: {
              currentPage: safePage,
              perPage,
              totalPages: 0,
              hasNext: false,
              hasPrev: false,
              isLastPage: true,
            },
          };
        }
        const WP_V2_PREFIX = "/wp-json/wp/v2";
        const safeEndpoint = url.startsWith(WP_V2_PREFIX) ? url.slice(WP_V2_PREFIX.length) : url;
        const res = await fetch(`${restBase}${safeEndpoint}`, {
          next: { revalidate: 600 },
          signal: AbortSignal.timeout(8000),
        });

        if (!res.ok) {
          console.error(`[getPostList] HTTP ${res.status}`);
          return {
            data: [],
            pagination: {
              currentPage: safePage,
              perPage,
              totalPages: 0,
              hasNext: false,
              hasPrev: false,
              isLastPage: true,
            },
          };
        }

        const data = await res.json();
        const total = parseInt(res.headers.get("x-wp-total") || "0", 10);
        const totalPages = Math.ceil(total / perPage);

        const isLastPage = safePage >= totalPages;
        const hasNext = safePage < totalPages;
        const hasPrev = safePage > 1;

        return {
          data,
          pagination: {
            currentPage: safePage,
            perPage,
            totalPages,
            hasNext,
            hasPrev,
            isLastPage,
          },
        };
      } catch (error) {
        console.error("Error fetching post list:", error);
        return {
          data: [],
          pagination: {
            currentPage: safePage,
            perPage,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
            isLastPage: true,
          },
        };
      }
    },
    [
      `post-list-${safePage}-${hashInput(search)}-${safeCategoryId || "all"}-${safeTagId || "all"}-${safeAuthorId || "all"}`,
    ],
    {
      revalidate: 600,
    }
  )();
};

export default getPostList;
