"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { safeParse } from "@/utils/safeParse";
import { getWpSiteOrigin } from "@/lib/api";
import { FiSearch } from "react-icons/fi";
import InnerBanner from "@/components/sections/common/InnerBanner";
import { loadMorePostsAction } from "@/app/blog/actions";

export default function ClientBlogPage({
  postsData,
  categories,
  initialPage = 1,
  pagination,
  innerBannerData,
  initialSearch = "",
  initialCategory = "",
  initialTag = "",
  initialAuthor = "",
  footerData = null,
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [posts, setPosts] = useState(postsData || []);
  const [page, setPage] = useState(initialPage || 1);
  const [hasMore, setHasMore] = useState(pagination?.hasNext || false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const [totalPages, setTotalPages] = useState(pagination?.totalPages || 1);
  const [searchInput, setSearchInput] = useState(initialSearch || "");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || "");
  const [selectedTag, setSelectedTag] = useState(initialTag || "");
  const [selectedAuthor, setSelectedAuthor] = useState(initialAuthor || "");
  const [isSearching, setIsSearching] = useState(false);

  const [isSideSubmitting, setIsSideSubmitting] = useState(false);
  const [isSideSuccess, setIsSideSuccess] = useState(false);
  const [isSideError, setIsSideError] = useState(false);
  const sideRecaptchaRef = useRef(null);
  const sideWidgetId = useRef(null);
  const blogSectionRef = useRef(null);
  const topCategoriesScrollRef = useRef(null);
  const bottomCategoriesScrollRef = useRef(null);
  const [filterDock, setFilterDock] = useState("top");
  const [showFilterBar, setShowFilterBar] = useState(false);
  const dragState = useRef({ isDown: false, startX: 0, scrollStart: 0, activeEl: null });
  const lastScrollYRef = useRef(0);
  const scrollDirRef = useRef("down");

  const endDrag = () => {
    const el = dragState.current.activeEl;
    dragState.current.isDown = false;
    el?.classList.remove("cursor-grabbing");
    dragState.current.activeEl = null;
    window.removeEventListener("mouseup", endDrag);
    window.removeEventListener("mousemove", onDrag);
  };

  const onDrag = (e) => {
    const el = dragState.current.activeEl;
    if (!el || !dragState.current.isDown) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = x - dragState.current.startX;
    el.scrollLeft = dragState.current.scrollStart - walk;
  };

  const startDrag = (e, scrollRef) => {
    const el = scrollRef.current;
    if (!el) return;
    dragState.current.isDown = true;
    dragState.current.activeEl = el;
    dragState.current.startX = e.pageX - el.offsetLeft;
    dragState.current.scrollStart = el.scrollLeft;
    el.classList.add("cursor-grabbing");
    window.addEventListener("mouseup", endDrag);
    window.addEventListener("mousemove", onDrag, { passive: false });
  };

  useEffect(() => {
    return () => {
      window.removeEventListener("mouseup", endDrag);
      window.removeEventListener("mousemove", onDrag);
    };
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setPosts(postsData || []);
    setPage(initialPage || 1);
    setHasMore(pagination?.hasNext || false);
    setTotalPages(pagination?.totalPages || 1);
    setSearchInput(initialSearch || "");
    setSelectedCategory(initialCategory || "");
    setSelectedTag(initialTag || "");
    setSelectedAuthor(initialAuthor || "");
  }, [
    postsData,
    pagination,
    initialSearch,
    initialCategory,
    initialTag,
    initialPage,
    initialAuthor,
  ]);
  /* eslint-enable react-hooks/set-state-in-effect */

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (searchInput.trim() === "" && selectedTag === "") {
      setPosts(postsData || []);
      setPage(initialPage || 1);
      setHasMore(pagination?.hasNext || false);
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const result = await loadMorePostsAction(
          1,
          searchInput,
          selectedCategory,
          selectedTag,
          selectedAuthor
        );
        if (!cancelled) {
          setPosts(result?.data || []);
          setPage(1);
          setHasMore(result?.pagination?.hasNext || false);
          setTotalPages(result?.pagination?.totalPages || 1);
        }
      } catch (error) {
        if (!cancelled) console.error("Fetch error:", error);
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(delayDebounceFn);
    };
  }, [
    searchInput,
    selectedCategory,
    selectedTag,
    selectedAuthor,
    postsData,
    pagination,
    initialPage,
  ]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    const updateDockPosition = () => {
      const currentY = window.scrollY || window.pageYOffset || 0;
      const delta = currentY - lastScrollYRef.current;
      if (Math.abs(delta) > 2) {
        scrollDirRef.current = delta < 0 ? "up" : "down";
      }
      lastScrollYRef.current = currentY;

      const sectionEl = blogSectionRef.current;
      if (!sectionEl) return;

      const rect = sectionEl.getBoundingClientRect();
      const headerPassThreshold = 110;
      const sectionVisible =
        rect.top < window.innerHeight - 24 && rect.bottom > headerPassThreshold;
      const canShowBottomDock = rect.bottom >= window.innerHeight - 20;

      if (!sectionVisible) {
        setShowFilterBar(false);
        return;
      }

      if (scrollDirRef.current === "up") {
        // When section top clears header zone, dock back to top immediately.
        if (rect.top > headerPassThreshold) {
          setFilterDock("top");
          setShowFilterBar(true);
          return;
        }

        // Bottom dock is shown only when section occupies the viewport bottom
        // (prevents overlap while footer is visible).
        if (canShowBottomDock) {
          setFilterDock("bottom");
          setShowFilterBar(true);
        } else {
          setShowFilterBar(false);
        }
      } else {
        setFilterDock("top");
        setShowFilterBar(true);
      }
    };

    updateDockPosition();
    window.addEventListener("scroll", updateDockPosition, { passive: true });
    window.addEventListener("resize", updateDockPosition);

    return () => {
      window.removeEventListener("scroll", updateDockPosition);
      window.removeEventListener("resize", updateDockPosition);
    };
  }, []);

  const handleCategoryClick = (cat) => {
    if (!cat) {
      router.push("/blog");
      return;
    }
    router.push(`/blog/category/${cat.slug}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const isAllCategoryActive = pathname === "/blog" && !selectedCategory;

  const handlePageChange = (newPage) => {
    if (newPage === page || newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage);
    router.push(`${window.location.pathname}?${params.toString()}`);
  };

  const handleLoadMore = async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    setLoadMoreError(false);
    const nextPage = page + 1;
    try {
      const result = await loadMorePostsAction(
        nextPage,
        searchInput,
        selectedCategory,
        selectedTag,
        selectedAuthor
      );
      const newPosts = result?.data || [];
      setPosts((prev) => [...prev, ...newPosts]);
      setPage(nextPage);
      setHasMore(result?.pagination?.hasNext || false);
    } catch (e) {
      console.error("Failed to load more posts", e);
      setLoadMoreError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const patchRecaptchaA11y = (container) => {
      if (!container) return null;
      const apply = () => {
        container.querySelectorAll("textarea.g-recaptcha-response").forEach((el) => {
          el.setAttribute("aria-hidden", "true");
          el.setAttribute("title", "reCAPTCHA");
        });
        container.querySelectorAll("iframe").forEach((el) => {
          if (!el.getAttribute("title")) {
            el.setAttribute("title", "reCAPTCHA");
          }
        });
      };
      apply();
      const observer = new MutationObserver(apply);
      observer.observe(container, { childList: true, subtree: true });
      return observer;
    };
    window.onRecaptchaLoad = () => {
      if (typeof window !== "undefined" && window.grecaptcha && window.grecaptcha.render) {
        if (sideRecaptchaRef.current && !sideRecaptchaRef.current.hasChildNodes()) {
          sideWidgetId.current = window.grecaptcha.render(sideRecaptchaRef.current, {
            sitekey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
            theme: "dark",
          });
          patchRecaptchaA11y(sideRecaptchaRef.current);
        }
      }
    };
    if (typeof window !== "undefined" && window.grecaptcha && window.grecaptcha.render) {
      window.onRecaptchaLoad();
    }
  }, []);

  const handleSideFormSubmit = async (e) => {
    e.preventDefault();
    setIsSideError(false);
    const htmlForm = e.currentTarget;
    const formData = new FormData(htmlForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }
    let recaptchaToken = null;
    if (typeof window !== "undefined" && window.grecaptcha) {
      if (sideWidgetId.current == null) {
        alert("reCAPTCHA is not loaded yet. Please wait a moment and try again.");
        return;
      }
      recaptchaToken = window.grecaptcha.getResponse(sideWidgetId.current);
      if (!recaptchaToken) {
        alert("Please verify that you are not a robot.");
        return;
      }
    }
    setIsSideSubmitting(true);
    try {
      const siteOrigin = getWpSiteOrigin();
      const formId = process.env.NEXT_PUBLIC_BLOG_DETAILS_FORM_ID;
      if (!siteOrigin || !formId) {
        throw new Error("Missing WORDPRESS_API_URL or NEXT_PUBLIC_BLOG_DETAILS_FORM_ID");
      }
      const response = await fetch(`${siteOrigin}/wp-json/gf/v2/forms/${formId}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          "input_1.3": name,
          input_3: email,
          input_4: message,
          recaptchaToken,
          "g-recaptcha-response": recaptchaToken,
        }),
      });
      const result = await response.json().catch(() => null);
      if (result && result.is_valid === false) {
        const msg = result.validation_messages
          ? Object.values(result.validation_messages).filter(Boolean).join("\n")
          : "Form validation failed.";
        alert(msg);
        return;
      }
      if (!response.ok) throw new Error("Submission failed");
      htmlForm.reset();
      if (typeof window !== "undefined" && window.grecaptcha && sideWidgetId.current != null) {
        window.grecaptcha.reset(sideWidgetId.current);
      }
      router.push("/thank-you?from=blog-sidebar");
    } catch (error) {
      console.error("Sidebar form submission error:", error);
      setIsSideError(true);
      setTimeout(() => setIsSideError(false), 5000);
    } finally {
      setIsSideSubmitting(false);
    }
  };

  const renderFilterBarContent = (searchFieldId, scrollRef) => (
    <div className="flex max-lg:flex-col w-full gap-0 bg-black-700/80 backdrop-blur-md rounded-10 overflow-hidden">
      <form
        onSubmit={handleSearchSubmit}
        className="w-full lg:w-[320px] lg:border-r border-black-500/60"
      >
        <div className="form-group h-full">
          <label className="absolute opacity-0 size-0" htmlFor={searchFieldId}>
            Search <span>*</span>
          </label>
          <div className="relative w-full h-full flex items-center gap-8 ps-10">
            <FiSearch className=" text-white/60 pointer-events-none" size={20} />
            <input
              type="text"
              placeholder="Search blogs"
              name="search"
              id={searchFieldId}
              autoComplete="off"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-transparent rounded-none py-14 pr-44 text-white placeholder:text-white/60 focus:outline-none focus:ring-0 h-full text-body-4"
            />
          </div>
        </div>
      </form>

      <div className="flex-1 min-w-0">
        <div
          ref={scrollRef}
          className="flex gap-20 max-lg:gap-14 px-20 py-16 overflow-x-auto overflow-y-hidden cursor-grab select-none transition-opacity duration-150"
          onMouseDown={(e) => startDrag(e, scrollRef)}
        >
          <button
            onClick={() => handleCategoryClick(null)}
            aria-label="All Categories"
            className={`cursor-pointer flex-shrink-0 flex justify-between items-center gap-10 text-left transition-colors duration-200 ${
              isAllCategoryActive ? "text-gold font-bold" : "text-white"
            }`}
          >
            <span className="leading-[1] text-body-4 capitalize">All</span>
          </button>

          {categories?.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat)}
              aria-label={cat.name}
              className={`cursor-pointer flex-shrink-0 flex justify-between items-center gap-10 text-left transition-colors duration-200 ${
                pathname.includes(`/blog/category/${cat.slug}`) ||
                selectedCategory === cat.id.toString()
                  ? "text-gold font-bold"
                  : "text-white"
              }`}
            >
              <span className="leading-[1] text-body-4 capitalize">{cat.name}</span>
              <span className="inline-flex items-center justify-center size-24 font-semibold rounded-sm bg-black-200/20 !text-white text-center text-body-6">
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Script
        src="https://www.google.com/recaptcha/api.js?render=explicit&onload=onRecaptchaLoad"
        strategy="afterInteractive"
      />
      <main className="relative z-1 bg-black-800">
        {innerBannerData && <InnerBanner data={innerBannerData} aria-label="Blog" />}

        <section
          ref={blogSectionRef}
          className="blog-wrapper white bg-white relative py-80 max-lg:py-40"
        >
          <div className="container-fluid">
            <div
              className={`post-categories sticky max-lg:top-20 top-0 max-h-fit w-full mb-30 z-11 transition-all duration-300 ease-linear ${
                showFilterBar && filterDock === "top"
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 -translate-y-8 pointer-events-none"
              }`}
            >
              {renderFilterBarContent("blog-search-top", topCategoriesScrollRef)}
            </div>

            <div className="grid max-lg:grid-cols-1 grid-cols-4 gap-x-20 gap-y-40 xl:gap-40 w-full">
              <div className="col-span-1 max-md:order-2">
                <div className="flex flex-col w-full lg:sticky lg:top-[50px] top-30 gap-0 rounded-10">
                  {/* Sticky Sidebar Form */}
                  <div className="">
                    <div className="border border-black-500 bg-black-700 rounded-10 p-30 max-1025:p-20">
                      <div className="title title-white mb-30">
                        <h6 className="text-[var(--text-heading-5)] font-bold text-white leading-snug">
                          Build a Powerful eCommerce Platform That Drives Sales
                        </h6>
                      </div>
                      <form onSubmit={handleSideFormSubmit}>
                        <div className="form-group mb-20">
                          <input
                            type="text"
                            placeholder="Your name*"
                            name="name"
                            id="side-form-name"
                            aria-label="Your name"
                            autoComplete="name"
                            required
                            className="w-full rounded-10 border border-black-500 bg-black-800/50 py-12 px-15 text-body-5 text-white placeholder:text-white/40 focus:outline-none focus:border-white/40"
                          />
                        </div>
                        <div className="form-group mb-20">
                          <input
                            type="email"
                            placeholder="Your Email*"
                            name="email"
                            id="side-form-email"
                            aria-label="Your email address"
                            autoComplete="email"
                            required
                            className="w-full rounded-10 border border-black-500 bg-black-800/50 py-12 px-15 text-body-5 text-white placeholder:text-white/40 focus:outline-none focus:border-white/40"
                          />
                        </div>
                        <div className="form-group mb-20">
                          <textarea
                            placeholder="Message"
                            name="message"
                            id="side-form-message"
                            aria-label="Message"
                            autoComplete="off"
                            rows={3}
                            className="w-full rounded-10 border border-black-500 bg-black-800/50 py-12 px-15 text-body-5 text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 resize-none"
                          />
                        </div>
                        <div className="mb-20 w-full overflow-hidden">
                          <div ref={sideRecaptchaRef} className="origin-top-left scale-[0.8]" />
                        </div>
                        <button
                          type="submit"
                          aria-label="Consult Now"
                          className="btn btn-sm w-full"
                          disabled={isSideSubmitting}
                        >
                          <span className="btn-txt">
                            {isSideSubmitting ? "Sending..." : "Consult Now"}
                            <span
                              className="btn-txt-extra"
                              data-txt={isSideSubmitting ? "Sending..." : "Consult Now"}
                            ></span>
                          </span>
                        </button>
                        {isSideError && (
                          <div className="mt-15 p-15 bg-red-500/10 border border-red-500/30 rounded-md text-red-400 text-body-5 font-medium">
                            Something went wrong. Please try again.
                          </div>
                        )}
                      </form>
                    </div>

                    {/* Reviews Block */}
                    {footerData &&
                      (footerData.google_review_images || footerData.clutch_review_images) && (
                        <div className="mt-20 rounded-10 bg-black-700 border max-639:flex-col  max-991:flex-row max-1025:flex-col border-black-700 p-20 flex justify-between gap-20 items-center">
                          {(typeof footerData.google_review_images === "string"
                            ? footerData.google_review_images
                            : footerData.google_review_images?.url) &&
                            footerData.google_review_link && (
                              <Link
                                href={footerData.google_review_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Google Reviews"
                              >
                                <Image
                                  src={
                                    typeof footerData.google_review_images === "string"
                                      ? footerData.google_review_images
                                      : footerData.google_review_images.url
                                  }
                                  width={200}
                                  height={60}
                                  alt={
                                    footerData.google_review_images?.alt ||
                                    "Google Reviews - Encircle Technologies"
                                  }
                                  className="h-[40px] w-auto object-contain"
                                  unoptimized
                                />
                              </Link>
                            )}
                          {/* {footerData.google_review_images && footerData.clutch_review_images && (
                          <div className="border-t border-black-600" />
                        )} */}
                          {(typeof footerData.clutch_review_images === "string"
                            ? footerData.clutch_review_images
                            : footerData.clutch_review_images?.url) &&
                            footerData.clutch_review_link && (
                              <Link
                                href={footerData.clutch_review_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Clutch Reviews"
                              >
                                <Image
                                  src={
                                    typeof footerData.clutch_review_images === "string"
                                      ? footerData.clutch_review_images
                                      : footerData.clutch_review_images.url
                                  }
                                  width={200}
                                  height={60}
                                  alt={
                                    footerData.clutch_review_images?.alt ||
                                    "Clutch Reviews - Encircle Technologies"
                                  }
                                  className="h-[40px] w-auto object-contain"
                                  unoptimized
                                />
                              </Link>
                            )}
                        </div>
                      )}
                  </div>
                </div>
              </div>
              <div className="w-full max-lg:col-span-1 col-span-3 max-md:order-1">
                <div className="grid grid-cols-3 max-xl:grid-cols-2 max-lg:grid-cols-1 gap-y-40 gap-x-20 relative">
                  {isSearching && (
                    <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center min-h-[400px]">
                      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gold"></div>
                    </div>
                  )}
                  {posts.length > 0
                    ? posts.map((post) => {
                        const wordsPerMinute = 200;
                        const excerptWords = (post.excerpt?.rendered || "")
                          .replace(/<[^>]*>/g, "")
                          .split(/\s+/)
                          .filter(Boolean).length;
                        const readingTime = Math.max(
                          2,
                          Math.ceil((excerptWords * 5) / wordsPerMinute)
                        );
                        const category = categories?.find((c) => c.id === post.categories?.[0]);
                        const categoryName = category?.name || "Uncategorized";

                        return (
                          <div
                            key={post.slug}
                            className="card flex flex-col border border-black-600 rounded-10 pb-20 overflow-hidden"
                          >
                            <Link
                              href={`/blog/${post.slug}`}
                              aria-label={post.title?.rendered || post.title}
                            >
                              <div className="aspect-[48/33] w-full h-full relative">
                                <Image
                                  src={
                                    post.featured_image_url || "/Is-Next.js-Worth-It_–ProsCons.webp"
                                  }
                                  className="w-full h-full object-top object-cover rounded-bl-10 rounded-br-10"
                                  width={840}
                                  height={472}
                                  alt={post.title?.rendered || post.title || "Blog Post"}
                                  aria-label={post.title?.rendered || post.title || "Blog Post"}
                                />
                              </div>
                            </Link>
                            <div className="flex flex-col gap-10 m-0 px-20 mt-30">
                              {category?.slug ? (
                                <Link
                                  href={`/blog/category/${category.slug}`}
                                  aria-label={`View ${categoryName} articles`}
                                  className="inline-block overflow-hidden rounded-10 bg-black-600 py-8 px-14 text-body-5 mr-auto"
                                >
                                  {categoryName}
                                </Link>
                              ) : (
                                <div className="inline-block overflow-hidden rounded-10 bg-black-600 py-8 px-14 text-body-5 mr-auto">
                                  {categoryName}
                                </div>
                              )}
                              <div
                                className="inline-block overflow-hidden rounded-10 text-body-5 text-black-600"
                                suppressHydrationWarning
                              >
                                {new Date(post.date).toLocaleDateString("en-US", {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </div>
                            </div>
                            <Link
                              href={`/blog/${post.slug}`}
                              aria-label={post.title?.rendered || post.title}
                              className="title title-white mt-30 px-20"
                            >
                              <h3 className="h6">
                                {safeParse(post.title?.rendered || post.title || "")}
                              </h3>
                            </Link>
                            <div className="content black mt-20 mb-40 px-20">
                              <div className="line-clamp-3 text-body-4">
                                {safeParse(post.excerpt?.rendered || post.excerpt || "")}
                              </div>
                            </div>
                            <div className="flex flex-wrap max-sm:flex-col-reverse items-end justify-between w-full gap-20 px-20 mt-auto">
                              <Link
                                href={`/blog/${post.slug}`}
                                aria-label={post.title?.rendered || post.title}
                                className="btn btn-black btn-sm"
                              >
                                <span className="btn-txt">
                                  Read More
                                  <span className="btn-txt-extra" data-txt="Read More"></span>
                                </span>
                              </Link>
                              <div className="inline-block overflow-hidden text-body-4 text-black-700 font-bold">
                                {readingTime} min read
                              </div>
                            </div>
                          </div>
                        );
                      })
                    : !isSearching && (
                        <div className="col-span-full py-100 text-center">
                          <h3 className="h4 text-black-800">No posts found.</h3>
                          <p className="text-black-600 mt-10">
                            Try adjusting your search or category filter.
                          </p>
                        </div>
                      )}
                </div>
                {loadMoreError && (
                  <p className="text-center text-red-500 mt-20 text-body-4">
                    Failed to load more posts. Please try again.
                  </p>
                )}
                {totalPages > 1 &&
                  (() => {
                    const getPaginationPages = (current, total) => {
                      if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
                      if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
                      if (current >= total - 3)
                        return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
                      return [1, "...", current - 1, current, current + 1, "...", total];
                    };
                    return (
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
                              disabled={isLoading || p === page}
                              aria-label={`Page ${p}`}
                              className={`w-40 h-40 flex items-center justify-center rounded-[var(--radius-10)] border text-body-5 font-semibold transition-colors disabled:cursor-default cursor-pointer ${
                                p === page
                                  ? "bg-[var(--color-gold)] text-white border-[var(--color-gold)]"
                                  : "bg-white text-black-800 border-black-600/40 hover:border-[var(--color-gold)]"
                              }`}
                            >
                              {p}
                            </button>
                          )
                        )}
                        <button
                          onClick={() => handlePageChange(page + 1)}
                          disabled={isLoading || page >= totalPages}
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
                    );
                  })()}
              </div>
            </div>
            <div
              className={`post-categories fixed left-0 right-0 px-40 max-md:px-20 max-lg:bottom-20 lg:bottom-30 max-h-fit z-50 transition-all duration-300 ease-linear ${
                showFilterBar && filterDock === "bottom"
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 translate-y-150 pointer-events-none"
              }`}
            >
              {renderFilterBarContent("blog-search-bottom", bottomCategoriesScrollRef)}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
