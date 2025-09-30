import Link from "next/link"
import type {Metadata} from "next"
import {notFound} from "next/navigation"
import {unstable_ViewTransition as ViewTransition} from "react"

import {ThemeToggle} from "@/components/theme-toggle"
import {CodeBlock} from "@/components/code-block"
import {getPostBySlug, getAllPostSlugs} from "@/lib/wordpress"
import {calculateReadingTime} from "@/lib/utils"

// Generar páginas estáticas para todos los posts en build time
export async function generateStaticParams() {
    return await getAllPostSlugs()
}

// Estrategia: generar estáticamente todos los posts conocidos,
// y regenerar bajo demanda si se crea un post nuevo (ISR)
export const dynamicParams = true // Permitir generación de nuevos posts bajo demanda
export const revalidate = 3600 // Revalidar cada hora (ajustable)

export async function generateMetadata({params}: { params: Promise<{slug: string }>}): Promise<Metadata> {

    const { slug } = await params
    const post = await getPostBySlug(slug)

    if (!post) {
        return {
            title: 'Post no encontrado - agr.codes',
        }
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://agr.codes'
    const postUrl = `${baseUrl}/posts/${post.slug}`

    return {
        title: `${post.seo?.title || post.title} - agr.codes`,
        description: post.seo?.description || post.excerpt,
        authors: [{name: post.author.name}],
        keywords: post.tags?.join(', '),
        openGraph: {
            type: 'article',
            title: post.seo?.ogTitle || post.seo?.title || post.title,
            description: post.seo?.ogDescription || post.seo?.description || post.excerpt,
            url: postUrl,
            siteName: 'agr.codes',
            publishedTime: post.dateISO,
            authors: [post.author.name],
            images: post.seo?.ogImage
                ? [
                    {
                        url: post.seo.ogImage,
                        width: post.featuredImage?.width || 1200,
                        height: post.featuredImage?.height || 630,
                        alt: post.title,
                    },
                ]
                : [],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.seo?.twitterTitle || post.seo?.title || post.title,
            description: post.seo?.twitterDescription || post.seo?.description || post.excerpt,
            creator: '@agrcodes',
            images: post.seo?.twitterImage ? [post.seo.twitterImage] : [],
        },
        alternates: {
            canonical: postUrl,
        },
        other: {
            // JSON-LD será agregado en el componente
        }
    }
}

export default async function PostPage({params}: { params: Promise<{ slug: string }> }) {

    const { slug } = await params
    const post = await getPostBySlug(slug)

    if (!post) {
        notFound()
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://agr.codes'
    const postUrl = `${baseUrl}/posts/${post.slug}`
    const readingTime = calculateReadingTime(post.content)

    // JSON-LD Structured Data
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        image: post.seo?.ogImage || post.featuredImage?.url,
        datePublished: post.dateISO,
        dateModified: post.dateISO,
        author: {
            '@type': 'Person',
            name: post.author.name,
            image: post.author.avatar,
        },
        publisher: {
            '@type': 'Person',
            name: 'Alejandro González Romero',
            logo: {
                '@type': 'ImageObject',
                url: `${baseUrl}/logo.png`,
            },
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': postUrl,
        },
    }

    return (
        <div className="min-h-screen">
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}}
            />

            <CodeBlock/>

            <nav className="fixed top-6 z-50 left-6 right-6 flex items-center justify-between">
                <Link
                    href="/"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    ← Volver
                </Link>
                <ThemeToggle/>
            </nav>

            <article className="max-w-5xl mx-auto px-6 py-16 md:py-24">
                <header className="mb-16 md:mb-20 text-center">
                    <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                    />
                    <p className="font-semibold text-lg mb-1">{post.author.name}</p>
                    <ViewTransition name={`post-date-${post.slug}`}>
                        <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground mb-8">
                            <time>{post.date}</time>
                            <span>·</span>
                            <span>{readingTime} min de lectura</span>
                        </div>
                    </ViewTransition>
                    <ViewTransition name={`post-title-${post.slug}`}>
                        <h1 className="text-4xl md:text-5xl font-bold leading-tight inline-block">
                            {post.title}
                        </h1>
                    </ViewTransition>
                </header>

                <div
                    className="prose prose-lg"
                    dangerouslySetInnerHTML={{__html: post.content}}
                />

                <footer className="mt-20 pt-12 border-t">
                    <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
                        ← Volver a todos los posts
                    </Link>
                </footer>
            </article>
        </div>
    )
}
