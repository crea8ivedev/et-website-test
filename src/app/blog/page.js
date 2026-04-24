import React from "react";

import getPostList from "@/services/posts/getPostList";
import getPageContent from "@/services/pages/getPageContent";
import getAllPostCategories from "@/services/taxonomy/getAllPostCategories";
import getThemeOptions from "@/services/site/getThemeOptions";

import { generatePageMetadata } from "@/lib/metadata";
import { buildGlobalSchemaGraph } from "@/lib/schema/buildGlobalSchemaGraph";
import JsonLd from "@/components/seo/JsonLd";
import { composeSchemaGraph, hasSchemaType } from "@/lib/schema/composeSchemaGraph";
import { buildBreadcrumbsForPath } from "@/lib/schema/buildBreadcrumbs";
import { normalizeWpDomain } from "@/lib/schema/normalizeWpDomain";

import ClientBlogPage from "@/components/blog/ClientBlogPage";

const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN || "http://localhost:3000";
const WP_DOMAIN = process.env.NEXT_PUBLIC_WORDPRESS_API_URL
  ? new URL(process.env.NEXT_PUBLIC_WORDPRESS_API_URL).origin
  : "";

export async function generateMetadata() {
  return await generatePageMetadata("blog");
}

export default async function BlogPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const pageParam = resolvedSearchParams?.page ? parseInt(resolvedSearchParams.page, 10) : 1;
  const search = resolvedSearchParams?.search || "";
  const category = resolvedSearchParams?.category || "";
  const tag = resolvedSearchParams?.tag || "";
  const page = isNaN(pageParam) ? 1 : pageParam;

  const [pageData, postsResponse, categoriesResponse, themeOptions] = await Promise.all([
    getPageContent("blog"),
    getPostList({ page, search, categoryId: category, tagId: tag }),
    getAllPostCategories(),
    getThemeOptions(),
  ]);

  const innerBannerData = pageData?.data?.acf?.page_content?.find(
    (section) => section.acf_fc_layout === "inner_banner"
  );

  const postsData = postsResponse?.data || [];
  const pagination = postsResponse?.pagination || {};
  const categories = categoriesResponse?.data || [];

  const yoastSchema = normalizeWpDomain(
    pageData?.data?.yoast_head_json?.schema,
    WP_DOMAIN,
    SITE_DOMAIN
  );
  const globalSchema = buildGlobalSchemaGraph(themeOptions);
  const breadcrumbSchema = hasSchemaType(yoastSchema, "BreadcrumbList")
    ? null
    : buildBreadcrumbsForPath({ baseUrl: SITE_DOMAIN, pathname: "/blog" });
  const composedJson = composeSchemaGraph({
    yoastSchema,
    globalSchema,
    extras: [breadcrumbSchema].filter(Boolean),
  });

  return (
    <>
      <JsonLd data={composedJson} />
      <ClientBlogPage
        postsData={postsData}
        categories={categories}
        initialPage={page}
        pagination={pagination}
        initialSearch={search}
        initialCategory={category}
        initialTag={tag}
        innerBannerData={innerBannerData}
        footerData={themeOptions}
      />
    </>
  );
}
