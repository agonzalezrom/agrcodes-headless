import Link from "next/link"
import {unstable_ViewTransition as ViewTransition} from "react"

import {ThemeToggle} from "@/components/theme-toggle"
import {NewsletterForm} from "@/components/newsletter-form"
import {Search} from "@/components/search"
import {getPosts, getTotalPosts} from "@/lib/wordpress"

// Forzar dynamic rendering para esta página
// Permite que el home use API routes y se regenere en cada request
export const dynamic = 'force-dynamic'

interface HomeProps {
    searchParams: Promise<{ page?: string }>
}

export default async function Home({ searchParams }: HomeProps) {

    const { page } = await searchParams
    const currentPage = Number(page) || 1
    const postsPerPage = 10

    const [posts, totalPosts] = await Promise.all([
        getPosts(currentPage, postsPerPage),
        getTotalPosts()
    ])

    const totalPages = Math.ceil(totalPosts / postsPerPage)
    const hasNextPage = currentPage < totalPages
    const hasPrevPage = currentPage > 1

    return (
        <div className="min-h-screen">
            <nav className="fixed top-6 right-6 z-50">
                <div className="flex items-center gap-4">
                    <ThemeToggle/>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-6 py-16 md:py-24">
                <div className="mb-12 md:mb-16">
                    <h1 className="text-3xl md:text-4xl font-bold mb-3">agr.codes</h1>
                    <p className="text-muted-foreground text-lg md:text-xl mb-8">By Alejandro González Romero</p>
                    <Search posts={posts} />
                </div>

                <div className="space-y-12 md:space-y-16">
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <article key={post.id} className="group">
                                <Link href={`/posts/${post.slug}`} className="block">
                                    <ViewTransition name={`post-date-${post.slug}`}>
                                        <time className="text-sm text-muted-foreground block mb-3">
                                            {post.date}
                                        </time>
                                    </ViewTransition>
                                    <ViewTransition name={`post-title-${post.slug}`}>
                                        <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-tight transition-colors group-hover:text-foreground/80 inline-block">
                                            {post.title}
                                        </h2>
                                    </ViewTransition>
                                    <p className="text-lg text-muted-foreground leading-relaxed">{post.excerpt}</p>
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

                {/* Paginación */}
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

                <footer className="mt-24 md:mt-32 pt-12 border-t space-y-8">
                    <NewsletterForm/>

                    <div className="text-center space-y-4">
                        <p className="text-muted-foreground italic">
                            Computers are fast and precise; humans are brilliant together.
                        </p>

                        <div className="flex items-center justify-center gap-6">
                            <a
                                href="https://x.com/agonzalezrom"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                                aria-label="Twitter/X"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                </svg>
                            </a>
                            <a
                                href="https://www.instagram.com/agonzalezrom/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                                aria-label="Instagram"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"/>
                                </svg>
                            </a>
                            <a
                                href="https://github.com/agonzalezrom/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                                aria-label="GitHub"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                                </svg>
                            </a>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            With ❤️ by Alejandro González Romero
                        </p>

                        <p className="text-sm text-muted-foreground">
                            © {new Date().getFullYear()} agr.codes
                        </p>
                    </div>
                </footer>
            </main>
        </div>
    )
}
