import { MetadataRoute } from 'next';

// Función para obtener posts del blog publicados
async function getBlogPosts(): Promise<Array<{ slug: string; updatedAt: string }>> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.BACKEND_API_URL || 'https://viotech-main.onrender.com';
    const response = await fetch(`${baseUrl}/api/blog/posts?limit=1000`, {
      next: { revalidate: 3600 }, // Revalidar cada hora
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn('⚠️ Error al obtener posts del blog para sitemap:', response.status);
      return [];
    }

    const data = await response.json();
    const posts = data?.data?.posts || data?.posts || [];
    
    return posts
      .filter((post: any) => post.isPublished && post.publishedAt)
      .map((post: any) => ({
        slug: post.slug,
        updatedAt: post.updatedAt || post.publishedAt,
      }));
  } catch (error) {
    console.warn('⚠️ Error al obtener posts del blog para sitemap:', error);
    return [];
  }
}

// Función para obtener servicios del catálogo
async function getCatalogServices(): Promise<Array<{ slug: string; updatedAt?: string }>> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.BACKEND_API_URL || 'https://viotech-main.onrender.com';
    // Usar parámetros correctos: active=true y limit razonable
    const response = await fetch(`${baseUrl}/api/services/catalog?active=true&limit=500`, {
      next: { revalidate: 3600 }, // Revalidar cada hora
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Si el error es 400, puede ser por parámetros inválidos, intentar sin parámetros
      if (response.status === 400) {
        console.warn('⚠️ Error 400 al obtener servicios del catálogo. Intentando sin parámetros...');
        const fallbackResponse = await fetch(`${baseUrl}/api/services/catalog`, {
          next: { revalidate: 3600 },
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!fallbackResponse.ok) {
          console.warn('⚠️ Error al obtener servicios del catálogo para sitemap:', fallbackResponse.status);
          return [];
        }
        
        const fallbackData = await fallbackResponse.json();
        const services = fallbackData?.data?.services || fallbackData?.services || [];
        
        return services
          .filter((service: any) => service.slug && (service.activo !== false && service.active !== false))
          .map((service: any) => ({
            slug: service.slug,
            updatedAt: service.updatedAt || service.createdAt,
          }));
      }
      
      console.warn('⚠️ Error al obtener servicios del catálogo para sitemap:', response.status);
      return [];
    }

    const data = await response.json();
    const services = data?.data?.services || data?.services || [];
    
    return services
      .filter((service: any) => service.slug && (service.activo !== false && service.active !== false))
      .map((service: any) => ({
        slug: service.slug,
        updatedAt: service.updatedAt || service.createdAt,
      }));
  } catch (error) {
    console.warn('⚠️ Error al obtener servicios del catálogo para sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://viotech.com.co';
  
  // Obtener datos dinámicos en paralelo
  const [blogPosts, catalogServices] = await Promise.all([
    getBlogPosts(),
    getCatalogServices(),
  ]);
  
  // Rutas estáticas principales
  const staticRoutes = [
    '',
    '/services',
    '/services/catalog',
    '/blog',
    '/contact',
    '/about',
    '/case-studies',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Rutas dinámicas por servicio (hardcodeadas - mantener compatibilidad)
  const serviceRoutes = [
    'desarrollo-software',
    'consultoria-ti',
    'soporte-tecnico',
  ].map((slug) => ({
    url: `${baseUrl}/services/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Rutas dinámicas por industria
  const industryRoutes = [
    'fintech',
    'retail',
    'healthcare',
  ].map((slug) => ({
    url: `${baseUrl}/industries/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Rutas dinámicas de posts del blog
  const blogPostRoutes = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // Rutas dinámicas de servicios del catálogo
  const catalogServiceRoutes = catalogServices.map((service) => ({
    url: `${baseUrl}/services/catalog/${service.slug}`,
    lastModified: service.updatedAt ? new Date(service.updatedAt) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [
    ...staticRoutes,
    ...serviceRoutes,
    ...industryRoutes,
    ...blogPostRoutes,
    ...catalogServiceRoutes,
  ];
}
