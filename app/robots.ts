import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://viotech.com.co';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/internal/',
          '/client/',
          '/dashboard/',
          '/login',
          '/forgot-password',
          '/reset-password',
          '/payment/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/internal/',
          '/client/',
          '/dashboard/',
          '/login',
          '/forgot-password',
          '/reset-password',
          '/payment/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

