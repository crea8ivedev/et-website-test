import { fetchAPI } from "@/lib/api";
import { unstable_cache } from "next/cache";
import { sanitizeExternalUrls } from "@/utils/sanitizeExternalUrls";

async function fetchThemeOptions() {
  const themeOptionsApi = "/wp-json/acf/v3/options/options";
  try {
    const res = await fetchAPI(themeOptionsApi);

    const themeOptionsData = res?.acf ?? null;

    if (themeOptionsData) {
      return sanitizeExternalUrls(
        themeOptionsData,
        "themeOptions",
        new Set([
          "social_media_url",
          "url",
          "google_review_link",
          "clutch_review_link",
          "address_link",
        ])
      );
    }

    return themeOptionsData;
  } catch (error) {
    console.error("Error fetching theme options:", error);
    return null;
  }
}

const getThemeOptions = unstable_cache(fetchThemeOptions, ["theme-options"], { revalidate: 86400 });
export default getThemeOptions;
