'use client'

import { useEffect } from 'react'

/**
 * Code Block Handler
 *
 * Extrae títulos de bloques de código de WordPress Code Block Pro
 * y agrega funcionalidad de copiar al portapapeles
 */
export function CodeBlock() {
  useEffect(() => {
    // Procesar bloques de código para extraer títulos
    const processCodeBlocks = () => {
      const codeBlocks = document.querySelectorAll('[class*="wp-block-kevinbatdorf-code-block-pro"], [class*="wp-block-code-block-pro"]')

      codeBlocks.forEach((block) => {
        // Buscar el span que tiene display:flex y contiene el título
        const titleContainer = block.querySelector('span[style*="display:flex"]') as HTMLElement
        let titleText = ''

        if (titleContainer) {
          // El título está dentro de un span dentro del titleContainer
          const titleSpan = titleContainer.querySelector('span[style*="border-bottom"]') as HTMLElement

          if (titleSpan && titleSpan.textContent) {
            titleText = titleSpan.textContent.trim()
          }

          // Remover el titleContainer de WordPress (la barra visual con el título)
          titleContainer.remove()
        }

        // Si encontramos un título personalizado, crear el header estilizado
        if (titleText) {
          // Decodificar entidades HTML
          titleText = decodeHTMLEntities(titleText)

          const header = document.createElement('div')
          header.className = 'code-block-header'
          header.innerHTML = `<span class="code-language">${escapeHtml(titleText)}</span>`

          // Insertar el header al inicio del bloque
          block.insertBefore(header, block.firstChild)
        }
        // Si no hay título personalizado, dejar vacío (sin header)
      })
    }

    // Función para decodificar entidades HTML
    const decodeHTMLEntities = (text: string): string => {
      const textarea = document.createElement('textarea')
      textarea.innerHTML = text
      return textarea.value
    }

    // Función para escapar caracteres especiales
    const escapeHtml = (text: string): string => {
      const div = document.createElement('div')
      div.textContent = text
      return div.innerHTML
    }

    // Procesar bloques de código
    processCodeBlocks()

    // Procesar bloques de código nuevos si se cargan dinámicamente
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          processCodeBlocks()
        }
      })
    })

    // Observar cambios en el DOM
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    // Handle copy button clicks
    const handleCopy = async (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const button = target.closest('[role="button"][aria-label="Copy"]') as HTMLElement

      if (!button) return

      const code = button.getAttribute('data-code')

      if (!code) {
        console.warn('No data-code attribute found on copy button')
        return
      }

      try {
        await navigator.clipboard.writeText(code)
        button.classList.add('copied')

        setTimeout(() => {
          button.classList.remove('copied')
        }, 2000)
      } catch (err) {
        console.error('Failed to copy code:', err)
      }
    }

    // Agregar event listener
    document.addEventListener('click', handleCopy)

    // Cleanup
    return () => {
      document.removeEventListener('click', handleCopy)
      observer.disconnect()
    }
  }, [])

  return null
}