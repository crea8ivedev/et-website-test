"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Reveal } from "@/components/common/Reveal";
import { safeParse } from "@/utils/safeParse";
import { FiChevronDown, FiSearch } from "react-icons/fi";
import { searchCaseStudiesAction } from "@/app/case-study/actions";

const normalizeMetaItems = (value) => {
  if (!value) return [];

  const clean = (val) => {
    if (typeof val === "string") return val.replace(/&amp;/g, "&").trim();
    return val;
  };

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return clean(item);
        if (typeof item === "number") return String(item);
        const raw = item?.name || item?.title || item?.label || item?.slug || "";
        return clean(raw);
      })
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => clean(item))
      .filter(Boolean);
  }

  if (typeof value === "object") {
    const raw = value?.name || value?.title || value?.label || "";
    return raw ? [clean(raw)] : [];
  }

  return [];
};

const getTopMetaLine = (study = {}, allCategories = [], allTags = []) => {
  const acf = study?.acf || {};

  // Resolve IDs to names for WordPress taxonomies
  const resolvedCategories = (study?.case_study_category || [])
    .map((id) => allCategories.find((c) => c.id === id)?.name)
    .filter(Boolean);

  const resolvedTags = (study?.case_study_tag || [])
    .map((id) => allTags.find((t) => t.id === id)?.name)
    .filter(Boolean);
  const candidates = [
    acf?.card_top_labels,
    acf?.card_top_label,
    acf?.project_tags,
    acf?.project_tag,
    acf?.case_study_tags,
    acf?.case_study_tag,
    acf?.services,
    acf?.service,
    acf?.industries,
    acf?.industry,
    acf?.technologies,
    acf?.technology,
    acf?.tech_stack,
    acf?.platforms,
    resolvedCategories,
    resolvedTags,
    study?.case_study_tags, // fallback if names are already there
    study?.tags,
    study?.categories,
  ];

  const metaItems = candidates.flatMap(normalizeMetaItems).filter(Boolean);
  const uniqueItems = [...new Set(metaItems)].slice(0, 4);

  if (uniqueItems.length) return `[ ${uniqueItems.join(", ")} ]`;

  return "[ Case Study ]";
};

const stripHtml = (html = "") => {
  if (typeof html !== "string") return "";
  return html
    .replace(/<[^>]*>?/gm, "")
    .replace(/&amp;/g, "&")
    .trim();
};

const getCaseStudyTitle = (study = {}) => {
  const acf = study?.acf || {};
  const contentBlocks = acf?.case_study_content || [];
  const innerBanner =
    contentBlocks.find((b) => b.acf_fc_layout === "inner_banner") || contentBlocks[0] || {};

  const rawTitle =
    innerBanner.heading || acf?.heading || study?.title?.rendered || study?.title || "";
  return stripHtml(rawTitle);
};

const getCaseStudyDescription = (study = {}) => {
  const acf = study?.acf || {};
  const contentBlocks = acf?.case_study_content || [];
  const innerBanner =
    contentBlocks.find((b) => b.acf_fc_layout === "inner_banner") || contentBlocks[0] || {};

  const rawDesc =
    innerBanner.short_description ||
    innerBanner.description ||
    acf?.short_description ||
    acf?.card_description ||
    acf?.meta_description ||
    acf?.seo_meta_data?.meta_description ||
    acf?.description ||
    study?.yoast_head_json?.description ||
    study?.excerpt?.rendered ||
    "";

  const cleaned = stripHtml(rawDesc);
  return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : "";
};

const CaseStudyCard = ({ study, delay, categories, tags }) => {
  const { title, slug } = study;
  const displayTitle = getCaseStudyTitle(study);
  const excerpt = getCaseStudyDescription(study);
  const topMetaLine = getTopMetaLine(study, categories, tags);

  return (
    <Reveal delay={Math.min(500, Math.round(((delay || 0) * 1000) / 100) * 100)} className="h-full">
      <Link
        href={`/case-study/${slug}`}
        aria-label={title?.rendered || title}
        className="casestudy-item group relative flex h-full border-t border-[#4F4F4F]"
      >
        <div className="pt-20 px-15 pb-52 flex h-full flex-col gap-10 w-full">
          <div className="flex flex-col gap-20">
            <div className="title title-white">
              <h2 className="h5 transition-colors duration-300 capitalize ease-in-out group-hover:text-gold [display:-webkit-box] [-webkit-line-clamp:3] [-webkit-box-orient:vertical] overflow-hidden">
                {displayTitle}
              </h2>
            </div>
            <div className="content">
              <p className="text-black-300">{excerpt || "No content"}</p>
            </div>
          </div>
          <div className="content pr-120 pt-4">
            <p className="!mb-0 tracking-[0.01em] text-black-300">{topMetaLine}</p>
          </div>
        </div>
        <span className="absolute right-15 bottom-20 text-body-5 text-black-300 transition-colors duration-300 ease-in-out group-hover:text-gold">
          Read More
        </span>
      </Link>
    </Reveal>
  );
};

const getPaginationPages = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
};

export default function ClientCaseStudy({
  caseStudyData,
  caseStudyProcessIcon,
  pagination,
  initialPage = 1,
  categories = [],
  tags = [],
}) {
  const heading = caseStudyProcessIcon?.heading;
  const headingDescription =
    caseStudyProcessIcon?.short_description ||
    caseStudyProcessIcon?.description ||
    "Explore client success stories with measurable outcomes across growth, performance, and digital experience.";

  const router = useRouter();
  const page = initialPage || 1;
  const totalPages = pagination?.totalPages || 1;

  const [searchInput, setSearchInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isSearching, setIsSearching] = useState(false);
  const [displayedStudies, setDisplayedStudies] = useState(caseStudyData || []);

  useEffect(() => {
    const filterAndSearch = async () => {
      let filtered = caseStudyData || [];

      // Category filter (local if we have all data, or we might need a new API call if paginated)
      if (selectedCategory !== "all") {
        filtered = filtered.filter((study) => {
          const studyCats = study.case_study_category || [];
          const categoryId = parseInt(selectedCategory, 10);
          return studyCats.includes(categoryId);
        });
      }

      if (searchInput.trim() === "") {
        setDisplayedStudies(filtered);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const result = await searchCaseStudiesAction(1, searchInput.trim());
        let searchResults = result?.data || [];

        // Apply category filter to search results if needed
        if (selectedCategory !== "all") {
          const categoryId = parseInt(selectedCategory, 10);
          searchResults = searchResults.filter((study) =>
            study.case_study_category?.includes(categoryId)
          );
        }

        setDisplayedStudies(searchResults);
      } catch (err) {
        console.error("Case study search error:", err);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(filterAndSearch, 400);
    return () => clearTimeout(timer);
  }, [searchInput, selectedCategory, caseStudyData]);

  const handlePageChange = (newPage) => {
    if (newPage === page || newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage);
    router.push(`${window.location.pathname}?${params.toString()}`);
  };

  return (
    <main className="relative z-1 bg-black-800">
      <section className="inner-banner-wrapper max-lg:pb-50 pb-80 pt-148 relative">
        <div className="container-fluid-lg">
          <div className="flex flex-wrap items-center justify-between max-xl:gap-30 lg:pt-50">
            <ul className="flex flex-wrap items-center p-0 xl:mb-20 relative gap-10 w-full">
              <li>
                <Link href="/" aria-label="Home">
                  <Image
                    src="/icons/ui/ring.png"
                    width="20"
                    height="20"
                    alt="encircle technologies"
                    aria-label="Encircle Technologies"
                    className="img-fluid"
                  />
                </Link>
              </li>
              <li>/</li>
              <Link href="/case-study" aria-label="Case Study" className="opacity-65">
                Case Study
              </Link>
            </ul>
            <div className="w-full">
              <div className="title title-white text-white">
                <Reveal as="h1">
                  <span> {heading} </span>
                </Reveal>
              </div>
              <div className="content max-w-920 mt-20">{safeParse(headingDescription)}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="casestudy-wrapper pb-80 max-lg:pb-40 bg-black-800 relative">
        <div className="container-fluid-lg">
          <div className="post-categories sticky max-lg:top-20 top-30 max-h-fit w-full mb-30 z-11">
            <div className="flex max-sm:flex-col items-center max-md:items-stretch gap-12 max-lg:gap-10 justify-between bg-black-700/80 backdrop-blur-md rounded-10 border border-black-600/40 p-10">
              <div className="relative w-full sm:max-w-320">
                <label className="absolute opacity-0 size-0" htmlFor="case-study-search">
                  Search case studies
                </label>
                <FiSearch
                  size={18}
                  className="pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 text-white/60"
                />
                <input
                  id="case-study-search"
                  name="caseStudySearch"
                  type="text"
                  placeholder="Search case studies"
                  autoComplete="off"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full rounded-10 border border-[#4F4F4F] bg-black-700/70 py-12 ps-44 pe-14 text-white placeholder:text-white/55 focus:outline-none focus:ring-0 focus:border-black-300"
                />
              </div>
              <div className="relative w-full sm:max-w-320">
                <label className="absolute opacity-0 size-0" htmlFor="case-study-category">
                  Filter by category
                </label>
                <select
                  id="case-study-category"
                  name="caseStudyCategory"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full appearance-none rounded-10 border border-[#4F4F4F] bg-black-700/70 py-12 ps-14 pe-40 text-white focus:outline-none focus:ring-0 focus:border-black-300"
                >
                  <option value="all">All Categories</option>
                  {Array.isArray(categories) &&
                    categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name.replace(/&amp;/g, "&")} ({cat.count})
                      </option>
                    ))}
                </select>
                <FiChevronDown
                  size={18}
                  className="pointer-events-none absolute right-14 top-1/2 -translate-y-1/2 text-white/60"
                />
              </div>
            </div>
          </div>

          <div className="relative grid max-md:grid-cols-1 max-xl:grid-cols-2 grid-cols-3 gap-50 max-lg:gap-30">
            {isSearching && (
              <div className="absolute inset-0 bg-black-800/60 z-10 flex items-center justify-center min-h-[300px]">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[var(--color-gold)]" />
              </div>
            )}
            {displayedStudies.length > 0
              ? displayedStudies.map((study, index) => (
                  <CaseStudyCard
                    key={study.id || index}
                    study={study}
                    delay={0.08 * (index % 3)}
                    categories={categories}
                    tags={tags}
                  />
                ))
              : !isSearching && (
                  <div className="col-span-full py-100 text-center">
                    <h3 className="h4 text-white">No case studies found.</h3>
                    <p className="text-black-300 mt-10">Try adjusting your search.</p>
                  </div>
                )}
          </div>

          {!searchInput && selectedCategory === "all" && totalPages > 1 && (
            <div className="flex justify-center items-center gap-8 mt-50 w-full mb-20 z-10 relative flex-wrap">
              {getPaginationPages(page, totalPages).map((p, i) =>
                p === "..." ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="w-40 h-40 flex items-center justify-center text-black-600 text-body-5 select-none"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    disabled={p === page}
                    aria-label={`Page ${p}`}
                    className={`w-40 h-40 flex items-center justify-center rounded-[var(--radius-10)] border text-body-5 font-semibold transition-colors disabled:cursor-default cursor-pointer ${
                      p === page
                        ? "bg-[var(--color-gold)] text-white border-[var(--color-gold)]"
                        : "bg-transparent text-white border-white hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                aria-label="Next Page"
                className="w-40 h-40 flex items-center justify-center text-[var(--color-gold)] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="size-16"
                >
                  <path d="M7 17L17 7M17 7H7M17 7v10" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
