'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'
import Link from 'next/link'
import type { Post } from '@/types/wordpress'

interface SearchProps {
  posts: Post[]
}

interface SearchResult extends Post {
  matchScore: number
  matchedField: 'title' | 'excerpt' | 'content'
  highlightedText: string
}

export function Search({ posts }: SearchProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isVerified, setIsVerified] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { executeRecaptcha } = useGoogleReCaptcha()

  // Búsqueda potente con scoring
  const results = useMemo(() => {
    if (query.length < 2) return []

    const searchTerms = query.toLowerCase().split(' ').filter(Boolean)
    const scored: SearchResult[] = []

    posts.forEach((post) => {
      const titleLower = post.title.toLowerCase()
      const excerptLower = post.excerpt.toLowerCase()
      const contentLower = post.content.replace(/<[^>]*>/g, '').toLowerCase()

      let score = 0
      let matchedField: 'title' | 'excerpt' | 'content' = 'content'
      let highlightedText = ''

      searchTerms.forEach((term) => {
        // Búsqueda en título (mayor peso)
        if (titleLower.includes(term)) {
          score += 10
          matchedField = 'title'
          highlightedText = post.title
        }

        // Búsqueda en excerpt (peso medio)
        if (excerptLower.includes(term)) {
          score += 5
          if (matchedField === 'content') {
            matchedField = 'excerpt'
            highlightedText = post.excerpt
          }
        }

        // Búsqueda en contenido (menor peso)
        if (contentLower.includes(term)) {
          score += 1
          if (!highlightedText) {
            // Extraer contexto alrededor del término
            const index = contentLower.indexOf(term)
            const start = Math.max(0, index - 60)
            const end = Math.min(contentLower.length, index + term.length + 60)
            const context = post.content.replace(/<[^>]*>/g, '').substring(start, end)
            highlightedText = (start > 0 ? '...' : '') + context + (end < contentLower.length ? '...' : '')
            matchedField = 'content'
          }
        }

        // Bonus por coincidencia exacta al inicio
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

    // Ordenar por score (mayor primero)
    return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, 8)
  }, [query, posts])

  // Highlight de términos en el texto
  const highlightText = (text: string, query: string) => {
    if (!query) return text

    const searchTerms = query.split(' ').filter(Boolean)
    let highlighted = text

    searchTerms.forEach((term) => {
      const regex = new RegExp(`(${term})`, 'gi')
      highlighted = highlighted.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-900/50">$1</mark>')
    })

    return highlighted
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || results.length === 0) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) => (prev + 1) % results.length)
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => (prev - 1 + results.length) % results.length)
          break
        case 'Enter':
          e.preventDefault()
          if (results[selectedIndex]) {
            window.location.href = `/posts/${results[selectedIndex].slug}`
          }
          break
        case 'Escape':
          e.preventDefault()
          setIsOpen(false)
          setQuery('')
          inputRef.current?.blur()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex])

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Reset selected index cuando cambian los resultados
  useEffect(() => {
    setSelectedIndex(0)
  }, [results])

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)

    if (value.length >= 2) {
      // Verificar con ReCAPTCHA antes de mostrar resultados
      if (!isVerified && executeRecaptcha) {
        try {
          const token = await executeRecaptcha('search')

          // Validar el token con nuestro API route
          const response = await fetch('/api/verify-recaptcha', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token, action: 'search' }),
          })

          const data = await response.json()

          if (data.success) {
            setIsVerified(true)
            setIsOpen(true)
          } else {
            console.warn('ReCAPTCHA verification failed:', data.error, 'Score:', data.score)
            // Aún permitir búsqueda pero loggear el intento
            setIsOpen(true)
          }
        } catch (error) {
          console.error('ReCAPTCHA verification error:', error)
          // En caso de error, permitir búsqueda (UX)
          setIsOpen(true)
        }
      } else {
        setIsOpen(true)
      }
    } else {
      setIsOpen(false)
    }
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder="Buscar posts..."
          className="w-full px-4 py-2.5 pl-10 rounded-lg border border-border bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
        />
        {/* Search Icon */}
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        {/* Clear button */}
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setIsOpen(false)
              inputRef.current?.focus()
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Results Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-2xl overflow-hidden z-50 max-h-[32rem] overflow-y-auto">
          {results.length > 0 ? (
            <div className="py-2">
              {/* Results count */}
              <div className="px-4 py-2 text-xs text-muted-foreground border-b border-border">
                {results.length} {results.length === 1 ? 'resultado' : 'resultados'}
              </div>

              {/* Results list */}
              {results.map((result, index) => (
                <Link
                  key={result.id}
                  href={`/posts/${result.slug}`}
                  className={`block px-4 py-3 hover:bg-muted transition-colors ${
                    index === selectedIndex ? 'bg-muted' : ''
                  }`}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => {
                    setIsOpen(false)
                    setQuery('')
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Match indicator */}
                    <div className="flex-shrink-0 mt-1">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          result.matchedField === 'title'
                            ? 'bg-green-500'
                            : result.matchedField === 'excerpt'
                            ? 'bg-yellow-500'
                            : 'bg-blue-500'
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      <h3
                        className="font-semibold text-sm mb-1 line-clamp-1"
                        dangerouslySetInnerHTML={{ __html: highlightText(result.title, query) }}
                      />

                      {/* Excerpt or context */}
                      <p
                        className="text-xs text-muted-foreground line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: highlightText(result.highlightedText, query) }}
                      />

                      {/* Date */}
                      <p className="text-xs text-muted-foreground mt-1">{result.date}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-muted-foreground text-sm">
              No se encontraron resultados para "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  )
}
