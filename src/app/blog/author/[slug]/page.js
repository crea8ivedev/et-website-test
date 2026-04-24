import React from "react";
import { notFound } from "next/navigation";
import ClientBlogPage from "@/components/blog/ClientBlogPage";
import getPostList from "@/services/posts/getPostList";
import getAllPostCategories from "@/services/taxonomy/getAllPostCategories";
import getPageContent from "@/services/pages/getPageContent";
import { getAuthorBySlug } from "@/services/authors/getAuthorBySlug";
import { buildMetadata, buildFallbackMetadata } from "@/utils/buildMetadata";
import getThemeOptions from "@/services/site/getThemeOptions";
import { buildGlobalSchemaGraph } from "@/lib/schema/buildGlobalSchemaGraph";
import JsonLd from "@/components/seo/JsonLd";
import { composeSchemaGraph } from "@/lib/schema/composeSchemaGraph";
import { buildBreadcrumbsForPath } from "@/lib/schema/buildBreadcrumbs";

const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN || "http://localhost:3000";

export default async function AuthorBlogPage({ params, searchParams }) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  const [currentAuthor, categoriesResponse, pageData, themeOptions] = await Promise.all([
    getAuthorBySlug(slug),
    getAllPostCategories(),
    getPageContent("blog"),
    getThemeOptions(),
  ]);

  if (!currentAuthor) {
    return notFound();
  }

  const categories = categoriesResponse?.data || [];
  const blogBannerData = pageData?.data?.acf?.page_content?.find(
    (section) => section.acf_fc_layout === "inner_banner"
  );

  const innerBannerData = blogBannerData
    ? {
        ...blogBannerData,
        heading: `Author: <span>${currentAuthor.name}</span>`,
        short_description: currentAuthor.description || blogBannerData.short_description,
        breadcrumbs: [
          { title: { title: "Blog", url: "/blog" } },
          { title: { title: currentAuthor.name, url: "#" } },
        ],
        poster_image:
          currentAuthor.acf?.user_image || currentAuthor.avatar_urls?.["96"]
            ? { url: currentAuthor.acf?.user_image?.url || currentAuthor.avatar_urls?.["96"] }
            : blogBannerData.poster_image,
      }
    : null;

  const pageParam = resolvedSearchParams?.page ? parseInt(resolvedSearchParams.page, 10) : 1;
  const search = resolvedSearchParams?.search || "";
  const tagContent = resolvedSearchParams?.tag || "";
  const page = isNaN(pageParam) ? 1 : pageParam;

  const postsResponse = await getPostList({
    page,
    search,
    authorId: currentAuthor.id,
    tagId: tagContent,
  });

  const postsData = postsResponse?.data || [];
  const pagination = postsResponse?.pagination || {};
  const globalSchema = buildGlobalSchemaGraph(themeOptions);
  const breadcrumbSchema = buildBreadcrumbsForPath({
    baseUrl: SITE_DOMAIN,
    pathname: `/blog/author/${slug}`,
    label: currentAuthor.name,
  });
  const composed = composeSchemaGraph({
    yoastSchema: null,
    globalSchema,
    extras: [breadcrumbSchema],
  });

  return (
    <>
      <JsonLd data={composed} />
      <ClientBlogPage
        postsData={postsData}
        categories={categories}
        initialPage={page}
        pagination={pagination}
        initialSearch={search}
        initialAuthor={currentAuthor.id.toString()}
        initialTag={tagContent}
        innerBannerData={innerBannerData}
      />
    </>
  );
}

export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    const author = await getAuthorBySlug(slug);

    if (!author || !author.yoast_head_json) {
      return buildFallbackMetadata(
        `Author: ${author?.name || slug} - Encircle Technologies`,
        author?.description || `Read articles written by ${author?.name || slug}.`,
        `blog/author/${slug}`
      );
    }

    return buildMetadata(author.yoast_head_json, { pathName: `blog/author/${slug}` });
  } catch (error) {
    return buildFallbackMetadata(
      `Author: ${slug} - Encircle Technologies`,
      `Read articles in Encircle Technologies blog.`,
      `blog/author/${slug}`
    );
  }
}
