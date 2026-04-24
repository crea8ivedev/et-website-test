import { notFound } from "next/navigation";
import { getPostBySlug } from "@/services/posts/getPostBySlug";
import getAllPostCategories from "@/services/taxonomy/getAllPostCategories";
import { getTagsByIds } from "@/services/taxonomy/getTagsByIds";
import { getAuthorById } from "@/services/authors/getAuthorById";
import getPostByCategory from "@/services/posts/getPostByCategory";
import getAllPosts from "@/services/posts/getAllPosts";
import ClientBlogDetails from "@/components/blog/ClientBlogDetails";
import getThemeOptions from "@/services/site/getThemeOptions";
import { buildMetadata, buildFallbackMetadata } from "@/utils/buildMetadata";
import { buildGlobalSchemaGraph } from "@/lib/schema/buildGlobalSchemaGraph";
import JsonLd from "@/components/seo/JsonLd";
import { composeSchemaGraph, hasSchemaType } from "@/lib/schema/composeSchemaGraph";
import { buildBreadcrumbsForBlogPost } from "@/lib/schema/buildBreadcrumbs";
import { stripHtml } from "@/lib/schema/urls";
import { normalizeWpDomain } from "@/lib/schema/normalizeWpDomain";

export const revalidate = false;
export const dynamicParams = false;

const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN || "http://localhost:3000";
const WP_DOMAIN = process.env.NEXT_PUBLIC_WORDPRESS_API_URL
  ? new URL(process.env.NEXT_PUBLIC_WORDPRESS_API_URL).origin
  : "";

export async function generateStaticParams() {
  try {
    const res = await getAllPosts();
    const posts = res?.data || [];
    return posts.filter((p) => p.slug).map((p) => ({ slug: [p.slug] }));
  } catch (err) {
    console.error("generateStaticParams getAllPosts error:", err);
    return [];
  }
}

export default async function BlogDetailPage({ params }) {
  const unwrappedParams = await params;
  const slugArray = unwrappedParams.slug;

  if (!slugArray || slugArray.length === 0 || slugArray.length > 1) {
    return notFound();
  }

  const slug = slugArray[0];

  const [post, categoriesResponse, themeOptions, allPostsResponse] = await Promise.all([
    getPostBySlug(slug),
    getAllPostCategories(),
    getThemeOptions(),
    getAllPosts(),
  ]);

  const allPosts = allPostsResponse?.data || [];

  const categories = categoriesResponse?.data || [];

  if (!post) {
    return notFound();
  }

  const tagIds = post.tags || [];
  const firstCategoryId = post.categories?.[0];

  const [tags, author, primaryRecentRes] = await Promise.all([
    tagIds.length > 0 ? getTagsByIds(tagIds) : Promise.resolve([]),
    post.author ? getAuthorById(post.author) : Promise.resolve(null),
    firstCategoryId
      ? getPostByCategory(firstCategoryId, {
          perPage: 3,
          exclude: post.id ? [post.id] : [],
        })
      : Promise.resolve({ data: [] }),
  ]);

  let recentPosts = primaryRecentRes?.data || [];

  if (!recentPosts || recentPosts.length === 0) {
    const res = await getPostByCategory(null, { perPage: 3, exclude: post.id ? [post.id] : [] });
    recentPosts = res?.data || [];
  }

  if (recentPosts && recentPosts.length > 0) {
    recentPosts = await Promise.all(
      recentPosts.map(async (p) => {
        try {
          if (p.author) {
            const authData = await getAuthorById(p.author);
            return { ...p, authorData: authData };
          }
        } catch (err) {
          console.warn(`Error fetching author for post ${p.id}:`, err);
        }
        return p;
      })
    );
  }

  const yoastSchema = normalizeWpDomain(post?.yoast_head_json?.schema, WP_DOMAIN, SITE_DOMAIN);
  const globalSchema = buildGlobalSchemaGraph(themeOptions);

  const breadcrumbSchema = hasSchemaType(yoastSchema, "BreadcrumbList")
    ? null
    : buildBreadcrumbsForBlogPost({
        baseUrl: SITE_DOMAIN,
        slug,
        title: stripHtml(post.title?.rendered || ""),
      });

  const hasBlogPosting =
    hasSchemaType(yoastSchema, "BlogPosting") || hasSchemaType(yoastSchema, "Article");
  const fallbackBlogPosting = hasBlogPosting
    ? null
    : {
        "@type": "BlogPosting",
        headline: stripHtml(post.title?.rendered || ""),
        description: stripHtml(post.excerpt?.rendered || ""),
        image: post.featured_image_url,
        datePublished: post.date,
        dateModified: post.modified,
        author: { "@type": "Person", name: author?.name || "Encircle Technologies" },
        publisher: { "@type": "Organization", name: "Encircle Technologies" },
      };

  const composedJson = composeSchemaGraph({
    yoastSchema,
    globalSchema,
    extras: [breadcrumbSchema, fallbackBlogPosting].filter(Boolean),
  });

  const currentIndex = allPosts.findIndex((p) => p.slug === post.slug);
  const prevPost = allPosts[currentIndex + 1] || null;
  const nextPost = allPosts[currentIndex - 1] || null;

  return (
    <>
      <JsonLd data={composedJson} />
      <ClientBlogDetails
        post={post}
        categories={categories}
        tags={tags}
        author={author}
        recentPosts={recentPosts}
        footerData={themeOptions}
        prevPost={prevPost}
        nextPost={nextPost}
      />
    </>
  );
}

export async function generateMetadata({ params }) {
  const unwrappedParams = await params;
  const slugArray = unwrappedParams.slug;
  const slug = slugArray ? slugArray[0] : "";

  if (!slug) return {};

  try {
    const post = await getPostBySlug(slug);
    if (!post) return {};

    const yoastData = post.yoast_head_json || {};
    return buildMetadata(yoastData, { pathName: `blog/${slug}` });
  } catch (error) {
    return buildFallbackMetadata(
      "Blog Detail - Encircle Technologies",
      "Read our latest blog post.",
      `blog/${slug}`
    );
  }
}
