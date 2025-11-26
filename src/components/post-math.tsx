'use client'

import {useEffect} from 'react'
import 'katex/dist/katex.min.css'

/**
 * Post Math Component
 *
 * Renderiza fórmulas matemáticas procesadas por el plugin "AGR Headless Math" de WordPress.
 * Busca elementos con clase `.agr-math` en el DOM y los renderiza usando KaTeX.
 *
 * Soporta:
 * - Fórmulas en bloque (displayMode: true) con clase `.agr-math-block`
 * - Fórmulas inline (displayMode: false) con clase `.agr-math-inline`
 *
 * Los elementos deben tener el atributo `data-formula` con la fórmula LaTeX.
 */
export function PostMath() {
  useEffect(() => {
    // Función para cargar KaTeX dinámicamente si no está disponible
    const loadKaTeX = async () => {
      // Si ya está disponible, no hacer nada
      if (typeof window !== 'undefined' && window.katex) {
        return true
      }

      // Intentar cargar KaTeX dinámicamente
      try {
        // @ts-ignore
        const katex = await import('katex')
        // @ts-ignore
        window.katex = katex
        return true
      } catch (error) {
        console.error('Error al cargar KaTeX dinámicamente:', error)
        return false
      }
    }

    const renderMathFormulas = async () => {
      // Asegurar que KaTeX esté disponible
      const katexLoaded = await loadKaTeX()
      if (!katexLoaded) {
        console.error('KaTeX no se pudo cargar')
        return
      }

      // Buscar todos los elementos con clase agr-math
      const mathElements = document.querySelectorAll('.agr-math[data-formula]')

      console.log(`Encontrados ${mathElements.length} elementos .agr-math`)

      mathElements.forEach((element, index) => {
        // Obtener la fórmula del atributo data-formula
        const formula = element.getAttribute('data-formula')

        // Ignorar si no hay fórmula o está vacía
        if (!formula || formula.trim() === '') {
          console.warn(`Elemento #${index}: .agr-math sin fórmula válida`, element)
          return
        }

        try {
          // Determinar si es modo bloque o inline
          const displayMode =
            element.classList.contains('agr-math-block') ||
            element.tagName === 'DIV'

          console.log(
            `Renderizando fórmula #${index}: displayMode=${displayMode}`
          )

          // Renderizar la fórmula con KaTeX
          // @ts-ignore
          window.katex.render(formula, element as HTMLElement, {
            displayMode: displayMode,
            throwOnError: false,
            strict: 'ignore',
          })
        } catch (error) {
          console.error(`Error al renderizar fórmula "${formula}":`, error)
          // Mostrar un mensaje de error discreto
          element.innerHTML = `<span style="color: #ef4444; font-size: 0.9em;">⚠️ Error renderizando</span>`
        }
      })
    }

    // Renderizar las fórmulas una sola vez cuando el componente se monta
    // Con un pequeño delay para asegurar que el DOM está listo
    const timeoutId = setTimeout(() => {
      renderMathFormulas()
    }, 100)

    // Cleanup
    return () => {
      clearTimeout(timeoutId)
    }
  }, [])

  // Este componente no renderiza nada visualmente, solo manipula el DOM
  return null
}

// Agregar la declaración de tipos para KaTeX en el objeto window
declare global {
  interface Window {
    katex?: {
      render: (
        expression: string,
        container: HTMLElement,
        options?: {
          displayMode?: boolean
          throwOnError?: boolean
          strict?: boolean | string
        }
      ) => void
    }
  }
}
