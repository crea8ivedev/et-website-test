"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { safeParse } from "@/utils/safeParse";
import he from "he";

export default function BlogSection({ data, title }) {
  const [blogs, setBlogs] = useState([]);
  const containerRef = useRef(null);

  const categoryId =
    data?.select_blogs?.term_id || data?.select_blogs || data?.category_id || data?.select_category;

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (categoryId != null && categoryId !== "") params.set("categoryId", String(categoryId));
    params.set("perPage", "3");
    fetch(`/api/posts?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((json) => {
        if (!cancelled && Array.isArray(json?.data) && json.data.length > 0) {
          setBlogs(json.data.slice(0, 3));
        }
      })
      .catch((err) => {
        if (!cancelled) console.error("fetchBlogs error:", err);
      });
    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const equalizeHeights = () => {
      const allH3s = el.querySelectorAll(".blog-card-title");
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
    equalizeHeights();
    const observer = new ResizeObserver(equalizeHeights);
    observer.observe(el);
    return () => observer.disconnect();
  }, [blogs]);

  if (!data) return null;

  const heading = data?.heading || "";
  const description = (data?.description || "").replace(/<p>(\s|&nbsp;)*<\/p>/gi, "").trim();
  const categoryName = data?.select_blogs?.name;

  return (
    <section
      className={`blog-wrapper bg-white relative py-80 max-lg:py-40 in-view ${data?.extra_class ? ` ${data.extra_class}` : ""}`}
      id={(data?.extra_id || "").replace(/^title=['"](.*)['"]$/, "$1")}
    >
      <div className="container-fluid-xl">
        <div className="flex flex-col items-start justify-start w-full m-0 max-lg:mb-40 mb-60 last:mb-0 p-0">
          <div className="w-full lg:w-8/12">
            {heading && (
              <div className={`title title-black mb-20 fade-up in-view`}>
                <h2>{safeParse(heading)}</h2>
              </div>
            )}
            {description && (
              <div className={`content black fade-up delay-01 in-view`}>
                {safeParse(description)}
              </div>
            )}
          </div>
        </div>

        <div
          ref={containerRef}
          className="grid grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-x-20 gap-y-40 lg:gap-20 xl:gap-40"
        >
          {blogs.map((blog, index) => {
            const rawBlogTitle = blog.title?.rendered || blog.post_title || blog.title || "";
            const blogTitle = typeof rawBlogTitle === "string" ? rawBlogTitle : "";
            const strippedTitle = blogTitle.replace(/(<([^>]+)>)/gi, "");

            const blogLink = blog.slug
              ? `/blog/${blog.slug}`
              : blog.post_name
                ? `/blog/${blog.post_name}`
                : blog.link || "#";
            const blogDate =
              blog.date || blog.post_date
                ? new Date(blog.date || blog.post_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "June 12, 2024";

            const rawExcerpt =
              blog.excerpt?.rendered ||
              blog.post_excerpt ||
              blog.description ||
              `${strippedTitle}. Stay ahead in the digital landscape with our expert insights.`;
            const blogExcerpt =
              typeof rawExcerpt === "string"
                ? he.decode(rawExcerpt.replace(/(<([^>]+)>)/gi, ""))
                : rawExcerpt;

            return (
              <div
                key={index}
                className="card flex flex-col border border-black-600 rounded-10 pb-20"
              >
                <Link href={blogLink} aria-label={strippedTitle}>
                  <div className={`aspect-[48/33] w-full h-full fade-in delay-01 in-view`}>
                    <Image
                      src={
                        blog.featured_image_url ||
                        blog.image?.url ||
                        "/Is-Next.js-Worth-It_–ProsCons.webp"
                      }
                      className="w-full h-full object-top object-cover rounded-10"
                      width={840}
                      height={472}
                      alt={blog.image?.alt || strippedTitle}
                      aria-label={strippedTitle}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                </Link>

                <div
                  className={`flex flex-wrap items-center gap-10 m-0 mt-30 p-0 px-20 w-full fade-up delay-01 in-view`}
                >
                  <div className="inline-block overflow-hidden rounded-10 bg-black-600 py-8 px-14 text-body-6 mr-auto">
                    {categoryName || "Web development"}
                  </div>
                  <div className="inline-block overflow-hidden rounded-10 text-body-6 text-black-600">
                    {blogDate}
                  </div>
                </div>

                <Link
                  href={blogLink}
                  aria-label={strippedTitle}
                  className={`title title-white mt-30 px-20 fade-up delay-02 in-view`}
                >
                  <h3 className="h5 blog-card-title">{safeParse(blogTitle)}</h3>
                </Link>

                <div className={`content black mt-20 mb-40 px-20 fade-up delay-03 in-view`}>
                  <p className="line-clamp-3">{blogExcerpt}</p>
                </div>

                <div
                  className={`flex flex-wrap items-center justify-between w-full gap-20 mt-auto px-20 fade-up delay-04 in-view`}
                >
                  <Link
                    href={blogLink}
                    aria-label={`Read more about ${strippedTitle || "this post"}`}
                    className="btn btn-black btn-sm"
                  >
                    <span className="btn-txt">
                      Read More
                      <span className="btn-txt-extra" data-txt="Read More"></span>
                    </span>
                  </Link>
                  <div className="inline-block overflow-hidden text-body-4 text-black-700 font-bold">
                    {blog.reading_time || "3 min read"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
