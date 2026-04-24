import React from "react";
import { notFound } from "next/navigation";
import ClientBlogPage from "@/components/blog/ClientBlogPage";
import getPostList from "@/services/posts/getPostList";
import getAllPostCategories from "@/services/taxonomy/getAllPostCategories";
import getPageContent from "@/services/pages/getPageContent";
import getPostByCategoriesSeo from "@/services/posts/getPostByCategoriesSeo";
import getThemeOptions from "@/services/site/getThemeOptions";
import { buildMetadata, buildFallbackMetadata } from "@/utils/buildMetadata";
import { buildGlobalSchemaGraph } from "@/lib/schema/buildGlobalSchemaGraph";
import JsonLd from "@/components/seo/JsonLd";
import { composeSchemaGraph } from "@/lib/schema/composeSchemaGraph";
import { buildBreadcrumbsForPath } from "@/lib/schema/buildBreadcrumbs";

const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN || "http://localhost:3000";

export default async function CategoryBlogPage({ params, searchParams }) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  const [categoriesResponse, pageData, themeOptions] = await Promise.all([
    getAllPostCategories(),
    getPageContent("blog"),
    getThemeOptions(),
  ]);

  const categories = categoriesResponse?.data || [];
  const currentCategory = categories.find((cat) => cat.slug === slug);

  if (!currentCategory) {
    return notFound();
  }

  const blogBannerData = pageData?.data?.acf?.page_content?.find(
    (section) => section.acf_fc_layout === "inner_banner"
  );

  const innerBannerData = blogBannerData
    ? {
        ...blogBannerData,
        heading: `Category: <span>${currentCategory.name}</span>`,
        breadcrumbs: [
          { title: { title: "Blog", url: "/blog" } },
          { title: { title: currentCategory.name, url: "#" } },
        ],
      }
    : null;

  const pageParam = resolvedSearchParams?.page ? parseInt(resolvedSearchParams.page, 10) : 1;
  const search = resolvedSearchParams?.search || "";
  const tagContent = resolvedSearchParams?.tag || "";
  const page = isNaN(pageParam) ? 1 : pageParam;

  const postsResponse = await getPostList({
    page,
    search,
    categoryId: currentCategory.id,
    tagId: tagContent,
  });

  const postsData = postsResponse?.data || [];
  const pagination = postsResponse?.pagination || {};
  const globalSchema = buildGlobalSchemaGraph(themeOptions);
  const breadcrumbSchema = buildBreadcrumbsForPath({
    baseUrl: SITE_DOMAIN,
    pathname: `/blog/category/${slug}`,
    label: currentCategory.name,
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
        initialCategory={currentCategory.id.toString()}
        initialTag={tagContent}
        innerBannerData={innerBannerData}
        footerData={themeOptions}
      />
    </>
  );
}

export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    const yoastData = await getPostByCategoriesSeo({ slug });

    if (!yoastData) {
      return buildFallbackMetadata(
        `Category: ${slug} - Encircle Technologies`,
        `Explore blog posts in the ${slug} category.`,
        `blog/category/${slug}`
      );
    }

    return buildMetadata(yoastData, { pathName: `blog/category/${slug}` });
  } catch (error) {
    return buildFallbackMetadata(
      `Category: ${slug} - Encircle Technologies`,
      `Explore blog posts in the ${slug} category.`,
      `blog/category/${slug}`
    );
  }
}
