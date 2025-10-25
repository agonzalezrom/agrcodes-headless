'use cache'

import Link from "next/link"
import { ViewTransition } from "react"
import { getPosts, getTotalPosts } from "@/lib/wordpress"

interface PostsListProps {
  currentPage: number
  postsPerPage: number
}

export async function PostsList({ currentPage, postsPerPage }: PostsListProps) {
  const [posts, totalPosts] = await Promise.all([
    getPosts(currentPage, postsPerPage),
    getTotalPosts()
  ])

  const totalPages = Math.ceil(totalPosts / postsPerPage)
  const hasNextPage = currentPage < totalPages
  const hasPrevPage = currentPage > 1

  return (
    <>
      <div className="space-y-12 md:space-y-16">
        {posts.length > 0 ? (
          posts.map((post) => (
            <article key={post.id} className="group cursor-pointer">
              <Link href={`/posts/${post.slug}`} className="block no-underline">
                <ViewTransition name={`post-date-${post.slug}`}>
                  <time className="text-sm text-muted-foreground block mb-3 underline">
                    {post.date}
                  </time>
                </ViewTransition>
                <ViewTransition name={`post-title-${post.slug}`}>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-tight transition-colors group-hover:text-foreground/80 inline-block">
                    {post.title}
                  </h2>
                </ViewTransition>
                <p className="text-lg text-muted-foreground leading-relaxed no-underline" dangerouslySetInnerHTML={{__html: post.excerpt}}></p>
              </Link>
            </article>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No se encontraron posts. Configura tu URL de WordPress
              en .env.local</p>
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