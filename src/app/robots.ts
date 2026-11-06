import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.url;

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/about', '/reviews', '/contact', '/explore', '/store/'],
        disallow: ['/admin', '/merchant', '/customer', '/pos', '/api/'],
      },
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'PerplexityBot',
          'ClaudeBot',
          'Google-Extended',
          'Applebot-Extended',
        ],
        allow: ['/', '/about', '/reviews', '/contact', '/explore', '/store/'],
        disallow: ['/admin', '/merchant', '/customer', '/pos', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
