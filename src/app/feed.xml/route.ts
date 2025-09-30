import { NextResponse } from 'next/server'
import { getPosts } from '@/lib/wordpress'
import { stripHtml } from '@/lib/utils'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://agr.codes'
  const posts = await getPosts(1, 50) // Top 50 posts para RSS

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>agr.codes</title>
    <link>${baseUrl}</link>
    <description>Reflexiones sobre desarrollo web, diseño y tecnología por Alejandro González Romero</description>
    <language>es-MX</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    ${posts
      .map(
        (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/posts/${post.slug}</link>
      <description><![CDATA[${stripHtml(post.excerpt)}]]></description>
      <pubDate>${new Date(post.dateISO).toUTCString()}</pubDate>
      <guid isPermaLink="true">${baseUrl}/posts/${post.slug}</guid>
      <author>${post.author.name}</author>
      ${post.categories ? post.categories.map((cat) => `<category>${cat}</category>`).join('\n      ') : ''}
    </item>`
      )
      .join('')}
  </channel>
</rss>`

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
