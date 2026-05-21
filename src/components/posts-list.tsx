import {ViewTransition} from 'react'
import Link from 'next/link'
import {getPosts, getTotalPosts} from '@/lib/wordpress'
import {Cover} from '@/components/cover'
import {formatDateShort, getYear, calculateReadingTime} from '@/lib/utils'

interface PostsListProps {
    currentPage: number
    postsPerPage: number
}

export async function PostsList({currentPage, postsPerPage}: PostsListProps) {
    const [posts, totalPosts] = await Promise.all([
        getPosts(currentPage, postsPerPage),
        getTotalPosts(),
    ])

    const totalPages = Math.ceil(totalPosts / postsPerPage)
    const hasNextPage = currentPage < totalPages
    const hasPrevPage = currentPage > 1

    if (posts.length === 0) {
        return (
            <div className="text-center py-16 text-sm text-muted-foreground">
                No se encontraron posts. Configura tu URL de WordPress en .env.local.
            </div>
        )
    }

    // Agrupar por año preservando el orden
    const groups: { year: number; items: typeof posts }[] = []
    posts.forEach((post) => {
        const year = getYear(post.dateISO)
        const last = groups[groups.length - 1]
        if (last && last.year === year) {
            last.items.push(post)
        } else {
            groups.push({year, items: [post]})
        }
    })

    return (
        <>
            <div className="space-y-12">
                {groups.map((group) => (
                    <section key={group.year}>
                        <div className="flex items-baseline gap-4 mb-6">
                            <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                {group.year}
                            </h2>
                            <span className="flex-1 border-t border-border"/>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                            {group.items.map((post) => (
                                <PostCard
                                    key={post.id}
                                    slug={post.slug}
                                    title={post.title}
                                    excerpt={post.excerpt}
                                    dateISO={post.dateISO}
                                    content={post.plainTextContent}
                                    cover={post.featuredImage}
                                />
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            {totalPages > 1 && (
                <div className="mt-16 flex items-center justify-between border-t border-border pt-6">
                    <div>
                        {hasPrevPage ? (
                            <Link
                                href={currentPage === 2 ? '/' : `/?page=${currentPage - 1}`}
                                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                ← Página anterior
                            </Link>
                        ) : (
                            <span/>
                        )}
                    </div>
                    <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                        {currentPage} / {totalPages}
                    </span>
                    <div>
                        {hasNextPage ? (
                            <Link
                                href={`/?page=${currentPage + 1}`}
                                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Siguiente página →
                            </Link>
                        ) : (
                            <span/>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

interface PostCardProps {
    slug: string
    title: string
    excerpt: string
    dateISO: string
    content: string
    cover?: { url: string; alt: string; width: number; height: number }
}

function PostCard({slug, title, excerpt, dateISO, content, cover}: PostCardProps) {
    const readingTime = calculateReadingTime(content)

    return (
        <Link
            href={`/posts/${slug}`}
            transitionTypes={['nav-post']}
            className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
        >
            <article className="flex flex-col gap-3">
                <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-border bg-muted">
                    <Cover
                        slug={slug}
                        title={title}
                        src={cover?.url}
                        alt={cover?.alt}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                    />
                    <div className="absolute inset-0 ring-1 ring-inset ring-foreground/5 rounded-lg pointer-events-none"/>
                </div>

                <div className="flex flex-col gap-1.5">
                    <ViewTransition name={`meta-${slug}`} share="morph-glide" exit="fade-out" default="none">
                        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                            <time dateTime={dateISO}>{formatDateShort(dateISO)}</time>
                            <span aria-hidden="true">·</span>
                            <span>{readingTime} min</span>
                        </div>
                    </ViewTransition>
                    <ViewTransition name={`title-${slug}`} share="morph-glide" exit="fade-out" default="none">
                        <h3 className="text-lg md:text-xl font-semibold leading-snug tracking-tight text-foreground">
                            <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-no-repeat bg-[position:0_100%] group-hover:bg-[length:100%_1px] transition-[background-size] duration-300">
                                {title}
                            </span>
                        </h3>
                    </ViewTransition>
                    {excerpt && (
                        <p
                            className="text-sm text-muted-foreground line-clamp-2 leading-relaxed"
                            dangerouslySetInnerHTML={{__html: excerpt}}
                        />
                    )}
                </div>
            </article>
        </Link>
    )
}
