import {type ClassValue, clsx} from 'clsx'
import {twMerge} from 'tailwind-merge'
import type {Heading} from '@/types/wordpress'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Elimina tags HTML de un string
 */
export function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim()
}

/**
 * Decodifica entidades HTML — numéricas (decimal/hex) y nombradas comunes
 */
export function decodeEntities(text: string): string {
    return text
        // Entidades numéricas hexadecimales: &#x2026;
        .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
            const code = parseInt(hex, 16)
            return Number.isFinite(code) ? String.fromCodePoint(code) : _
        })
        // Entidades numéricas decimales: &#8230;
        .replace(/&#(\d+);/g, (_, dec) => {
            const code = parseInt(dec, 10)
            return Number.isFinite(code) ? String.fromCodePoint(code) : _
        })
        // Entidades nombradas comunes
        .replace(/&hellip;/g, '…')
        .replace(/&mdash;/g, '—')
        .replace(/&ndash;/g, '–')
        .replace(/&lsquo;/g, '‘')
        .replace(/&rsquo;/g, '’')
        .replace(/&ldquo;/g, '“')
        .replace(/&rdquo;/g, '”')
        .replace(/&laquo;/g, '«')
        .replace(/&raquo;/g, '»')
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        // &amp; al final para no reintroducir entidades ya decodificadas
        .replace(/&amp;/g, '&')
}

/**
 * Convierte texto en slug URL-safe
 */
export function slugify(text: string): string {
    return decodeEntities(text)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 80)
        .replace(/^-+|-+$/g, '')
}

/**
 * Formatea una fecha ISO a formato legible largo
 */
export function formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

/**
 * Formatea una fecha ISO a formato corto mono (ej: "May 12")
 */
export function formatDateShort(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    })
}

/**
 * Extrae el año de una fecha ISO
 */
export function getYear(dateString: string): number {
    return new Date(dateString).getFullYear()
}

/**
 * Calcula el tiempo estimado de lectura
 */
export function calculateReadingTime(text: string, wordsPerMinute: number = 200): number {
    const cleanText = stripHtml(text)
    const words = cleanText.trim().split(/\s+/).length
    return Math.ceil(words / wordsPerMinute)
}

/**
 * Hash determinístico de un string a un número en [0, 1)
 * Para generar gradientes consistentes desde slugs.
 */
export function hashToUnit(input: string): number {
    let hash = 0
    for (let i = 0; i < input.length; i++) {
        hash = ((hash << 5) - hash) + input.charCodeAt(i)
        hash |= 0
    }
    return Math.abs(hash) / 2147483647
}

/**
 * Sanitiza HTML eliminando scripts y handlers inline
 */
export function sanitizeContent(html: string): string {
    return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/\son\w+="[^"]*"/g, '')
        .replace(/\son\w+='[^']*'/g, '')
}

/**
 * Extrae headings h2/h3 del HTML, inyecta IDs slugificados y devuelve la tabla de contenidos.
 */
export function extractAndInjectHeadings(html: string): { content: string; headings: Heading[] } {
    const headings: Heading[] = []
    const seen = new Map<string, number>()

    const content = html.replace(/<(h2|h3)([^>]*)>([\s\S]*?)<\/\1>/gi, (match, tag, attrs, inner) => {
        const plain = stripHtml(inner).trim()
        if (!plain) return match

        const text = decodeEntities(plain)
        const base = slugify(text)
        if (!base) return match

        const count = seen.get(base) ?? 0
        const slug = count === 0 ? base : `${base}-${count}`
        seen.set(base, count + 1)

        const level = tag.toLowerCase() === 'h2' ? 2 : 3
        headings.push({level: level as 2 | 3, slug, text})

        if (/\sid\s*=\s*["']/.test(attrs)) {
            return match
        }

        return `<${tag}${attrs} id="${slug}">${inner}</${tag}>`
    })

    return {content, headings}
}

/**
 * Minifica HTML preservando contenido sensible
 */
export function minifyHtml(html: string): string {
    const protectedTags: { placeholder: string; content: string }[] = []
    let counter = 0

    html = html.replace(/<(pre|code|textarea|script)[^>]*>[\s\S]*?<\/\1>/gi, (match) => {
        const placeholder = `___PROTECTED_${counter}___`
        protectedTags.push({placeholder, content: match})
        counter++
        return placeholder
    })

    let minified = html
        .replace(/<!--(?!\[if\s)[\s\S]*?-->/g, '')
        .replace(/>\s+</g, '><')
        .replace(/^\s+/gm, '')
        .replace(/\s+$/gm, '')
        .replace(/\s{2,}/g, ' ')
        .replace(/\s*=\s*/g, '=')
        .replace(/\n\s*\n/g, '\n')
        .trim()

    protectedTags.forEach(({placeholder, content}) => {
        minified = minified.replace(placeholder, content)
    })

    return minified
}

/**
 * Procesa contenido de WordPress: limpia Code Block Pro y elimina inline styles
 */
export function processWordPressContent(html: string): string {
    let processed = sanitizeContent(html)

    const protectedCodeBlocks: { placeholder: string; content: string }[] = []
    let codeBlockCounter = 0

    processed = processed.replace(
        /<div([^>]*)class="wp-block-kevinbatdorf-code-block-pro"([^>]*)>([\s\S]*?)<\/div>/g,
        (match, before, after, content) => {
            const cleaned = (before + after)
                .replace(/\s*style="[^"]*"/gi, '')
                .replace(/\s*data-code-block-pro-font-family="[^"]*"/gi, '')

            let customTitle = ''
            const titleMatch = content.match(/<span[^>]*style="[^"]*border-bottom[^"]*"[^>]*>([^<]+)<\/span>/)
            if (titleMatch && titleMatch[1]) {
                customTitle = titleMatch[1].trim()
                    .replace(/&#8220;/g, '"')
                    .replace(/&#8221;/g, '"')
                    .replace(/&#8211;/g, '–')
                    .replace(/&#8212;/g, '—')
                    .replace(/&#\d+;/g, '')
            }

            let language = customTitle || 'Code'

            if (!customTitle) {
                const fontMatch = match.match(/data-code-block-pro-font-family="[^"]*"/i)
                if (fontMatch) {
                    language = fontMatch[0].replace(/data-code-block-pro-font-family="|"/g, '')
                        .replace('Code-Pro-', '')
                        .replace(/-/g, ' ')
                }

                if (content.includes('git ')) language = 'Bash'
                else if (content.includes('npm ') || content.includes('pnpm ')) language = 'Shell'
                else if (content.includes('function') || content.includes('const ')) language = 'JavaScript'
                else if (content.includes('interface') || content.includes('type ')) language = 'TypeScript'
                else if (content.includes('<?php')) language = 'PHP'
                else if (content.includes('def ') || content.includes('import ')) language = 'Python'
            }

            const textareaMatch = content.match(/<textarea[^>]*>([\s\S]*?)<\/textarea>/i)
            let codeForCopy = textareaMatch
                ? textareaMatch[1]
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'")
                    .replace(/&amp;/g, '&')
                : ''

            const cleanContent = content
                .replace(/<span[^>]*><svg[^>]*>[\s\S]*?<\/svg><\/span>/i, '')
                .replace(/<span[^>]*role="button"[^>]*>[\s\S]*?<\/span>/i, '')

            const codeMatch = cleanContent.match(/<pre[\s\S]*?<\/pre>/i)
            let codeBlock = codeMatch ? codeMatch[0] : ''
            codeBlock = codeBlock.replace(/<span\s+style="[^"]*"/gi, '<span')

            if (!codeForCopy && codeBlock) {
                const codeContentMatch = codeBlock.match(/<code[^>]*>([\s\S]*?)<\/code>/i)
                if (codeContentMatch) {
                    codeForCopy = codeContentMatch[1]
                        .replace(/<\/?(span|code)[^>]*>/gi, '')
                        .replace(/<br\s*\/?>/gi, '\n')
                        .replace(/<[^>]+>/g, '')
                        .replace(/&lt;/g, '<')
                        .replace(/&gt;/g, '>')
                        .replace(/&quot;/g, '"')
                        .replace(/&#39;/g, "'")
                        .replace(/&#91;/g, '[')
                        .replace(/&#93;/g, ']')
                        .replace(/&amp;/g, '&')
                }
            }

            // Codificar para sobrevivir minifyHtml + ser un valor de atributo HTML válido.
            // El navegador decodifica &#10; → \n al leer getAttribute, preservando saltos de línea al copiar.
            const encodedCode = codeForCopy
                .replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\r\n/g, '\n')
                .replace(/\n/g, '&#10;')
                .replace(/\t/g, '&#9;')

            const copyButton = codeForCopy
                ? `<span role="button" aria-label="Copy" data-code="${encodedCode}"><svg xmlns="http://www.w3.org/2000/svg" style="width:24px;height:24px" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path class="with-check" stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path><path class="without-check" stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg></span>`
                : ''

            const header = copyButton
                ? `<div class="code-block-header"><span class="code-language">${language}</span>${copyButton}</div>`
                : `<div class="code-block-header"><span class="code-language">${language}</span></div>`

            const finalBlock = `<div class="wp-block-code-block-pro"${cleaned}>${header}${codeBlock}</div>`

            const placeholder = `___CODE_BLOCK_${codeBlockCounter}___`
            protectedCodeBlocks.push({placeholder, content: finalBlock})
            codeBlockCounter++

            return placeholder
        }
    )

    processed = processed.replace(/\s*style="[^"]*"/gi, '')
    processed = processed.replace(/\s*color="[^"]*"/gi, '')

    protectedCodeBlocks.forEach(({placeholder, content}) => {
        processed = processed.replace(placeholder, content)
    })

    processed = minifyHtml(processed)

    return processed
}
