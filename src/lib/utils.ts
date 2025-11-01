import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Elimina tags HTML de un string
 *
 * @param html - String con HTML
 * @returns String sin HTML
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

/**
 * Formatea una fecha ISO a formato legible
 *
 * @param dateString - Fecha en formato ISO
 * @returns Fecha formateada (ej: "15 de marzo de 2024")
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
 * Calcula el tiempo estimado de lectura
 *
 * @param text - Texto completo del post
 * @param wordsPerMinute - Palabras por minuto (default: 200)
 * @returns Tiempo de lectura en minutos
 */
export function calculateReadingTime(text: string, wordsPerMinute: number = 200): number {
  const cleanText = stripHtml(text)
  const words = cleanText.trim().split(/\s+/).length
  const minutes = Math.ceil(words / wordsPerMinute)
  return minutes
}

/**
 * Sanitiza contenido HTML de WordPress de forma selectiva
 * Solo elimina lo mínimo necesario para seguridad y limpieza de Code Block Pro
 *
 * @param html - HTML de WordPress
 * @returns HTML sanitizado
 */
export function sanitizeContent(html: string): string {
  return html
    // Eliminar scripts (seguridad)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Eliminar event handlers inline (seguridad)
    .replace(/\son\w+="[^"]*"/g, '')
    .replace(/\son\w+='[^']*'/g, '')
}

/**
 * Minifica HTML eliminando espacios en blanco innecesarios
 * Preserva espacios dentro de tags <pre>, <code>, <textarea> y <script>
 *
 * @param html - HTML a minificar
 * @returns HTML minificado
 */
export function minifyHtml(html: string): string {
  // Extraer y proteger contenido de tags que necesitan espacios
  const protectedTags: { placeholder: string; content: string }[] = []
  let counter = 0

  // Proteger <pre>, <code>, <textarea>, <script>
  html = html.replace(/<(pre|code|textarea|script)[^>]*>[\s\S]*?<\/\1>/gi, (match) => {
    const placeholder = `___PROTECTED_${counter}___`
    protectedTags.push({ placeholder, content: match })
    counter++
    return placeholder
  })

  // Minificar el resto del HTML
  let minified = html
    // Eliminar comentarios HTML (excepto condicionales de IE)
    .replace(/<!--(?!\[if\s)[\s\S]*?-->/g, '')
    // Eliminar espacios entre tags
    .replace(/>\s+</g, '><')
    // Eliminar espacios al inicio y final de líneas
    .replace(/^\s+/gm, '')
    .replace(/\s+$/gm, '')
    // Colapsar múltiples espacios en uno solo
    .replace(/\s{2,}/g, ' ')
    // Eliminar espacios alrededor de = en atributos
    .replace(/\s*=\s*/g, '=')
    // Eliminar líneas vacías
    .replace(/\n\s*\n/g, '\n')
    .trim()

  // Restaurar contenido protegido
  protectedTags.forEach(({ placeholder, content }) => {
    minified = minified.replace(placeholder, content)
  })

  return minified
}

/**
 * Procesa contenido de WordPress para limpieza específica de Code Block Pro
 * Elimina solo los estilos inline de code blocks, manteniendo todo lo demás intacto
 *
 * @param html - HTML de WordPress
 * @returns HTML procesado
 */
export function processWordPressContent(html: string): string {
  let processed = sanitizeContent(html)

  // Proteger code blocks antes de limpiar estilos
  const protectedCodeBlocks: { placeholder: string; content: string }[] = []
  let codeBlockCounter = 0

  // Solo para code blocks: limpiar y reorganizar estructura
  processed = processed.replace(
    /<div([^>]*)class="wp-block-kevinbatdorf-code-block-pro"([^>]*)>([\s\S]*?)<\/div>/g,
    (match, before, after, content) => {
      // Eliminar style attributes del div principal solamente
      const cleaned = (before + after)
        .replace(/\s*style="[^"]*"/gi, '')
        .replace(/\s*data-code-block-pro-font-family="[^"]*"/gi, '')

      // Extraer el título personalizado si existe (está en un span con border-bottom)
      let customTitle = ''
      const titleMatch = content.match(/<span[^>]*style="[^"]*border-bottom[^"]*"[^>]*>([^<]+)<\/span>/)
      if (titleMatch && titleMatch[1]) {
        customTitle = titleMatch[1].trim()
          .replace(/&#8220;/g, '"') // Decodificar entidades comunes
          .replace(/&#8221;/g, '"')
          .replace(/&#8211;/g, '–')
          .replace(/&#8212;/g, '—')
          .replace(/&#\d+;/g, '') // Limpiar otras entidades si las hay
      }

      // Si hay título personalizado, usarlo. Si no, detectar el lenguaje
      let language = customTitle || 'Code'

      if (!customTitle) {
        // Solo detectar lenguaje si no hay título personalizado
        const fontMatch = match.match(/data-code-block-pro-font-family="[^"]*"/i)
        if (fontMatch) {
          language = fontMatch[0].replace(/data-code-block-pro-font-family="|"/g, '')
            .replace('Code-Pro-', '')
            .replace(/-/g, ' ')
        }

        // Detectar del contenido
        if (content.includes('git ')) language = 'Bash'
        else if (content.includes('npm ') || content.includes('pnpm ')) language = 'Shell'
        else if (content.includes('function') || content.includes('const ')) language = 'JavaScript'
        else if (content.includes('interface') || content.includes('type ')) language = 'TypeScript'
        else if (content.includes('<?php')) language = 'PHP'
        else if (content.includes('def ') || content.includes('import ')) language = 'Python'
      }

      // Extraer el código del textarea para el atributo data-code
      const textareaMatch = content.match(/<textarea[^>]*>([\s\S]*?)<\/textarea>/i)
      let codeForCopy = textareaMatch ? textareaMatch[1] : ''

      // Eliminar completamente el span con textarea y SVG decorativo
      let cleanContent = content
        // Eliminar el SVG decorativo (los círculos de mac)
        .replace(/<span[^>]*><svg[^>]*>[\s\S]*?<\/svg><\/span>/i, '')
        // Eliminar el span del botón con textarea y SVG
        .replace(/<span[^>]*role="button"[^>]*>[\s\S]*?<\/span>/i, '')

      // Extraer el código (pre + code) y ELIMINAR estilos inline de Shiki
      const codeMatch = cleanContent.match(/<pre[\s\S]*?<\/pre>/i)
      let codeBlock = codeMatch ? codeMatch[0] : ''

      // Eliminar todos los atributos style de los spans dentro del código
      // Esto permite que nuestro CSS personalizado maneje los colores
      codeBlock = codeBlock.replace(/<span\s+style="[^"]*"/gi, '<span')

      // Si no hay textarea, extraer el código del bloque <code> para copiar
      if (!codeForCopy && codeBlock) {
        const codeContentMatch = codeBlock.match(/<code[^>]*>([\s\S]*?)<\/code>/i)
        if (codeContentMatch) {
          // Extraer el texto sin tags HTML pero preservando saltos de línea
          codeForCopy = codeContentMatch[1]
            .replace(/<span[^>]*>/g, '') // Eliminar tags de apertura span
            .replace(/<\/span>/g, '') // Eliminar tags de cierre span
            .replace(/<[^>]+>/g, '') // Eliminar cualquier otro tag
            .replace(/&lt;/g, '<') // Decodificar entities
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&#91;/g, '[')
            .replace(/&#93;/g, ']')
        }
      }

      // Crear el botón de copiar simplificado con data-code
      const copyButton = codeForCopy
        ? `<span role="button" aria-label="Copy" data-code="${codeForCopy.replace(/"/g, '&quot;')}"><svg xmlns="http://www.w3.org/2000/svg" style="width:24px;height:24px" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path class="with-check" stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path><path class="without-check" stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg></span>`
        : ''

      // Crear header con lenguaje y botón
      const header = copyButton
        ? `<div class="code-block-header"><span class="code-language">${language}</span>${copyButton}</div>`
        : `<div class="code-block-header"><span class="code-language">${language}</span></div>`

      const finalBlock = `<div class="wp-block-code-block-pro"${cleaned}>${header}${codeBlock}</div>`

      // Proteger este bloque de limpieza posterior
      const placeholder = `___CODE_BLOCK_${codeBlockCounter}___`
      protectedCodeBlocks.push({ placeholder, content: finalBlock })
      codeBlockCounter++

      return placeholder
    }
  )

  // Eliminar estilos inline del resto del contenido (NO de los code blocks)
  processed = processed.replace(/\s*style="[^"]*"/gi, '')

  // Eliminar atributos color inline
  processed = processed.replace(/\s*color="[^"]*"/gi, '')

  // Restaurar code blocks con sus estilos intactos
  protectedCodeBlocks.forEach(({ placeholder, content }) => {
    processed = processed.replace(placeholder, content)
  })

  // Minificar HTML para reducir tamaño
  processed = minifyHtml(processed)

  return processed
}
