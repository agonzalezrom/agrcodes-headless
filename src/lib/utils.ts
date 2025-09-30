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

  // Solo para code blocks: limpiar y reorganizar estructura
  processed = processed.replace(
    /<div([^>]*)class="wp-block-kevinbatdorf-code-block-pro"([^>]*)>([\s\S]*?)<\/div>/g,
    (match, before, after, content) => {
      // Eliminar style attributes del div
      const cleaned = (before + after)
        .replace(/\s*style="[^"]*"/gi, '')
        .replace(/\s*data-code-block-pro-font-family="[^"]*"/gi, '')

      // Detectar el lenguaje del código
      let language = 'Code'
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

      // Extraer el botón de copiar si existe (cualquier orden de atributos)
      const buttonMatch = content.match(/<span[^>]*role="button"[^>]*>[\s\S]*?<\/span>/i)
      const copyButton = buttonMatch ? buttonMatch[0] : ''

      // Extraer el código (pre + code)
      const codeMatch = content.match(/<pre[\s\S]*?<\/pre>/i)
      const codeBlock = codeMatch ? codeMatch[0] : ''

      // Si encontramos botón, crear header con lenguaje y botón
      // Si no hay botón, solo crear header con lenguaje
      const header = copyButton
        ? `<div class="code-block-header"><span class="code-language">${language}</span>${copyButton}</div>`
        : `<div class="code-block-header"><span class="code-language">${language}</span></div>`

      return `<div class="wp-block-code-block-pro"${cleaned}>${header}${codeBlock}</div>`
    }
  )

  // Eliminar TODOS los estilos inline
  processed = processed.replace(/\s*style="[^"]*"/gi, '')

  // Eliminar atributos color inline
  processed = processed.replace(/\s*color="[^"]*"/gi, '')

  // Minificar HTML para reducir tamaño
  processed = minifyHtml(processed)

  return processed
}
