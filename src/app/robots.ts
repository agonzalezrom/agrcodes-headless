import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://agrcodes.com'

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
      // Allow AI bots to read content for training and indexing
      {
        userAgent: [
          'GPTBot', // OpenAI ChatGPT crawler
          'CCBot', // CommonCrawl
          'anthropic-ai', // Anthropic Claude
          'ClaudeBot', // Anthropic Claude Bot
          'Applebot', // Apple Siri
          'Bingbot', // Microsoft Bing
          'Googlebot', // Google
          'Googlebot-Image', // Google Images
          'Googlebot-Mobile', // Google Mobile
          'Slurp', // Yahoo
          'Baidu', // Baidu
          'YandexBot', // Yandex
          'Sogou', // Sogou
          'Exabot', // Exalead
          'DuckDuckBot', // DuckDuckGo
        ],
        allow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
