import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://agr.codes'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
      // Allow social media crawlers for Open Graph scraping
      {
        userAgent: [
          'facebookexternalhit',
          'Facebot',
          'Twitterbot',
          'LinkedInBot',
          'WhatsApp',
          'Slackbot',
          'TelegramBot',
        ],
        allow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
