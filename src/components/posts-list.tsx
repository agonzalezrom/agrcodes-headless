"use cache"

import Link from "next/link"
import Image from "next/image"
import {getPosts, getTotalPosts} from "@/lib/wordpress"

interface PostsListProps {
    currentPage: number
    postsPerPage: number
}

export async function PostsList({currentPage, postsPerPage}: PostsListProps) {

    const [posts, totalPosts] = await Promise.all([
        getPosts(currentPage, postsPerPage),
        getTotalPosts()
    ])

    const totalPages = Math.ceil(totalPosts / postsPerPage)
    const hasNextPage = currentPage < totalPages
    const hasPrevPage = currentPage > 1

    return (
        <>
            <div className="space-y-3 md:space-y-4">
                {posts.length > 0 ? (
                    posts.map((post) => (
                        <article key={post.id} className="group cursor-pointer">
                            <Link href={`/posts/${post.slug}`} className="block">
                                {post.featuredImage && (
                                    <div
                                        className="relative -mx-6 px-6 mb-6 md:-mx-8 md:px-8 rounded-lg overflow-hidden">
                                        <div className="absolute inset-0 opacity-25">
                                            <Image
                                                src={post.featuredImage.url}
                                                alt={post.featuredImage.alt}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 768px) calc(100vw - 48px), (max-width: 1280px) calc(100vw - 64px), 100%"
                                                loading="lazy"
                                            />
                                        </div>

                                        <div
                                            className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/60"></div>

                                        <div className="relative py-6 md:py-8">
                                            <time className="text-sm text-muted-foreground block mb-3 underline">
                                                {post.date}
                                            </time>
                                            <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-tight transition-colors group-hover:text-foreground/80 inline-block">
                                                {post.title}
                                            </h2>
                                            <p className="text-lg text-muted-foreground leading-relaxed no-underline line-clamp-2"
                                               dangerouslySetInnerHTML={{__html: post.excerpt}}></p>
                                        </div>
                                    </div>
                                )}

                                {!post.featuredImage && (
                                    <>
                                        <time className="text-sm text-muted-foreground block mb-3 underline">
                                            {post.date}
                                        </time>
                                        <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-tight transition-colors group-hover:text-foreground/80 inline-block">
                                            {post.title}
                                        </h2>
                                        <p className="text-lg text-muted-foreground leading-relaxed no-underline"
                                           dangerouslySetInnerHTML={{__html: post.excerpt}}></p>
                                    </>
                                )}
                            </Link>
                        </article>
                    ))
                ) : (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No se encontraron posts. Configura tu URL de WordPress en .env.local</p>
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="mt-16 flex items-center justify-center gap-4">
                    {hasPrevPage && (
                        <Link
                            href={currentPage === 2 ? '/' : `/?page=${currentPage - 1}`}
                            className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
                        >
                            ← Anterior
                        </Link>
                    )}

                    <span className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </span>

                    {hasNextPage && (
                        <Link
                            href={`/?page=${currentPage + 1}`}
                            className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
                        >
                            Siguiente →
                        </Link>
                    )}
                </div>
            )}
        </>
    )
}