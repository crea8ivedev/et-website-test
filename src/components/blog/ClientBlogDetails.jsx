"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import parse, { domToReact } from "html-react-parser";
import DOMPurify from "isomorphic-dompurify";
import { parseWpHtml } from "@/utils/parseWpHtml";
import InnerBanner from "@/components/sections/common/InnerBanner";
import { usePathname, useRouter } from "next/navigation";

export default function ClientBlogDetails({
  post,
  categories = [],
  tags = [],
  author = null,
  recentPosts = [],
  initialCategory = "",
  prevPost = null,
  nextPost = null,
  footerData = null,
}) {
  const router = useRouter();

  const [fullUrl, setFullUrl] = useState("");
  const pathname = usePathname();
  const [showCategories, setShowCategories] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || "");

  const [isBottomSubmitting, setIsBottomSubmitting] = useState(false);
  const [isBottomSuccess, setIsBottomSuccess] = useState(false);
  const [isBottomError, setIsBottomError] = useState(false);
  const bottomRecaptchaRef = useRef(null);
  const bottomWidgetId = useRef(null);

  const [isSideSubmitting, setIsSideSubmitting] = useState(false);
  const [isSideSuccess, setIsSideSuccess] = useState(false);
  const [isSideError, setIsSideError] = useState(false);
  const sideRecaptchaRef = useRef(null);
  const sideWidgetId = useRef(null);
  const categoriesScrollRef = useRef(null);
  const heroImageRef = useRef(null);
  const blogWrapperRef = useRef(null);
  const [blogWrapperInView, setBlogWrapperInView] = useState(false);
  const dragState = useRef({ isDown: false, startX: 0, scrollStart: 0 });

  const containerRef = useRef(null);

  const getCsrfToken = () => {
    if (typeof document === "undefined") return "";
    const hostCookie = document.cookie.match(/(?:^|; )__Host-et_csrf=([^;]*)/);
    if (hostCookie) return decodeURIComponent(hostCookie[1]);
    const fallbackCookie = document.cookie.match(/(?:^|; )et_csrf=([^;]*)/);
    return fallbackCookie ? decodeURIComponent(fallbackCookie[1]) : "";
  };

  const equalizeHeights = () => {
    if (!containerRef.current) return;
    const allH3s = containerRef.current.querySelectorAll(".blog-card-title");
    allH3s.forEach((h3) => {
      h3.style.minHeight = "auto";
    });
    let maxHeight = 0;
    allH3s.forEach((h3) => {
      const h = h3.scrollHeight;
      if (h > maxHeight) maxHeight = h;
    });
    allH3s.forEach((h3) => {
      h3.style.minHeight = `${maxHeight}px`;
    });
  };

  useEffect(() => {
    if (!containerRef.current) return;
    equalizeHeights();
    const observer = new ResizeObserver(equalizeHeights);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  });

  useEffect(() => {
    const node = blogWrapperRef.current;
    if (!node) return;
    // Mirrors framer-motion `useInView({ margin: "0% 0px -80% 0px" })` —
    // considers the element visible only once it has entered the top 20%
    // of the viewport.
    const io = new IntersectionObserver(([entry]) => setBlogWrapperInView(entry.isIntersecting), {
      rootMargin: "0% 0px -80% 0px",
    });
    io.observe(node);
    return () => io.disconnect();
  }, []);

  const startDrag = (e) => {
    const el = categoriesScrollRef.current;
    if (!el) return;
    dragState.current.isDown = true;
    dragState.current.startX = e.pageX - el.offsetLeft;
    dragState.current.scrollStart = el.scrollLeft;
    el.classList.add("cursor-grabbing");
    window.addEventListener("mouseup", endDrag);
    window.addEventListener("mousemove", onDrag, { passive: false });
  };

  const endDrag = () => {
    const el = categoriesScrollRef.current;
    dragState.current.isDown = false;
    el?.classList.remove("cursor-grabbing");
    window.removeEventListener("mouseup", endDrag);
    window.removeEventListener("mousemove", onDrag);
  };

  const onDrag = (e) => {
    const el = categoriesScrollRef.current;
    if (!el || !dragState.current.isDown) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = x - dragState.current.startX;
    el.scrollLeft = dragState.current.scrollStart - walk;
  };

  useEffect(() => {
    return () => {
      window.removeEventListener("mouseup", endDrag);
      window.removeEventListener("mousemove", onDrag);
    };
  }, []);

  const handleCategoryClick = (cat) => {
    if (!cat) {
      router.push("/blog");
      return;
    }
    router.push(`/blog/category/${cat.slug}`);
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setFullUrl(window.location.href);
    setSelectedCategory(initialCategory || "");
    setShowCategories(true);
  }, [initialCategory]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const categoryBarVisible = showCategories && blogWrapperInView;

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

    let bottomObserver = null;
    let sideObserver = null;

    window.onRecaptchaLoad = () => {
      if (typeof window !== "undefined" && window.grecaptcha && window.grecaptcha.render) {
        try {
          if (bottomRecaptchaRef.current && !bottomRecaptchaRef.current.hasChildNodes()) {
            bottomWidgetId.current = window.grecaptcha.render(bottomRecaptchaRef.current, {
              sitekey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
              theme: "dark",
            });
            bottomObserver = patchRecaptchaA11y(bottomRecaptchaRef.current);
          }
          if (sideRecaptchaRef.current && !sideRecaptchaRef.current.hasChildNodes()) {
            sideWidgetId.current = window.grecaptcha.render(sideRecaptchaRef.current, {
              sitekey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
              theme: "dark",
            });
            sideObserver = patchRecaptchaA11y(sideRecaptchaRef.current);
          }
        } catch (err) {
          console.warn("reCAPTCHA rendering error", err);
        }
      }
    };

    if (typeof window !== "undefined" && window.grecaptcha && window.grecaptcha.render) {
      window.onRecaptchaLoad();
    }

    return () => {
      bottomObserver?.disconnect();
      sideObserver?.disconnect();
    };
  }, []);

  const handleBottomFormSubmit = async (e) => {
    e.preventDefault();
    setIsBottomError(false);

    const htmlForm = e.currentTarget;
    const formData = new FormData(htmlForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const message = String(formData.get("message") || "").trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    if (phone.length < 7) {
      alert("Please enter a valid phone number.");
      return;
    }

    let recaptchaToken = null;
    if (typeof window !== "undefined" && window.grecaptcha) {
      if (bottomWidgetId.current == null) {
        alert("reCAPTCHA is not loaded yet. Please wait a moment and try again.");
        return;
      }
      recaptchaToken = window.grecaptcha.getResponse(bottomWidgetId.current);
      if (!recaptchaToken) {
        alert("Please verify that you are not a robot.");
        return;
      }
    }

    setIsBottomSubmitting(true);
    try {
      const formId = process.env.NEXT_PUBLIC_BLOG_DETAILS_BOTTOM_FORM_ID;

      if (!formId) {
        throw new Error("Missing NEXT_PUBLIC_BLOG_DETAILS_BOTTOM_FORM_ID");
      }

      const csrfToken = getCsrfToken();

      const url = `/api/gf-submit`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
        body: JSON.stringify({
          formId,
          "input_1.3": name,
          input_2: phone,
          input_3: message,
          input_4: email,
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
      if (!response.ok) {
        throw new Error(`Submission failed with status ${response.status}`);
      }

      htmlForm.reset();
      if (typeof window !== "undefined" && window.grecaptcha && bottomWidgetId.current != null) {
        window.grecaptcha.reset(bottomWidgetId.current);
      }
      router.push("/thank-you?from=blog-bottom");
    } catch (error) {
      console.error("Bottom form submission error:", error);
      setIsBottomError(true);
      setTimeout(() => setIsBottomError(false), 5000);
    } finally {
      setIsBottomSubmitting(false);
    }
  };

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
      const formId = process.env.NEXT_PUBLIC_BLOG_DETAILS_FORM_ID;

      if (!formId) {
        throw new Error("Missing NEXT_PUBLIC_BLOG_DETAILS_FORM_ID");
      }

      const csrfToken = getCsrfToken();

      const url = `/api/gf-submit`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
        body: JSON.stringify({
          formId,
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
      if (!response.ok) {
        throw new Error(`Submission failed with status ${response.status}`);
      }

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

  if (!post) return null;

  const escapeHtml = (str) =>
    String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const siteDomain = process.env.NEXT_PUBLIC_SITE_DOMAIN || "";
  const parseOptions = {
    replace(node) {
      if (node.type === "tag" && node.name === "a") {
        const href = node.attribs?.href || "";
        const isExternal = href.startsWith("http") && !href.startsWith(siteDomain);
        if (isExternal) {
          return (
            <a {...node.attribs} target="_blank" rel="noopener noreferrer">
              {domToReact(node.children, parseOptions)}
            </a>
          );
        }
      }
    },
  };

  const postCategory = categories?.find((cat) => cat.id === post.categories?.[0]);

  const bannerData = {
    breadcrumbs: [
      { title: { title: "Blog", url: "/blog" } },
      { title: { title: post.title?.rendered || post.title, url: "#" } },
    ],
    heading: post.title?.rendered || post.title,
    short_description: `
      <div class="flex flex-wrap gap-x-30 gap-y-15 mt-30">
        <div class="flex items-center gap-10 w-fit text-white">
          <lord-icon
            src="https://cdn.lordicon.com/azemaxsk.json"
            trigger="loop"
            state="hover-slide"
            colors="primary:#ffffff"
            style="width:32px;height:32px;">
          </lord-icon>
          <span class="text-body-4" suppressHydrationWarning>${new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
        </div>
        ${
          postCategory
            ? `
        <div class="flex items-center gap-10 w-fit text-white">
          <lord-icon
            src="https://cdn.lordicon.com/ynhknmbh.json"
            trigger="loop"
            state="hover-slide"
            colors="primary:#ffffff"
            style="width:32px;height:32px;transform:rotate(90deg)">
          </lord-icon>
          <a href="/blog/category/${escapeHtml(postCategory.slug)}" class="text-body-4 capitalize text-white hover:text-gold transition-colors">${escapeHtml(postCategory.name)}</a>
        </div>`
            : ""
        }
      </div>
    `,
    video: "https://videos.files.wordpress.com/sP50vasF/website-code2.mp4",
    poster_image: { url: post.featured_image_url },
  };

  return (
    <>
      <Script
        src="https://www.google.com/recaptcha/api.js?render=explicit&onload=onRecaptchaLoad"
        strategy="afterInteractive"
      />
      <main className="relative z-1 bg-black-800">
        <InnerBanner data={bannerData} aria-label="Blog Detail" />

        <section
          ref={blogWrapperRef}
          className="single-blog white bg-white relative pt-80 max-lg:pt-40"
        >
          <div
            className={`post-categories single-blog-categories fixed max-lg:bottom-30 lg:top-[calc(100%-100px)] 1500:left-1/2 1500:-translate-x-1/2 max-h-fit z-3 w-full max-1024:px-20 max-w-[58rem] max-1441:max-w-[55rem] max-1439:max-w-[58rem] mx-auto transition-all duration-300 ease-linear ${
              categoryBarVisible
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 translate-y-150 pointer-events-none"
            }`}
          >
            <div className="flex flex-col w-full gap-0 bg-black-700/80 backdrop-blur-md rounded-10">
              <div
                ref={categoriesScrollRef}
                className={`flex gap-30 mt-0 px-20 py-20 overflow-x-auto overflow-y-hidden cursor-grab select-none transition-opacity duration-150`}
                onMouseDown={(e) => startDrag(e)}
              >
                {categories?.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat)}
                    aria-label={cat.name}
                    className={`cursor-pointer flex-shrink-0 flex justify-between items-center gap-10 text-left transition-colors duration-200 ${
                      pathname.includes(`/blog/category/${cat.slug}`) ||
                      selectedCategory === cat.id.toString()
                        ? "text-gold font-bold"
                        : ""
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

          <div className="container-fluid-lg pb-80 max-lg:pb-40">
            <div className="grid max-lg:grid-cols-1 lg:grid-cols-[1fr_360px] gap-40 w-full">
              <div className="w-full">
                <div className="w-full lg:w-8/12 mx-auto">
                  <div
                    className="img aspect-[48/33] rounded-10 overflow-hidden relative mb-40"
                    ref={heroImageRef}
                  >
                    <Image
                      src={post.featured_image_url || "/Is-Next.js-Worth-It_–ProsCons.webp"}
                      className="absolute inset-0 size-full object-contain"
                      alt={post.title?.rendered || "blog detail"}
                      aria-label={post.title?.rendered || "blog detail"}
                      width={1674}
                      height={1140}
                      priority
                    />
                  </div>
                </div>
                <div className="global-content content global-list black">
                  {parseWpHtml(post.content?.rendered || post.content || "", parseOptions)}
                </div>

                {(prevPost || nextPost) && (
                  <div className="mt-40 pt-30 border-t border-black-600/60">
                    <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-20">
                      {/* Previous Post */}
                      {prevPost ? (
                        <Link
                          href={`/blog/${prevPost.slug}`}
                          aria-label={`Previous: ${prevPost.title?.rendered || prevPost.title}`}
                          className="group flex items-center gap-15 p-20 rounded-10 border border-black-600/50 bg-black-700/5 hover:bg-black-700/10 hover:border-black-600 transition-all duration-300"
                        >
                          {/* Arrow */}
                          <div className="flex-shrink-0 flex items-center justify-center size-44 rounded-full border border-black-600/50 bg-white group-hover:bg-black-800 group-hover:border-black-800 transition-all duration-300">
                            <svg
                              className="size-18 text-black-800 group-hover:text-white transition-colors duration-300"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 19l-7-7 7-7"
                              />
                            </svg>
                          </div>

                          {/* Text */}
                          <div className="flex flex-col  overflow-hidden">
                            <span className="text-body-6 text-black-600 uppercase tracking-wider font-semibold">
                              Previous Post
                            </span>
                            {(prevPost.title?.rendered || prevPost.title !== "") && (
                              <>
                                <span className="text-body-4 block  font-semibold text-black-800 group-hover:text-gold transition-colors duration-300 line-clamp-2 leading-snug">
                                  {parse(
                                    DOMPurify.sanitize(
                                      prevPost.title?.rendered || prevPost.title || ""
                                    )
                                  )}
                                </span>
                              </>
                            )}
                          </div>
                        </Link>
                      ) : (
                        /* Empty placeholder to keep grid alignment */
                        <div />
                      )}

                      {/* Next Post */}
                      {nextPost ? (
                        <Link
                          href={`/blog/${nextPost.slug}`}
                          aria-label={`Next: ${nextPost.title?.rendered || nextPost.title}`}
                          className="group flex items-center justify-end gap-15 p-20 rounded-10 border border-black-600/50 bg-black-700/5 hover:bg-black-700/10 hover:border-black-600 transition-all duration-300 text-right"
                        >
                          {/* Text */}
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-body-6 text-black-600 uppercase tracking-wider font-semibold">
                              Next Post
                            </span>
                            <span className="text-body-4 font-semibold text-black-800 group-hover:text-gold transition-colors duration-300 line-clamp-2 leading-snug">
                              {parse(
                                DOMPurify.sanitize(nextPost.title?.rendered || nextPost.title || "")
                              )}
                            </span>
                          </div>

                          {/* Arrow */}
                          <div className="flex-shrink-0 flex items-center justify-center size-44 rounded-full border border-black-600/50 bg-white group-hover:bg-black-800 group-hover:border-black-800 transition-all duration-300">
                            <svg
                              className="size-18 text-black-800 group-hover:text-white transition-colors duration-300"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </Link>
                      ) : (
                        /* Empty placeholder to keep grid alignment */
                        <div />
                      )}
                    </div>
                  </div>
                )}

                {tags && tags.length > 0 && (
                  <div className="global-content black mt-40 pt-30 border-t border-black-600/60 flex flex-col justify-between items-start">
                    <h6 className="text-body-2 font-bold mb-10">Tags:</h6>
                    <div className="flex flex-wrap gap-15">
                      {tags.map((tag) => (
                        <Link
                          key={tag.id}
                          href={`/blog/tag/${tag.slug}`}
                          aria-label={tag.name}
                          className="text-body-4 hover:text-gold transition-colors"
                        >
                          #{tag.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-15 justify-end mt-10">
                  <span className="text-body-4 text-black-600/75">Share</span>
                  <div className="flex gap-10 items-center">
                    <Link
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black text-white p-6 rounded-sm hover:bg-gold transition-colors flex items-center justify-center shadow-sm"
                      aria-label="LinkedIn"
                    >
                      <svg className="size-16" fill="white" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                    </Link>
                    <Link
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black text-white p-6 rounded-sm hover:bg-gold transition-colors flex items-center justify-center shadow-sm"
                      aria-label="Facebook"
                    >
                      <svg className="size-16" fill="white" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </Link>
                    <Link
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(post.title?.rendered || post.title || "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black text-white p-6 rounded-sm hover:bg-gold transition-colors flex items-center justify-center shadow-sm"
                      aria-label="Twitter"
                    >
                      <svg className="size-16" fill="white" viewBox="0 0 24 24">
                        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.292 19.49h2.039L6.486 3.24H4.298l13.311 17.403z" />
                      </svg>
                    </Link>
                    <Link
                      href={`mailto:?subject=${encodeURIComponent(post.title?.rendered || post.title || "")}&body=${encodeURIComponent(fullUrl)}`}
                      className="bg-black text-white p-6 rounded-sm hover:bg-gold transition-colors flex items-center justify-center shadow-sm"
                      aria-label="Email"
                    >
                      <svg className="size-16" fill="white" viewBox="0 0 24 24">
                        <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => typeof window !== "undefined" && window.print()}
                      className="bg-black text-white p-6 rounded-sm hover:bg-gold transition-colors flex items-center justify-center shadow-sm"
                      aria-label="Print"
                    >
                      <svg className="size-16" fill="white" viewBox="0 0 24 24">
                        <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {author && (
                  <div className="mt-40 p-30 bg-black-700 rounded-10 flex flex-wrap max-md:flex-col gap-30 items-center md:items-center">
                    <div className="relative size-150 shrink-0">
                      <div className="absolute inset-0 rounded-full border-2 border-gold m-0"></div>
                      <Image
                        src={
                          author.acf?.user_image?.url ||
                          author.avatar_urls?.["96"] ||
                          "/Is-Next.js-Worth-It_–ProsCons.webp"
                        }
                        alt={author.name}
                        aria-label={author.name}
                        width={150}
                        height={150}
                        className="rounded-full size-full object-cover relative z-1 p-5"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-heading-6 font-bold mb-10">
                        About{" "}
                        <Link
                          href={`/blog/author/${author.slug}`}
                          aria-label={author.name}
                          className="hover:text-gold transition-colors"
                        >
                          {author.name}
                        </Link>
                      </h4>
                      <div className="flex flex-wrap items-center gap-15 mb-15">
                        <Link
                          href={`mailto:${author.acf?.user_email || "support@encircletechnologies.com"}`}
                          className="text-body-4 text-gold font-bold hover:underline"
                          aria-label={author.acf?.user_email || "support@encircletechnologies.com"}
                          target="_blank"
                        >
                          {author.acf?.user_email || "support@encircletechnologies.com"}
                        </Link>
                        <div className="flex items-center gap-10">
                          {author.yoast_head_json?.schema?.["@graph"]
                            ?.find((g) => g["@type"] === "Person")
                            ?.sameAs?.find((link) => link.includes("linkedin")) && (
                            <Link
                              href={author.yoast_head_json.schema["@graph"]
                                .find((g) => g["@type"] === "Person")
                                .sameAs.find((link) => link.includes("linkedin"))}
                              target="_blank"
                              className="bg-black text-white p-5 rounded-sm hover:bg-gold transition-colors"
                              aria-label="LinkedIn"
                            >
                              <svg className="size-16" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                              </svg>
                            </Link>
                          )}
                          <Link
                            href={`mailto:${author.acf?.user_email || "support@encircletechnologies.com"}`}
                            className="bg-black text-white p-5 rounded-sm hover:bg-gold transition-colors"
                            aria-label="Email"
                            target="_blank"
                          >
                            <svg className="size-16" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 0l-6 22-8.129-7.239 7.802-8.234-10.458 7.227-7.215-1.754 24-12zm-15 16.667v7.333l4.158-4.433-4.158-2.9z" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                      <div className="content">
                        <p className="!text-black-100 leading-relaxed">
                          {parse(DOMPurify.sanitize(author.description || ""))}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sticky Sidebar Form */}
              <div className="hidden lg:block">
                <div className="sticky top-[30px]">
                  <div className="border border-black-500 bg-black-700 rounded-10 p-30">
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
                        <div ref={sideRecaptchaRef} className="origin-top-left" />
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
                      <div className="mt-20 rounded-10 bg-black-700 border border-black-700 p-20 flex gap-20 items-center justify-between">
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
          </div>
        </section>

        {(() => {
          const filteredRecentPosts = (recentPosts || [])
            .filter((p) => p.slug !== post.slug)
            .slice(0, 3);

          if (filteredRecentPosts.length === 0) return null;

          return (
            <section
              className={`blog-wrapper bg-white relative py-80 max-lg:py-40 overflow-hidden in-view`}
              style={{
                backgroundSize: "30px 30px",
                backgroundPosition: "center",
                backgroundColor: "#ffffff",
                opacity: 1,
              }}
            >
              <div className="container-fluid-xl relative z-1">
                <div className="flex flex-col items-start justify-start w-full m-0 mb-40 last:mb-0 p-0">
                  <div className="w-full lg:w-10/12">
                    <div className={`title title-black fade-up in-view`}>
                      <h2 className="text-black-800">Our Recent Articles</h2>
                    </div>
                  </div>
                </div>

                <div
                  ref={containerRef}
                  className="grid grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-40 max-1199:gap-20"
                >
                  {filteredRecentPosts.map((blog, index) => {
                    const wordsPerMinute = 200;
                    const wordCount = (blog.content?.rendered || "")
                      .split(/\s+/)
                      .filter(Boolean).length;
                    const readingTime = Math.ceil(wordCount / wordsPerMinute);
                    const postCat = categories?.find((cat) => cat.id === blog.categories?.[0]);
                    const blogDate = new Date(blog.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    });

                    return (
                      <div
                        key={blog.slug}
                        className={`card flex flex-wrap border border-black-600 rounded-10 pb-20 fade-up delay-0${index + 1} in-view`}
                      >
                        <Link
                          href={`/blog/${blog.slug}`}
                          aria-label={blog.title?.rendered || blog.title}
                          className="relative block aspect-[48/33] w-full overflow-hidden rounded-10"
                        >
                          <Image
                            src={blog.featured_image_url || "/Is-Next.js-Worth-It_–ProsCons.webp"}
                            alt={blog.title?.rendered || blog.title}
                            aria-label={blog.title?.rendered || blog.title}
                            fill
                            className="object-cover transition-transform duration-500"
                          />
                        </Link>
                        <div className="h-auto flex flex-col">
                          <div className="flex flex-wrap items-center gap-10 m-0 mt-30 p-0 px-20 w-full">
                            {postCat?.slug ? (
                              <Link
                                href={`/blog/category/${postCat.slug}`}
                                aria-label={`View ${postCat.name} articles`}
                                className="inline-block overflow-hidden rounded-10 bg-black-600 py-8 px-14 text-body-6 text-white mr-auto"
                              >
                                {postCat.name}
                              </Link>
                            ) : (
                              <div className="inline-block overflow-hidden rounded-10 bg-black-600 py-8 px-14 text-body-6 text-white mr-auto">
                                {postCat?.name || "Web development"}
                              </div>
                            )}
                            <div
                              className="inline-block overflow-hidden rounded-10 text-body-6 text-black-600"
                              suppressHydrationWarning
                            >
                              {blogDate}
                            </div>
                          </div>

                          <div className="title title-black mt-30 px-20 hover:text-gold transition-colors">
                            <Link
                              href={`/blog/${blog.slug}`}
                              aria-label={blog.title?.rendered || blog.title}
                            >
                              <h3 className="h5 blog-card-title">
                                {parse(
                                  DOMPurify.sanitize(blog.title?.rendered || blog.title || "")
                                )}
                              </h3>
                            </Link>
                          </div>

                          <div className="content black mt-20 px-20 mb-auto">
                            <div className="line-clamp-2 text-black-600 text-body-4">
                              {parse(
                                DOMPurify.sanitize(blog.excerpt?.rendered || blog.excerpt || "")
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between w-full gap-20 mt-40 px-20">
                            <Link
                              href={`/blog/${blog.slug}`}
                              aria-label="Read More"
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
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        })()}

        <section className="relative py-80 max-lg:py-40 bg-black-800">
          <div className="container-fluid-lg">
            <div>
              <div className="title title-white mb-40">
                <h2 className="text-white">
                  Build a powerful web presense platform that drives sales
                </h2>
              </div>
              <div className="border border-black-500 bg-black-700/70 rounded-10 p-30 xl:p-40">
                <form onSubmit={handleBottomFormSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-20 mb-20">
                    <div className="form-group">
                      <label
                        className="text-body-5 mb-5 text-white block"
                        htmlFor="bottom-form-name"
                      >
                        Name <span className="text-gold">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Your Name"
                        name="name"
                        id="bottom-form-name"
                        autoComplete="name"
                        required
                        className="w-full rounded-10 border border-black-500 bg-black-800/50 py-12 px-15 text-body-5 text-white placeholder:text-white/40 focus:outline-none focus:border-white/40"
                      />
                    </div>
                    <div className="form-group">
                      <label
                        className="text-body-5 mb-5 text-white block"
                        htmlFor="bottom-form-email"
                      >
                        Email <span className="text-gold">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="Your Email"
                        name="email"
                        id="bottom-form-email"
                        autoComplete="email"
                        required
                        className="w-full rounded-10 border border-black-500 bg-black-800/50 py-12 px-15 text-body-5 text-white placeholder:text-white/40 focus:outline-none focus:border-white/40"
                      />
                    </div>
                  </div>
                  <div className="form-group mb-20">
                    <label
                      className="text-body-5 mb-5 text-white block"
                      htmlFor="bottom-form-phone"
                    >
                      Phone <span className="text-gold">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="Your Phone Number"
                      name="phone"
                      id="bottom-form-phone"
                      autoComplete="tel"
                      required
                      onInput={(e) => {
                        e.target.value = e.target.value.replace(/[^0-9]/g, "");
                      }}
                      className="w-full rounded-10 border border-black-500 bg-black-800/50 py-12 px-15 text-body-5 text-white placeholder:text-white/40 focus:outline-none focus:border-white/40"
                    />
                  </div>
                  <div className="form-group mb-20">
                    <label
                      className="text-body-5 mb-5 text-white block"
                      htmlFor="bottom-form-message"
                    >
                      Message <span className="text-gold">*</span>
                    </label>
                    <textarea
                      placeholder="Your Message"
                      name="message"
                      id="bottom-form-message"
                      autoComplete="off"
                      required
                      rows={4}
                      className="w-full rounded-10 border border-black-500 bg-black-800/50 py-12 px-15 text-body-5 text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 resize-none"
                    />
                  </div>
                  <div className="mb-20 w-full overflow-hidden">
                    <div
                      ref={bottomRecaptchaRef}
                      className="origin-top-left max-[400px]:scale-[0.82] max-[360px]:scale-[0.72]"
                    />
                  </div>
                  <div>
                    <button
                      type="submit"
                      aria-label="Send Message"
                      className="btn btn-sm"
                      disabled={isBottomSubmitting}
                    >
                      <span className="btn-txt">
                        {isBottomSubmitting ? "Sending..." : "Send Message"}
                        <span
                          className="btn-txt-extra"
                          data-txt={isBottomSubmitting ? "Sending..." : "Send Message"}
                        ></span>
                      </span>
                    </button>
                  </div>
                  {isBottomError && (
                    <div className="mt-15 p-15 bg-red-500/10 border border-red-500/30 rounded-md text-red-400 text-body-5 font-medium">
                      Something went wrong while submitting the form. Please try again in a moment
                      or contact us directly.
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
