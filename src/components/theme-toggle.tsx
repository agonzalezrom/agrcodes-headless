"use client"

import {useEffect, useState, useRef} from "react"

type Theme = "light" | "dark"

function getInitialTheme(): Theme {
    if (typeof window === "undefined") return "light"
    const saved = localStorage.getItem("theme") as Theme | null
    if (saved === "light" || saved === "dark") return saved
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export function ThemeToggle() {
    const [theme, setTheme] = useState<Theme>(() => getInitialTheme())
    const buttonRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark")
        localStorage.setItem("theme", theme)
    }, [theme])

    const toggleTheme = () => {
        const next: Theme = theme === "light" ? "dark" : "light"

        if (typeof document.startViewTransition !== "function") {
            setTheme(next)
            return
        }

        const btn = buttonRef.current
        let x = window.innerWidth / 2
        let y = 24
        if (btn) {
            const rect = btn.getBoundingClientRect()
            x = rect.left + rect.width / 2
            y = rect.top + rect.height / 2
        }
        const endRadius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y),
        )

        const transition = document.startViewTransition(() => {
            document.documentElement.classList.toggle("dark", next === "dark")
            setTheme(next)
        })

        transition.ready.then(() => {
            const clipFrom = `circle(0 at ${x}px ${y}px)`
            const clipTo = `circle(${endRadius}px at ${x}px ${y}px)`
            document.documentElement.animate(
                {clipPath: next === "dark" ? [clipFrom, clipTo] : [clipTo, clipFrom]},
                {
                    duration: 450,
                    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
                    pseudoElement: next === "dark" ? "::view-transition-new(root)" : "::view-transition-old(root)",
                },
            )
        })
    }

    return (
        <button
            ref={buttonRef}
            onClick={toggleTheme}
            aria-label={`Cambiar a tema ${theme === "light" ? "oscuro" : "claro"}`}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
        >
            {theme === "light" ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                </svg>
            ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
            )}
        </button>
    )
}
