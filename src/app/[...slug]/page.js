import { notFound } from "next/navigation";
import PageRender from "@/components/cms/AcfPageRenderer";
import { isEmpty } from "@/utils/isEmpty";
import getPageContent from "@/services/pages/getPageContent";
import { generatePageMetadata } from "@/lib/metadata";
import getAllPages from "@/services/pages/getAllPages";
import { buildFaqSchema } from "@/lib/schema/buildJsonLdSchemas";
import getThemeOptions from "@/services/site/getThemeOptions";
import { buildGlobalSchemaGraph } from "@/lib/schema/buildGlobalSchemaGraph";
import JsonLd from "@/components/seo/JsonLd";
import { composeSchemaGraph, hasSchemaType } from "@/lib/schema/composeSchemaGraph";
import { buildBreadcrumbsForPath } from "@/lib/schema/buildBreadcrumbs";
import { normalizePathname } from "@/lib/schema/urls";
import { extractServicePages } from "@/lib/schema/servicePagesFromThemeOptions";
import { buildServiceSchema } from "@/lib/schema/buildServiceSchema";
import { normalizeWpDomain } from "@/lib/schema/normalizeWpDomain";

export const revalidate = false;
export const dynamicParams = false;

const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN || "http://localhost:3000";
const WP_DOMAIN = process.env.NEXT_PUBLIC_WORDPRESS_API_URL
  ? new URL(process.env.NEXT_PUBLIC_WORDPRESS_API_URL).origin
  : "";

export async function generateStaticParams() {
  let pages = null;
  try {
    pages = await getAllPages();
  } catch (err) {
    console.error("generateStaticParams getAllPages error:", err);
    return [];
  }

  if (!pages?.data) return [];

  return pages.data
    .filter((page) => page.slug && page.slug !== "home")
    .map((page) => ({ slug: page.slug.split("/") }));
}

export default async function Page({ params }) {
  const { slug } = await params;
  const Slug = slug.join("/");
  const pathname = normalizePathname(`/${Slug}`);

  let pageData = null;
  try {
    pageData = await getPageContent(Slug);
  } catch (err) {
    console.error("getPageContent error:", err);
    return notFound();
  }

  if (isEmpty(pageData?.data?.acf?.page_content)) return notFound();

  const normalizedYoastSchema = normalizeWpDomain(
    pageData?.data?.yoast_head_json?.schema,
    WP_DOMAIN,
    SITE_DOMAIN
  );

  const pageContent = pageData?.data?.acf?.page_content || [];
  const faqSchema = hasSchemaType(normalizedYoastSchema, "FAQPage")
    ? null
    : buildFaqSchema(pageContent);

  let themeOptions = null;
  try {
    themeOptions = await getThemeOptions();
  } catch (err) {
    console.error("getThemeOptions error:", err);
    themeOptions = null;
  }
  const globalSchema = buildGlobalSchemaGraph(themeOptions);

  const breadcrumbSchema = hasSchemaType(normalizedYoastSchema, "BreadcrumbList")
    ? null
    : buildBreadcrumbsForPath({
        baseUrl: SITE_DOMAIN,
        pathname,
      });

  const servicesMap = extractServicePages(themeOptions);
  const serviceTitle = servicesMap.get(pathname) || "";
  const serviceSchema =
    serviceTitle && !hasSchemaType(normalizedYoastSchema, "Service")
      ? buildServiceSchema({
          themeOptions,
          pathname,
          serviceName: serviceTitle,
          description: pageData?.data?.yoast_head_json?.description || "",
        })
      : null;

  const composedJson = composeSchemaGraph({
    yoastSchema: normalizedYoastSchema,
    globalSchema,
    extras: [breadcrumbSchema, faqSchema, serviceSchema].filter(Boolean),
  });

  return (
    <>
      <JsonLd data={composedJson} />
      <main className="relative z-1 bg-black-800">
        <PageRender pageData={pageData} />
      </main>
    </>
  );
}
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const Slug = slug.join("/");
  try {
    return await generatePageMetadata(Slug);
  } catch (err) {
    console.error("generateMetadata error:", err);
    return {};
  }
}
