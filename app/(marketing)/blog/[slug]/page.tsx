import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostPageClient } from "./blog-post-client";

// Esta función se ejecutará en el servidor para obtener el artículo
async function getBlogPost(slug: string) {
  try {
    // Obtener la URL del backend
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.BACKEND_API_URL || "http://localhost:3000";
    // Asegurar que el slug esté codificado correctamente
    const encodedSlug = encodeURIComponent(slug);
    const url = `${baseUrl}/api/blog/posts/${encodedSlug}`;
    
    console.log("🔍 Buscando post con slug:", slug);
    console.log("🔍 Slug codificado:", encodedSlug);
    console.log("🔍 URL completa:", url);
    console.log("🔍 Base URL:", baseUrl);
    
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("🔍 Response status:", res.status);
    console.log("🔍 Response ok:", res.ok);
    console.log("🔍 Response headers:", Object.fromEntries(res.headers.entries()));

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ Error al obtener post:", res.status, errorText);
      
      // Si es 404, el post no existe o no está publicado
      if (res.status === 404) {
        console.warn(`⚠️ Post con slug "${slug}" no encontrado (404). Verifica:`);
        console.warn("  1. Que el post esté publicado (isPublished: true)");
        console.warn("  2. Que el slug sea correcto");
        console.warn("  3. Que el backend esté funcionando correctamente");
      }
      
      return null;
    }

    const data = await res.json();
    console.log("✅ Post encontrado:", data);
    
    // Verificar el formato de la respuesta
    if (data?.success === false) {
      console.error("❌ Backend retornó success: false", data);
      return null;
    }
    
    // El backend puede retornar { success: true, data: {...} } o directamente {...}
    const post = data?.data || data;
    
    if (!post) {
      console.error("❌ Post es null o undefined después de parsear respuesta");
      return null;
    }
    
    console.log("✅ Post parseado:", {
      id: post.id,
      slug: post.slug,
      title: post.title,
      publishedAt: post.publishedAt,
      isPublished: post.isPublished,
    });
    
    return post;
  } catch (error) {
    console.error("❌ Error fetching blog post:", error);
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
    // El post no existe o no está publicado
    // El endpoint público solo retorna posts con isPublished: true
    console.warn(`⚠️ Post con slug "${slug}" no encontrado o no está publicado`);
    notFound();
  }

  // Verificar que el post esté publicado
  if (!post.publishedAt) {
    console.warn(`⚠️ Post "${slug}" existe pero no está publicado`);
    notFound();
  }

  return <BlogPostPageClient post={post} slug={slug} />;
}

