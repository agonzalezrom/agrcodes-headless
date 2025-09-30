/**
 * WordPress REST API Types
 *
 * Type definitions for WordPress REST API responses
 */

export interface WordPressPost {
  id: number
  date: string
  date_gmt: string
  modified: string
  modified_gmt: string
  slug: string
  status: string
  type: string
  link: string
  title: {
    rendered: string
  }
  content: {
    rendered: string
    protected: boolean
  }
  excerpt: {
    rendered: string
    protected: boolean
  }
  author: number
  featured_media: number
  comment_status: string
  ping_status: string
  sticky: boolean
  template: string
  format: string
  meta: any[]
  categories: number[]
  tags: number[]
  _embedded?: {
    author?: WordPressAuthor[]
    'wp:featuredmedia'?: WordPressFeaturedMedia[]
    'wp:term'?: WordPressTerm[][]
  }
}

export interface WordPressAuthor {
  id: number
  name: string
  url: string
  description: string
  link: string
  slug: string
  avatar_urls: {
    [key: string]: string
  }
}

export interface WordPressFeaturedMedia {
  id: number
  date: string
  slug: string
  type: string
  link: string
  title: {
    rendered: string
  }
  caption: {
    rendered: string
  }
  alt_text: string
  media_type: string
  mime_type: string
  media_details: {
    width: number
    height: number
    file: string
    sizes: {
      [key: string]: {
        file: string
        width: number
        height: number
        mime_type: string
        source_url: string
      }
    }
  }
  source_url: string
}

export interface WordPressTerm {
  id: number
  link: string
  name: string
  slug: string
  taxonomy: string
}

export interface Post {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  date: string // Fecha formateada para mostrar (ej: "8 de marzo de 2025")
  dateISO: string // Fecha ISO original de WordPress
  author: {
    name: string
    avatar: string
  }
  featuredImage?: {
    url: string
    alt: string
    width: number
    height: number
  }
  categories?: string[]
  tags?: string[]
  seo?: {
    title?: string
    description?: string
    ogTitle?: string
    ogDescription?: string
    ogImage?: string
    twitterTitle?: string
    twitterDescription?: string
    twitterImage?: string
  }
}
