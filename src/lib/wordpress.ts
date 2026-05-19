/**
 * WordPress REST API Client
 */

import type {WordPressPost, Post, PostPreview} from '@/types/wordpress'
import {stripHtml, formatDate, processWordPressContent, extractAndInjectHeadings, decodeEntities} from '@/lib/utils'

const WORDPRESS_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL
    ? `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2`
    : 'https://your-wordpress-site.com/wp-json/wp/v2'

export async function getTotalPosts(): Promise<number> {
    try {
        const response = await fetch(
            `${WORDPRESS_API_URL}/posts?per_page=1&status=publish`,
            {
                cache: 'force-cache',
                next: {revalidate: 300}
            }
        )

        if (!response.ok) {
            throw new Error(`WordPress API error: ${response.status}`)
        }

        const total = response.headers.get('X-WP-Total')
        return total ? parseInt(total, 10) : 0
    } catch {
        return 0
    }
}

export async function getPosts(page: number = 1, perPage: number = 10): Promise<Post[]> {
    try {
        const response = await fetch(
            `${WORDPRESS_API_URL}/posts?_embed&page=${page}&per_page=${perPage}&status=publish`,
            {
                cache: 'force-cache',
                next: {revalidate: 300}
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

export async function getPostBySlug(slug: string): Promise<Post | null> {
    try {
        const response = await fetch(
            `${WORDPRESS_API_URL}/posts?slug=${slug}&_embed`,
            {
                cache: 'force-cache',
                next: {revalidate: 60}
            }
        )

        if (!response.ok) {
            throw new Error(`WordPress API error: ${response.status}`)
        }

        const posts: WordPressPost[] = await response.json()
        if (posts.length === 0) return null

        return transformPost(posts[0])
    } catch (error) {
        console.error('Error fetching post by slug:', error)
        return null
    }
}

export async function getAllPostSlugs(): Promise<{ slug: string }[]> {
    try {
        const response = await fetch(
            `${WORDPRESS_API_URL}/posts?per_page=100&_fields=slug&status=publish`,
            {
                cache: 'force-cache',
                next: {revalidate: 3600}
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

/**
 * Lista mínima de posts ordenada por fecha (desc) — para neighbors y agrupación.
 */
export async function getPostsMeta(): Promise<PostPreview[]> {
    try {
        const response = await fetch(
            `${WORDPRESS_API_URL}/posts?per_page=100&_fields=id,slug,title,date&orderby=date&order=desc&status=publish`,
            {
                cache: 'force-cache',
                next: {revalidate: 300}
            }
        )

        if (!response.ok) {
            throw new Error(`WordPress API error: ${response.status}`)
        }

        const posts: Array<{
            id: number
            slug: string
            title: { rendered: string }
            date: string
        }> = await response.json()

        return posts.map(p => ({
            id: p.id,
            slug: p.slug,
            title: decodeEntities(stripHtml(p.title.rendered)),
            dateISO: p.date,
        }))
    } catch {
        return []
    }
}

/**
 * Devuelve los posts vecinos (anterior/siguiente cronológicamente).
 * "next" = más antiguo (siguiente al leer hacia atrás); "prev" = más reciente.
 * Renombrado de cara al usuario: previous = más reciente, next = más antiguo.
 * Convención de blog: navegando de un post al "siguiente" se va al más antiguo.
 */
export async function getAdjacentPosts(slug: string): Promise<{
    previous: PostPreview | null
    next: PostPreview | null
}> {
    const all = await getPostsMeta()
    const index = all.findIndex(p => p.slug === slug)
    if (index === -1) return {previous: null, next: null}

    return {
        previous: index > 0 ? all[index - 1] : null,
        next: index < all.length - 1 ? all[index + 1] : null,
    }
}

function transformPost(post: WordPressPost): Post {
    const author = post._embedded?.author?.[0]
    const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0]
    const terms = post._embedded?.['wp:term']

    const aioseoData = (post as WordPressPost & { aioseo?: Record<string, unknown> }).aioseo || {}
    const aioseo = aioseoData as Record<string, unknown>

    const getString = (key: string, fallback: string = ''): string => {
        const value = aioseo[key]
        return typeof value === 'string' ? value : fallback
    }

    const ogImage = getString('og_image_url') || featuredMedia?.source_url
    const twitterImage = getString('twitter_image_url') || ogImage

    const processedContent = processWordPressContent(post.content.rendered)
    const {content: contentWithIds, headings} = extractAndInjectHeadings(processedContent)
    const plainTextContent = decodeEntities(stripHtml(contentWithIds))
    const title = decodeEntities(stripHtml(post.title.rendered))
    const excerpt = decodeEntities(stripHtml(post.excerpt.rendered))

    return {
        id: post.id,
        title,
        slug: post.slug,
        excerpt,
        content: contentWithIds,
        plainTextContent,
        date: formatDate(post.date),
        dateISO: post.date,
        modifiedISO: post.modified,
        headings,
        author: {
            name: decodeEntities(author?.name || 'Anonymous'),
            avatar: author?.avatar_urls?.['96'] || author?.avatar_urls?.['48'] || '/placeholder-avatar.jpg'
        },
        featuredImage: featuredMedia
            ? {
                url: featuredMedia.source_url,
                alt: featuredMedia.alt_text || title,
                width: featuredMedia.media_details?.width || 1200,
                height: featuredMedia.media_details?.height || 630
            }
            : undefined,
        categories: terms?.[0]?.map((term) => decodeEntities(term.name)) || [],
        tags: terms?.[1]?.map((term) => decodeEntities(term.name)) || [],
        seo: {
            title: getString('title') || title,
            description: getString('description') || excerpt,
            ogTitle: getString('og_title') || getString('title') || title,
            ogDescription: getString('og_description') || getString('description') || excerpt,
            ogImage,
            twitterTitle: getString('twitter_title') || getString('title') || title,
            twitterDescription: getString('twitter_description') || getString('description') || excerpt,
            twitterImage,
        }
    }
}
