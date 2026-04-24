import React from "react";
import getPageContent from "@/services/pages/getPageContent";
import getCaseStudyList from "@/services/case-studies/getCaseStudyList";
import getCaseStudyCategories from "@/services/case-studies/getCaseStudyCategories";
import getCaseStudyTags from "@/services/case-studies/getCaseStudyTags";
import ClientCaseStudy from "@/components/case-study/ClientCaseStudy";
import { generatePageMetadata } from "@/lib/metadata";
import getThemeOptions from "@/services/site/getThemeOptions";
import { buildGlobalSchemaGraph } from "@/lib/schema/buildGlobalSchemaGraph";
import JsonLd from "@/components/seo/JsonLd";
import { composeSchemaGraph, hasSchemaType } from "@/lib/schema/composeSchemaGraph";
import { buildBreadcrumbsForPath } from "@/lib/schema/buildBreadcrumbs";
import { normalizeWpDomain } from "@/lib/schema/normalizeWpDomain";

const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN || "http://localhost:3000";
const WP_DOMAIN = process.env.NEXT_PUBLIC_WORDPRESS_API_URL
  ? new URL(process.env.NEXT_PUBLIC_WORDPRESS_API_URL).origin
  : "";

export async function generateMetadata() {
  return await generatePageMetadata("case-study");
}

const CaseStudyPage = async ({ searchParams }) => {
  const resolvedSearchParams = await searchParams;
  const pageParam = resolvedSearchParams?.page ? parseInt(resolvedSearchParams.page, 10) : 1;
  const search = resolvedSearchParams?.search || "";
  const page = isNaN(pageParam) ? 1 : pageParam;

  const pageData = await getPageContent("case-study");
  const caseStudyProcessIcon = pageData?.data?.acf?.page_content?.find(
    (section) => section.acf_fc_layout === "case_study_process_icon_list"
  );

  const caseStudyResponse = await getCaseStudyList({ page, search });
  const caseStudyData = caseStudyResponse?.data || [];
  const pagination = caseStudyResponse?.pagination || {};

  const categoriesResponse = await getCaseStudyCategories();
  const categories = categoriesResponse?.data || [];

  const tagsResponse = await getCaseStudyTags();
  const tags = tagsResponse?.data || [];

  const yoastSchema = normalizeWpDomain(
    pageData?.data?.yoast_head_json?.schema,
    WP_DOMAIN,
    SITE_DOMAIN
  );
  const themeOptions = await getThemeOptions();
  const globalSchema = buildGlobalSchemaGraph(themeOptions);
  const breadcrumbSchema = hasSchemaType(yoastSchema, "BreadcrumbList")
    ? null
    : buildBreadcrumbsForPath({ baseUrl: SITE_DOMAIN, pathname: "/case-study" });
  const composedJson = composeSchemaGraph({
    yoastSchema,
    globalSchema,
    extras: [breadcrumbSchema].filter(Boolean),
  });

  return (
    <>
      <JsonLd data={composedJson} />
      <ClientCaseStudy
        caseStudyData={caseStudyData}
        caseStudyProcessIcon={caseStudyProcessIcon}
        pagination={pagination}
        initialPage={page}
        initialSearch={search}
        categories={categories}
        tags={tags}
      />
    </>
  );
};

export default CaseStudyPage;
