'use client'

import {useEffect, useState} from 'react'
import {cn} from '@/lib/utils'
import type {Heading} from '@/types/wordpress'

interface TableOfContentsProps {
    headings: Heading[]
}

export function TableOfContents({headings}: TableOfContentsProps) {
    const [activeSlug, setActiveSlug] = useState<string | null>(headings[0]?.slug ?? null)

    useEffect(() => {
        if (headings.length === 0) return

        const elements = headings
            .map(h => document.getElementById(h.slug))
            .filter((el): el is HTMLElement => el !== null)

        if (elements.length === 0) return

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter(e => e.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
                if (visible[0]) {
                    setActiveSlug(visible[0].target.id)
                }
            },
            {
                rootMargin: '-80px 0px -60% 0px',
                threshold: [0, 1],
            }
        )

        elements.forEach(el => observer.observe(el))

        return () => observer.disconnect()
    }, [headings])

    if (headings.length === 0) return null

    return (
        <nav aria-label="Tabla de contenido" className="text-sm">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4">
                Contenido
            </p>
            <ul className="space-y-2 border-l border-border">
                {headings.map((h) => {
                    const isActive = h.slug === activeSlug
                    return (
                        <li key={h.slug} className={cn(h.level === 3 && 'pl-3')}>
                            <a
                                href={`#${h.slug}`}
                                className={cn(
                                    'block -ml-px pl-4 py-1 border-l border-transparent transition-colors leading-snug',
                                    isActive
                                        ? 'border-foreground text-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                {h.text}
                            </a>
                        </li>
                    )
                })}
            </ul>
        </nav>
    )
}
