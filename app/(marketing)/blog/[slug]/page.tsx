import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostPageClient } from "./blog-post-client";

// Esta función se ejecutará en el servidor para obtener el artículo
async function getBlogPost(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/blog/posts/${slug}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return (data?.data || data) as any;
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return {
      title: "Artículo no encontrado | VioTech Pro",
    };
  }

  const metaDescription =
    post.seo?.metaDescription || post.excerpt || "Artículo de VioTech Pro";

  return {
    title: `${post.title} | VioTech Pro Blog`,
    description: metaDescription,
    keywords: post.seo?.metaKeywords || [post.category.name, "consultoría TI", "Colombia"],
    metadataBase: new URL("https://viotech.com.co"),
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: metaDescription,
      url: `https://viotech.com.co/blog/${slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      tags: post.tags.map((t: { id: string; name: string; slug: string }) => t.name),
      images: post.seo?.ogImage || post.featuredImage
        ? [
            {
              url: post.seo?.ogImage || post.featuredImage || "",
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: metaDescription,
      images: post.seo?.ogImage || post.featuredImage ? [post.seo?.ogImage || post.featuredImage || ""] : [],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  return <BlogPostPageClient post={post} slug={slug} />;
}

