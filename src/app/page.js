import getPageContent from "@/services/pages/getPageContent";
import PageRender from "@/components/cms/AcfPageRenderer";
import { notFound } from "next/navigation";
import { generatePageMetadata } from "@/lib/metadata";
import { buildFaqSchema } from "@/lib/schema/buildJsonLdSchemas";
import getThemeOptions from "@/services/site/getThemeOptions";
import { buildGlobalSchemaGraph } from "@/lib/schema/buildGlobalSchemaGraph";
import JsonLd from "@/components/seo/JsonLd";
import { composeSchemaGraph, hasSchemaType } from "@/lib/schema/composeSchemaGraph";
import { buildBreadcrumbsForPath } from "@/lib/schema/buildBreadcrumbs";
import { normalizeWpDomain } from "@/lib/schema/normalizeWpDomain";

export const revalidate = false;

const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN || "http://localhost:3000";
const WP_DOMAIN = process.env.NEXT_PUBLIC_WORDPRESS_API_URL
  ? new URL(process.env.NEXT_PUBLIC_WORDPRESS_API_URL).origin
  : "";

export async function generateMetadata() {
  return await generatePageMetadata("home");
}

const HomePage = async () => {
  const [pageData, themeOptions] = await Promise.all([getPageContent("home"), getThemeOptions()]);
  if (!pageData?.data?.acf?.page_content) return notFound();

  const normalizedYoastSchema = normalizeWpDomain(
    pageData?.data?.yoast_head_json?.schema,
    WP_DOMAIN,
    SITE_DOMAIN
  );

  const pageContent = pageData?.data?.acf?.page_content || [];
  const faqSchema = hasSchemaType(normalizedYoastSchema, "FAQPage")
    ? null
    : buildFaqSchema(pageContent);

  const globalSchema = buildGlobalSchemaGraph(themeOptions);

  const breadcrumbSchema = hasSchemaType(normalizedYoastSchema, "BreadcrumbList")
    ? null
    : buildBreadcrumbsForPath({ baseUrl: SITE_DOMAIN, pathname: "/" });

  const composedJson = composeSchemaGraph({
    yoastSchema: normalizedYoastSchema,
    globalSchema,
    extras: [breadcrumbSchema, faqSchema].filter(Boolean),
  });

  return (
    <>
      <JsonLd data={composedJson} />
      <PageRender pageData={pageData} />
    </>
  );
};

export default HomePage;
