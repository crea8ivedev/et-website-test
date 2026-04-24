import { getWpRestBaseUrl } from "@/lib/api";
import { unstable_cache } from "next/cache";
import { createHash } from "crypto";

const getCaseStudyList = async ({ page = 1, search = "" }) => {
  const safePage = Math.max(1, parseInt(page, 10) || 1);

  const hashInput = (val) =>
    val ? createHash("sha256").update(String(val)).digest("hex").slice(0, 16) : "all";

  return unstable_cache(
    async () => {
      const perPage = 6;
      let url = `/wp-json/wp/v2/case_study?per_page=${perPage}&page=${safePage}&_fields=id,slug,title,acf,yoast_head_json,featured_image_url,case_study_category,case_study_tag,modified`;

      if (search) {
        url += `&search=${encodeURIComponent(search)}&search_columns=post_title`;
      }

      try {
        const restBase = getWpRestBaseUrl();
        if (!restBase) {
          console.warn("[getCaseStudyList] WORDPRESS_API_URL is not defined");
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
          console.error(`[getCaseStudyList] HTTP ${res.status}`);
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
        console.error("Error fetching case study list:", error);
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
    [`case-study-list-${safePage}-${hashInput(search)}`],
    {
      revalidate: 600,
    }
  )();
};

export default getCaseStudyList;
