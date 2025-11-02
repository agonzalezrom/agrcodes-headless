/**
 * WordPress REST API Client
 *
 * Utilidades para conectar con la API REST de WordPress
 * Documentación: https://developer.wordpress.org/rest-api/
 */

import type { WordPressPost, Post } from '@/types/wordpress'
import { stripHtml, formatDate, processWordPressContent } from '@/lib/utils'

const WORDPRESS_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL
  ? `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2`
  : 'https://your-wordpress-site.com/wp-json/wp/v2'

// ============================================
// API Functions
// ============================================

/**
 * Obtiene el total de posts publicados
 *
 * @returns Total de posts
 */
export async function getTotalPosts(): Promise<number> {
  try {
    const response = await fetch(
      `${WORDPRESS_API_URL}/posts?per_page=1&status=publish`,
      {
        cache: 'force-cache',
        next: { revalidate: 21600 } // Revalidate every 6 hours
      }
    )

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status}`)
    }

    // WordPress devuelve el total en el header X-WP-Total
    const total = response.headers.get('X-WP-Total')
    return total ? parseInt(total, 10) : 0
  } catch {
    return 0
  }
}

/**
 * Obtiene todos los posts publicados
 *
 * @param page - Número de página (para paginación)
 * @param perPage - Posts por página (default: 10)
 * @returns Array de posts transformados
 */
export async function getPosts(page: number = 1, perPage: number = 10): Promise<Post[]> {
  try {
    const response = await fetch(
      `${WORDPRESS_API_URL}/posts?_embed&page=${page}&per_page=${perPage}&status=publish`,
      {
        cache: 'force-cache',
        next: { revalidate: 21600 } // Revalidate every 6 hours
      }
    )

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status}`)
    }

    const posts: WordPressPost[] = await response.json()

    return posts.map(transformPost)
  } catch {
    return []
  }
}

/**
 * Obtiene un post por su slug
 *
 * @param slug - Slug del post
 * @returns Post transformado o null si no existe
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const response = await fetch(
      `${WORDPRESS_API_URL}/posts?slug=${slug}&_embed`,
      {
        cache: 'force-cache',
        next: { revalidate: 86400 } // Revalidate every 24 hours
      }
    )

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status}`)
    }

    const posts: WordPressPost[] = await response.json()

    if (posts.length === 0) {
      return null
    }

    return transformPost(posts[0])
  } catch (error) {
    console.error('Error fetching post by slug:', error)
    return null
  }
}

/**
 * Obtiene todos los slugs de posts (para generateStaticParams)
 *
 * @returns Array de objetos con slugs
 */
export async function getAllPostSlugs(): Promise<{ slug: string }[]> {
  try {
    const response = await fetch(
      `${WORDPRESS_API_URL}/posts?per_page=100&_fields=slug&status=publish`,
      {
        cache: 'force-cache',
        next: { revalidate: 86400 } // Revalidate every 24 hours
      }
    )

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status}`)
    }

    const posts: { slug: string }[] = await response.json()

    return posts
  } catch {
    return []
  }
}

// ============================================
// Transform Functions
// ============================================

/**
 * Transforma un post de WordPress al formato del template
 *
 * @param post - Post de WordPress
 * @returns Post transformado
 */
function transformPost(post: WordPressPost): Post {
  const author = post._embedded?.author?.[0]
  const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0]
  const terms = post._embedded?.['wp:term']

  // Extraer datos de All in One SEO si existen
  const aioseoData = (post as WordPressPost & { aioseo?: Record<string, unknown> }).aioseo || {}
  const aioseo = aioseoData as Record<string, unknown>
  const ogImage = aioseo.og_image_url || featuredMedia?.source_url
  const twitterImage = aioseo.twitter_image_url || ogImage

  // Process content once and cache plain text version for search
  const processedContent = processWordPressContent(post.content.rendered)
  const plainTextContent = stripHtml(processedContent)

  return {
    id: post.id,
    title: post.title.rendered,
    slug: post.slug,
    excerpt: stripHtml(post.excerpt.rendered),
    content: processedContent,
    plainTextContent, // Cache this for search optimization
    date: formatDate(post.date),
    dateISO: post.date, // Mantener fecha ISO original
    author: {
      name: author?.name || 'Anonymous',
      avatar: author?.avatar_urls?.['96'] || author?.avatar_urls?.['48'] || '/placeholder-avatar.jpg'
    },
    featuredImage: featuredMedia
      ? {
          url: featuredMedia.source_url,
          alt: featuredMedia.alt_text || post.title.rendered,
          width: featuredMedia.media_details?.width || 1200,
          height: featuredMedia.media_details?.height || 630
        }
      : undefined,
    categories: terms?.[0]?.map((term) => term.name) || [],
    tags: terms?.[1]?.map((term) => term.name) || [],
    seo: {
      title: aioseo.title || post.title.rendered,
      description: aioseo.description || stripHtml(post.excerpt.rendered),
      ogTitle: aioseo.og_title || aioseo.title || post.title.rendered,
      ogDescription: aioseo.og_description || aioseo.description || stripHtml(post.excerpt.rendered),
      ogImage: ogImage,
      twitterTitle: aioseo.twitter_title || aioseo.title || post.title.rendered,
      twitterDescription: aioseo.twitter_description || aioseo.description || stripHtml(post.excerpt.rendered),
      twitterImage: twitterImage,
    }
  }
}
