import {Suspense} from "react"
import {ThemeToggle} from "@/components/theme-toggle"
import {NewsletterForm} from "@/components/newsletter-form"
import {CommandPalette} from "@/components/command-palette"
import {PostsList} from "@/components/posts-list"
import {PostsListSkeleton} from "@/components/posts-list-skeleton"
import {CurrentYear} from "@/components/current-year"
import {getPosts} from "@/lib/wordpress"

export const revalidate = 300

interface HomeProps {
    searchParams: Promise<{ page?: string }>
}

export default async function Home({searchParams}: HomeProps) {
    const {page} = await searchParams
    const currentPage = Number(page) || 1
    const postsPerPage = 12

    const allPosts = await getPosts(1, 100)

    return (
        <div className="min-h-screen flex flex-col">
            <header className="sticky top-0 z-30 backdrop-blur-md bg-background/70 border-b border-border/60">
                <div className="mx-auto max-w-5xl px-6 py-3 flex items-center justify-between gap-4">
                    <a href="/" className="font-mono text-sm tracking-tight text-foreground">
                        agrcodes
                    </a>
                    <div className="flex items-center gap-2">
                        <div className="w-full max-w-xs">
                            <CommandPalette posts={allPosts}/>
                        </div>
                        <ThemeToggle/>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                <section className="mx-auto max-w-5xl px-6 pt-14 md:pt-20 pb-8">
                    <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">
                        Alejandro González Romero
                    </p>
                    <h1 className="text-3xl md:text-5xl font-semibold tracking-tight leading-[1.1] mb-4 max-w-2xl">
                        Reflexiones, software y ciencia ficción
                        <span className="text-muted-foreground"> en un mismo universo.</span>
                    </h1>
                    <p className="text-base text-muted-foreground max-w-xl">
                        Notas que escribo cuando algo me obsesiona lo suficiente.
                    </p>
                </section>

                <section className="mx-auto max-w-5xl px-6 pb-16">
                    <Suspense fallback={<PostsListSkeleton/>}>
                        <PostsList currentPage={currentPage} postsPerPage={postsPerPage}/>
                    </Suspense>
                </section>
            </main>

            <footer className="border-t border-border">
                <div className="mx-auto max-w-5xl px-6 py-12 grid gap-10 md:grid-cols-[1fr,auto] md:items-end">
                    <Suspense fallback={null}>
                        <NewsletterForm/>
                    </Suspense>
                    <div className="flex flex-col gap-4 md:items-end">
                        <div className="flex items-center gap-3 text-muted-foreground">
                            <SocialLink href="https://x.com/agonzalezrom" label="X / Twitter">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                </svg>
                            </SocialLink>
                            <SocialLink href="https://github.com/agonzalezrom/" label="GitHub">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fillRule="evenodd" clipRule="evenodd"
                                          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                                </svg>
                            </SocialLink>
                            <SocialLink href="https://www.instagram.com/agonzalezrom/" label="Instagram">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fillRule="evenodd" clipRule="evenodd"
                                          d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
                                </svg>
                            </SocialLink>
                        </div>
                        <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                            © <Suspense fallback="2026"><CurrentYear/></Suspense> agrcodes
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

function SocialLink({href, label, children}: { href: string; label: string; children: React.ReactNode }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-border hover:border-foreground/20 hover:text-foreground transition-colors"
        >
            {children}
        </a>
    )
}
