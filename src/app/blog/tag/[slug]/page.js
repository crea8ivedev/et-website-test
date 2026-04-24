import React from "react";
import { notFound } from "next/navigation";
import ClientBlogPage from "@/components/blog/ClientBlogPage";
import getPostList from "@/services/posts/getPostList";
import getAllPostCategories from "@/services/taxonomy/getAllPostCategories";
import getPageContent from "@/services/pages/getPageContent";
import getTagBySlug from "@/services/taxonomy/getTagBySlug";
import getPostByTagSeo from "@/services/posts/getPostByTagSeo";
import { buildMetadata, buildFallbackMetadata } from "@/utils/buildMetadata";
import getThemeOptions from "@/services/site/getThemeOptions";
import { buildGlobalSchemaGraph } from "@/lib/schema/buildGlobalSchemaGraph";
import JsonLd from "@/components/seo/JsonLd";
import { composeSchemaGraph } from "@/lib/schema/composeSchemaGraph";
import { buildBreadcrumbsForPath } from "@/lib/schema/buildBreadcrumbs";

const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN || "http://localhost:3000";

export default async function TagBlogPage({ params, searchParams }) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  const [currentTag, categoriesResponse, pageData, themeOptions] = await Promise.all([
    getTagBySlug(slug),
    getAllPostCategories(),
    getPageContent("blog"),
    getThemeOptions(),
  ]);

  if (!currentTag) {
    return notFound();
  }

  const categories = categoriesResponse?.data || [];
  const blogBannerData = pageData?.data?.acf?.page_content?.find(
    (section) => section.acf_fc_layout === "inner_banner"
  );

  const innerBannerData = blogBannerData
    ? {
        ...blogBannerData,
        heading: `Tag: <span>${currentTag.name}</span>`,
        breadcrumbs: [
          { title: { title: "Blog", url: "/blog" } },
          { title: { title: `Tag: ${currentTag.name}`, url: "#" } },
        ],
      }
    : null;

  const pageParam = resolvedSearchParams?.page ? parseInt(resolvedSearchParams.page, 10) : 1;
  const search = resolvedSearchParams?.search || "";
  const page = isNaN(pageParam) ? 1 : pageParam;

  const postsResponse = await getPostList({
    page,
    search,
    tagId: currentTag.id.toString(),
  });

  const postsData = postsResponse?.data || [];
  const pagination = postsResponse?.pagination || {};
  const globalSchema = buildGlobalSchemaGraph(themeOptions);
  const breadcrumbSchema = buildBreadcrumbsForPath({
    baseUrl: SITE_DOMAIN,
    pathname: `/blog/tag/${slug}`,
    label: `Tag: ${currentTag.name}`,
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
        initialTag={currentTag.id.toString()}
        innerBannerData={innerBannerData}
      />
    </>
  );
}

export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    const yoastData = await getPostByTagSeo({ slug });

    if (!yoastData) {
      return buildFallbackMetadata(
        `Tag: ${slug} - Encircle Technologies`,
        `Explore blog posts tagged with ${slug}.`,
        `blog/tag/${slug}`
      );
    }

    return buildMetadata(yoastData, { pathName: `blog/tag/${slug}` });
  } catch (error) {
    return buildFallbackMetadata(
      `Tag: ${slug} - Encircle Technologies`,
      `Explore blog posts tagged with ${slug}.`,
      `blog/tag/${slug}`
    );
  }
}
