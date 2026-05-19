'use client'

import {useState, useEffect, useRef, useMemo, useCallback} from 'react'
import {useRouter} from 'next/navigation'
import {useGoogleReCaptcha} from 'react-google-recaptcha-v3'
import type {Post} from '@/types/wordpress'
import {cn} from '@/lib/utils'

interface CommandPaletteProps {
    posts: Post[]
}

interface SearchResult extends Post {
    matchScore: number
    matchedField: 'title' | 'excerpt' | 'content'
    highlightedText: string
}

export function CommandPalette({posts}: CommandPaletteProps) {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [isVerified, setIsVerified] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const listRef = useRef<HTMLDivElement>(null)
    const router = useRouter()
    const {executeRecaptcha} = useGoogleReCaptcha()

    const results = useMemo<SearchResult[]>(() => {
        if (query.length < 2) return []

        const searchTerms = query.toLowerCase().split(' ').filter(Boolean)
        const scored: SearchResult[] = []

        posts.forEach((post) => {
            const titleLower = post.title.toLowerCase()
            const excerptLower = post.excerpt.toLowerCase()
            const contentLower = post.plainTextContent.toLowerCase()

            let score = 0
            let matchedField: 'title' | 'excerpt' | 'content' = 'content'
            let highlightedText = ''

            searchTerms.forEach((term) => {
                if (titleLower.includes(term)) {
                    score += 10
                    matchedField = 'title'
                    highlightedText = post.title
                }
                if (excerptLower.includes(term)) {
                    score += 5
                    if (matchedField === 'content') {
                        matchedField = 'excerpt'
                        highlightedText = post.excerpt
                    }
                }
                if (contentLower.includes(term)) {
                    score += 1
                    if (!highlightedText) {
                        const index = contentLower.indexOf(term)
                        const start = Math.max(0, index - 60)
                        const end = Math.min(contentLower.length, index + term.length + 60)
                        const context = post.plainTextContent.substring(start, end)
                        highlightedText = (start > 0 ? '…' : '') + context + (end < contentLower.length ? '…' : '')
                    }
                }
                if (titleLower.startsWith(term)) score += 5
            })

            if (score > 0) {
                scored.push({
                    ...post,
                    matchScore: score,
                    matchedField,
                    highlightedText: highlightedText || post.excerpt,
                })
            }
        })

        return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, 8)
    }, [query, posts])

    const validIndex = Math.min(selectedIndex, Math.max(0, results.length - 1))

    // Global ⌘K / Ctrl+K to open
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault()
                setOpen((v) => !v)
                return
            }
            if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                e.preventDefault()
                setOpen(true)
            }
        }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [])

    // Focus + lock scroll when opening
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden'
            requestAnimationFrame(() => inputRef.current?.focus())
        } else {
            document.body.style.overflow = ''
            setQuery('')
            setSelectedIndex(0)
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [open])

    // Keyboard nav within palette
    useEffect(() => {
        if (!open) return
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault()
                setOpen(false)
                return
            }
            if (results.length === 0) return
            if (e.key === 'ArrowDown') {
                e.preventDefault()
                setSelectedIndex((i) => (i + 1) % results.length)
            } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setSelectedIndex((i) => (i - 1 + results.length) % results.length)
            } else if (e.key === 'Enter') {
                e.preventDefault()
                const target = results[validIndex]
                if (target) navigateTo(`/posts/${target.slug}`)
            }
        }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [open, results, validIndex])

    // Scroll selected into view
    useEffect(() => {
        const list = listRef.current
        if (!list) return
        const el = list.querySelector<HTMLElement>(`[data-index="${validIndex}"]`)
        el?.scrollIntoView({block: 'nearest'})
    }, [validIndex])

    const verifyWithRecaptcha = useCallback(async (value: string) => {
        if (value.length < 2) return
        if (isVerified || !executeRecaptcha) return
        try {
            const token = await executeRecaptcha('search')
            const response = await fetch('/api/verify-recaptcha', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({token, action: 'search'}),
            })
            const data = await response.json()
            if (data.success) setIsVerified(true)
        } catch (error) {
            console.error('ReCAPTCHA verification error:', error)
        }
    }, [isVerified, executeRecaptcha])

    useEffect(() => {
        const t = setTimeout(() => {
            void verifyWithRecaptcha(query)
        }, 400)
        return () => clearTimeout(t)
    }, [query, verifyWithRecaptcha])

    const navigateTo = useCallback((href: string) => {
        setOpen(false)
        router.push(href)
    }, [router])

    const highlight = (text: string, q: string) => {
        if (!q) return text
        const terms = q.split(' ').filter(Boolean)
        let h = text
        terms.forEach((term) => {
            const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            const regex = new RegExp(`(${escaped})`, 'gi')
            h = h.replace(regex, '<mark class="bg-foreground/10 text-foreground rounded-sm px-0.5">$1</mark>')
        })
        return h
    }

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                aria-label="Buscar posts"
                className="group flex items-center gap-3 rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors w-full max-w-sm"
            >
                <SearchIcon className="w-4 h-4"/>
                <span className="flex-1 text-left">Buscar posts…</span>
                <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setOpen(false)
                    }}
                >
                    <div className="absolute inset-0 bg-background/70 backdrop-blur-md" aria-hidden="true"/>
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label="Buscar"
                        className="relative w-full max-w-xl rounded-xl border border-border bg-card shadow-2xl overflow-hidden"
                    >
                        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                            <SearchIcon className="w-4 h-4 text-muted-foreground"/>
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Buscar posts…"
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value)
                                    setSelectedIndex(0)
                                }}
                                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                            />
                            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                                ESC
                            </kbd>
                        </div>

                        <div ref={listRef} className="max-h-[60vh] overflow-y-auto">
                            {query.length < 2 ? (
                                <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                                    Escribe al menos 2 caracteres para buscar.
                                </p>
                            ) : results.length === 0 ? (
                                <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                                    Sin resultados para &ldquo;{query}&rdquo;
                                </p>
                            ) : (
                                <ul className="py-2">
                                    {results.map((r, i) => {
                                        const active = i === validIndex
                                        return (
                                            <li key={r.id} data-index={i}>
                                                <button
                                                    onMouseEnter={() => setSelectedIndex(i)}
                                                    onClick={() => navigateTo(`/posts/${r.slug}`)}
                                                    className={cn(
                                                        'w-full text-left px-4 py-3 transition-colors flex flex-col gap-1',
                                                        active && 'bg-muted',
                                                    )}
                                                >
                                                    <span
                                                        className="text-sm font-medium text-foreground line-clamp-1"
                                                        dangerouslySetInnerHTML={{__html: highlight(r.title, query)}}
                                                    />
                                                    <span
                                                        className="text-xs text-muted-foreground line-clamp-1"
                                                        dangerouslySetInnerHTML={{__html: highlight(r.highlightedText, query)}}
                                                    />
                                                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70 mt-0.5">
                                                        {r.date}
                                                    </span>
                                                </button>
                                            </li>
                                        )
                                    })}
                                </ul>
                            )}
                        </div>

                        <div className="border-t border-border px-4 py-2 flex items-center gap-4 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                            <span>↑↓ navegar</span>
                            <span>↵ abrir</span>
                            <span>esc cerrar</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

function SearchIcon({className}: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
    )
}
