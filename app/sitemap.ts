import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://viotech.com.co';
  
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

  // Rutas dinámicas por servicio
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

  return [...staticRoutes, ...serviceRoutes, ...industryRoutes];
}

