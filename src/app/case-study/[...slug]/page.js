import { notFound } from "next/navigation";
import getCaseStudyBySlug from "@/services/case-studies/getCaseStudyBySlug";
import getAllCaseStudies from "@/services/case-studies/getAllCaseStudies";
import PageRender from "@/components/cms/AcfPageRenderer";
import ClientCaseStudySingle from "@/components/case-study/ClientCaseStudySingle";
import { generatePageMetadata } from "@/lib/metadata";
import { buildFallbackMetadata } from "@/utils/buildMetadata";
import getThemeOptions from "@/services/site/getThemeOptions";
import { buildGlobalSchemaGraph } from "@/lib/schema/buildGlobalSchemaGraph";
import JsonLd from "@/components/seo/JsonLd";
import { composeSchemaGraph, hasSchemaType } from "@/lib/schema/composeSchemaGraph";
import { buildBreadcrumbsForCaseStudy } from "@/lib/schema/buildBreadcrumbs";
import { stripHtml } from "@/lib/schema/urls";
import { buildFaqSchema } from "@/lib/schema/buildJsonLdSchemas";
import { normalizeWpDomain } from "@/lib/schema/normalizeWpDomain";

export const revalidate = false;
export const dynamicParams = false;

const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN || "http://localhost:3000";
const WP_DOMAIN = process.env.NEXT_PUBLIC_WORDPRESS_API_URL
  ? new URL(process.env.NEXT_PUBLIC_WORDPRESS_API_URL).origin
  : "";

export async function generateStaticParams() {
  try {
    const res = await getAllCaseStudies();
    const items = res?.data || [];
    return items.filter((c) => c.slug).map((c) => ({ slug: [c.slug] }));
  } catch (err) {
    console.error("generateStaticParams getAllCaseStudies error:", err);
    return [];
  }
}

export default async function CaseStudyDetailPage({ params }) {
  const unwrappedParams = await params;
  const slugArray = unwrappedParams.slug;

  if (!slugArray || slugArray.length === 0 || slugArray.length > 1) {
    return notFound();
  }

  const slug = slugArray[0];
  const caseStudy = await getCaseStudyBySlug(slug);

  if (!caseStudy) {
    return notFound();
  }

  const themeOptions = await getThemeOptions();
  const globalSchema = buildGlobalSchemaGraph(themeOptions);

  const normalizedYoastSchema = normalizeWpDomain(
    caseStudy?.yoast_head_json?.schema,
    WP_DOMAIN,
    SITE_DOMAIN
  );

  const breadcrumbSchema = hasSchemaType(normalizedYoastSchema, "BreadcrumbList")
    ? null
    : buildBreadcrumbsForCaseStudy({
        baseUrl: SITE_DOMAIN,
        slug,
        title: stripHtml(caseStudy.title?.rendered || ""),
      });

  const hasArticle = hasSchemaType(normalizedYoastSchema, "Article");
  const fallbackArticle = hasArticle
    ? null
    : {
        "@type": "Article",
        headline: stripHtml(caseStudy.title?.rendered || ""),
        description: stripHtml(
          caseStudy.acf?.banner_description || caseStudy.acf?.seo_description || ""
        ),
        image: caseStudy.featured_image_url,
        datePublished: caseStudy.date,
        dateModified: caseStudy.modified,
        author: { "@type": "Organization", name: "Encircle Technologies" },
        publisher: { "@type": "Organization", name: "Encircle Technologies" },
      };

  const caseStudyContent = caseStudy?.acf?.case_study_content || [];
  const faqSchema = hasSchemaType(normalizedYoastSchema, "FAQPage")
    ? null
    : buildFaqSchema(caseStudyContent);

  const composedJson = composeSchemaGraph({
    yoastSchema: normalizedYoastSchema,
    globalSchema,
    extras: [breadcrumbSchema, fallbackArticle, faqSchema].filter(Boolean),
  });

  return (
    <>
      <JsonLd data={composedJson} />
      <main className="relative z-1 bg-black-800">
        <ClientCaseStudySingle data={caseStudy} />
      </main>
    </>
  );
}

export async function generateMetadata({ params }) {
  const unwrappedParams = await params;
  const slugArray = unwrappedParams.slug;
  const slug = slugArray ? slugArray[0] : "";

  if (!slug) return {};

  try {
    const caseStudy = await getCaseStudyBySlug(slug);

    if (!caseStudy) return {};

    return await generatePageMetadata(`case-study/${slug}`, caseStudy.acf);
  } catch (error) {
    console.error("Error generating case study metadata:", error);
    return buildFallbackMetadata(
      "Case Study Detail - Encircle Technologies",
      "Read our latest case study.",
      `case-study/${slug}`
    );
  }
}
