import Link from 'next/link'
import {cn} from '@/lib/utils'
import type {PostPreview} from '@/types/wordpress'

interface PostNavigationProps {
    previous: PostPreview | null
    next: PostPreview | null
}

export function PostNavigation({previous, next}: PostNavigationProps) {
    if (!previous && !next) return null

    return (
        <nav
            aria-label="Posts adyacentes"
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-16 pt-8 border-t border-border"
        >
            <NavLink post={previous} direction="prev"/>
            <NavLink post={next} direction="next"/>
        </nav>
    )
}

function NavLink({post, direction}: { post: PostPreview | null; direction: 'prev' | 'next' }) {
    const label = direction === 'prev' ? 'Más reciente' : 'Más antiguo'
    const arrow = direction === 'prev' ? '←' : '→'
    const align = direction === 'prev' ? 'text-left' : 'sm:text-right sm:col-start-2'

    if (!post) {
        return <div className={cn('hidden sm:block', align)}/>
    }

    return (
        <Link
            href={`/posts/${post.slug}`}
            className={cn(
                'group block rounded-lg border border-border px-5 py-4 transition-colors hover:border-foreground/30',
                align
            )}
        >
            <span
                className={cn(
                    'block font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2',
                )}
            >
                <span aria-hidden="true">{direction === 'prev' ? arrow + ' ' : ''}</span>
                {label}
                <span aria-hidden="true">{direction === 'next' ? ' ' + arrow : ''}</span>
            </span>
            <span className="block text-base font-medium leading-snug text-foreground line-clamp-2">
                {post.title}
            </span>
        </Link>
    )
}
