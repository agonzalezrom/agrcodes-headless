'use client'

import { useEffect } from 'react'

/**
 * Code Block Copy Handler
 *
 * Agrega funcionalidad de copiar al portapapeles para los botones
 * de Code Block Pro que vienen de WordPress
 */
export function CodeBlock() {
  useEffect(() => {
    const handleCopy = async (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const button = target.closest('[role="button"][aria-label="Copy"]') as HTMLElement

      if (!button) return

      // Obtener el código del atributo data-code
      const code = button.getAttribute('data-code')

      if (!code) {
        console.warn('No data-code attribute found on copy button')
        return
      }

      try {
        // Copiar al clipboard
        await navigator.clipboard.writeText(code)

        // Feedback visual: cambiar texto temporalmente
        const originalHTML = button.innerHTML
        button.classList.add('copied')

        // Restaurar después de 2 segundos
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
    }
  }, [])

  return null
}