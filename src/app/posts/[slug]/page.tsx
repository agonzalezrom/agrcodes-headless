import {ViewTransition} from "react"
import Link from "next/link"
import type {Metadata} from "next"
import {notFound} from "next/navigation"

import {ThemeToggle} from "@/components/theme-toggle"
import {CodeBlock} from "@/components/code-block"
import {PostMath} from "@/components/post-math"
import {ReadingProgress} from "@/components/reading-progress"
import {TableOfContents} from "@/components/table-of-contents"
import {PostNavigation} from "@/components/post-navigation"
import {NewsletterForm} from "@/components/newsletter-form"
import {getPostBySlug, getAllPostSlugs, getAdjacentPosts} from "@/lib/wordpress"
import {calculateReadingTime, formatDate} from "@/lib/utils"

export const revalidate = 60

export async function generateStaticParams() {
    return await getAllPostSlugs()
}

export async function generateMetadata({params}: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const {slug} = await params
    const post = await getPostBySlug(slug)

    if (!post) {
        return {title: 'Post no encontrado - agrcodes.com'}
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://agrcodes.com'
    const postUrl = `${baseUrl}/posts/${post.slug}`

    return {
        title: `${post.seo?.title || post.title} - agrcodes.com`,
        description: post.seo?.description || post.excerpt,
        authors: [{name: post.author.name}],
        keywords: post.tags?.join(', '),
        openGraph: {
            type: 'article',
            title: post.seo?.ogTitle || post.seo?.title || post.title,
            description: post.seo?.ogDescription || post.seo?.description || post.excerpt,
            url: postUrl,
            siteName: 'agrcodes.com',
            publishedTime: post.dateISO,
            modifiedTime: post.modifiedISO,
            authors: [post.author.name],
            images: post.seo?.ogImage
                ? [{
                    url: post.seo.ogImage,
                    width: post.featuredImage?.width || 1200,
                    height: post.featuredImage?.height || 630,
                    alt: post.title,
                }]
                : [],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.seo?.twitterTitle || post.seo?.title || post.title,
            description: post.seo?.twitterDescription || post.seo?.description || post.excerpt,
            creator: '@agrcodes',
            images: post.seo?.twitterImage ? [post.seo.twitterImage] : [],
        },
        alternates: {canonical: postUrl},
    }
}

export default async function PostPage({params}: { params: Promise<{ slug: string }> }) {
    const {slug} = await params
    const [post, adjacents] = await Promise.all([
        getPostBySlug(slug),
        getAdjacentPosts(slug),
    ])

    if (!post) notFound()

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://agrcodes.com'
    const postUrl = `${baseUrl}/posts/${post.slug}`
    const readingTime = calculateReadingTime(post.content)
    const modifiedDate = post.modifiedISO && post.modifiedISO !== post.dateISO ? post.modifiedISO : null

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        image: post.seo?.ogImage || post.featuredImage?.url,
        datePublished: post.dateISO,
        dateModified: post.modifiedISO || post.dateISO,
        author: {
            '@type': 'Person',
            name: post.author.name,
            image: post.author.avatar,
        },
        publisher: {
            '@type': 'Person',
            name: 'Alejandro González Romero',
            logo: {'@type': 'ImageObject', url: `${baseUrl}/logo.png`},
        },
        mainEntityOfPage: {'@type': 'WebPage', '@id': postUrl},
    }

    const category = post.categories?.[0]

    return (
        <div className="min-h-screen flex flex-col">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}}
            />

            <CodeBlock/>
            <PostMath/>
            <ReadingProgress/>

            <ViewTransition name="persistent-nav" share="persistent-nav" default="none">
                <nav
                    className="sticky top-0 z-30 backdrop-blur-md bg-background/70 border-b border-border/60"
                    aria-label="Navegación principal"
                >
                    <div className="mx-auto max-w-[1080px] px-6 py-3 flex items-center justify-between">
                        <Link
                            href="/"
                            transitionTypes={['nav-post']}
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <span aria-hidden="true">←</span>
                            <span>Blog</span>
                        </Link>
                        <ThemeToggle/>
                    </div>
                </nav>
            </ViewTransition>

            <main className="flex-1 mx-auto w-full max-w-[1080px] px-6 py-12 md:py-16">
                <article>
                    {post.headings.length > 0 ? (
                        <div className="xl:grid xl:grid-cols-[minmax(0,680px)_200px] xl:gap-x-12 xl:justify-center">
                            <div className="mx-auto xl:mx-0 max-w-[680px]">
                                <PostHeader
                                    category={category}
                                    title={post.title}
                                    slug={slug}
                                    dateISO={post.dateISO}
                                    authorName={post.author.name}
                                    readingTime={readingTime}
                                />
                                <ViewTransition enter="content-reveal" default="none">
                                    <div>
                                        <div
                                            className="prose"
                                            dangerouslySetInnerHTML={{__html: post.content}}
                                        />
                                        <PostFooter
                                            tags={post.tags}
                                            modifiedDate={modifiedDate}
                                            previous={adjacents.previous}
                                            next={adjacents.next}
                                        />
                                    </div>
                                </ViewTransition>
                            </div>
                            <aside className="hidden xl:block">
                                <div className="sticky top-24 mt-24">
                                    <TableOfContents headings={post.headings}/>
                                </div>
                            </aside>
                        </div>
                    ) : (
                        <div className="mx-auto max-w-[680px]">
                            <PostHeader
                                category={category}
                                title={post.title}
                                slug={slug}
                                dateISO={post.dateISO}
                                authorName={post.author.name}
                                readingTime={readingTime}
                            />
                            <ViewTransition enter="content-reveal" default="none">
                                <div>
                                    <div
                                        className="prose"
                                        dangerouslySetInnerHTML={{__html: post.content}}
                                    />
                                    <PostFooter
                                        tags={post.tags}
                                        modifiedDate={modifiedDate}
                                        previous={adjacents.previous}
                                        next={adjacents.next}
                                    />
                                </div>
                            </ViewTransition>
                        </div>
                    )}
                </article>
            </main>
        </div>
    )
}

interface PostHeaderProps {
    category?: string
    title: string
    slug: string
    dateISO: string
    authorName: string
    readingTime: number
}

function PostHeader({category, title, slug, dateISO, authorName, readingTime}: PostHeaderProps) {
    return (
        <header className="mb-12 md:mb-16">
            {category && (
                <ViewTransition enter="content-reveal" default="none">
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-5">
                        {category}
                    </p>
                </ViewTransition>
            )}
            <ViewTransition name={`title-${slug}`} share="morph-glide" default="none">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.1] mb-6">
                    {title}
                </h1>
            </ViewTransition>
            <ViewTransition name={`meta-${slug}`} share="morph-glide" default="none">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    <time dateTime={dateISO}>{formatDate(dateISO)}</time>
                    <span aria-hidden="true">·</span>
                    <span>{readingTime} min</span>
                    <span aria-hidden="true">·</span>
                    <span>{authorName}</span>
                </div>
            </ViewTransition>
        </header>
    )
}

interface PostFooterProps {
    tags?: string[]
    modifiedDate: string | null
    previous: Awaited<ReturnType<typeof getAdjacentPosts>>['previous']
    next: Awaited<ReturnType<typeof getAdjacentPosts>>['next']
}

function PostFooter({tags, modifiedDate, previous, next}: PostFooterProps) {
    return (
        <>
            {tags && tags.length > 0 && (
                <div className="mt-16 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                        <span
                            key={tag}
                            className="inline-flex items-center font-mono text-[11px] uppercase tracking-wider text-muted-foreground border border-border rounded-full px-2.5 py-1 hover:text-foreground hover:border-foreground/20 transition-colors"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            )}

            {modifiedDate && (
                <p className="mt-8 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    Actualizado · {formatDate(modifiedDate)}
                </p>
            )}

            <div className="mt-16">
                <NewsletterForm
                    variant="card"
                    heading="¿Te gustó este post?"
                    description="Suscríbete para recibir los próximos en tu correo. Sin spam."
                />
            </div>

            <PostNavigation previous={previous} next={next}/>
        </>
    )
}
