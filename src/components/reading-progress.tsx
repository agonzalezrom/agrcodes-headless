'use client'

import {useEffect, useRef} from 'react'

export function ReadingProgress() {
    const barRef = useRef<HTMLDivElement>(null)
    const rafRef = useRef<number | null>(null)

    useEffect(() => {
        const update = () => {
            rafRef.current = null
            const el = barRef.current
            if (!el) return
            const scrollTop = window.scrollY
            const docHeight = document.documentElement.scrollHeight - window.innerHeight
            const progress = docHeight > 0 ? Math.min(1, Math.max(0, scrollTop / docHeight)) : 0
            el.style.transform = `scaleX(${progress})`
        }

        const handleScroll = () => {
            if (rafRef.current !== null) return
            rafRef.current = requestAnimationFrame(update)
        }

        update()
        window.addEventListener('scroll', handleScroll, {passive: true})
        window.addEventListener('resize', handleScroll)

        return () => {
            window.removeEventListener('scroll', handleScroll)
            window.removeEventListener('resize', handleScroll)
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
        }
    }, [])

    return (
        <div
            aria-hidden="true"
            className="fixed top-0 left-0 right-0 h-[2px] bg-foreground origin-left z-50 pointer-events-none"
            style={{transform: 'scaleX(0)', transition: 'transform 75ms linear'}}
            ref={barRef}
        />
    )
}
