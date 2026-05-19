import Image from 'next/image'
import {hashToUnit} from '@/lib/utils'
import {cn} from '@/lib/utils'

interface CoverProps {
    src?: string
    alt?: string
    slug: string
    title: string
    priority?: boolean
    sizes?: string
    className?: string
    fill?: boolean
    width?: number
    height?: number
}

/**
 * Cover de un post. Si hay featured image la renderiza; si no, genera un mesh gradient
 * determinístico basado en el slug + overlay sutil del título.
 */
export function Cover({
    src,
    alt,
    slug,
    title,
    priority,
    sizes,
    className,
    fill = true,
    width,
    height,
}: CoverProps) {
    if (src) {
        if (fill) {
            return (
                <Image
                    src={src}
                    alt={alt || title}
                    fill
                    sizes={sizes || '(max-width: 768px) 100vw, 50vw'}
                    priority={priority}
                    className={cn('object-cover', className)}
                />
            )
        }
        return (
            <Image
                src={src}
                alt={alt || title}
                width={width || 1200}
                height={height || 630}
                sizes={sizes}
                priority={priority}
                className={cn('object-cover w-full h-full', className)}
            />
        )
    }

    return <CoverFallback slug={slug} title={title} className={className}/>
}

interface CoverFallbackProps {
    slug: string
    title: string
    className?: string
}

export function CoverFallback({slug, title, className}: CoverFallbackProps) {
    const h1 = hashToUnit(slug)
    const h2 = hashToUnit(slug + 'b')
    const h3 = hashToUnit(slug + 'c')
    const h4 = hashToUnit(slug + 'd')

    const hue1 = Math.floor(h1 * 360)
    const hue2 = Math.floor(h2 * 360)
    const hue3 = Math.floor(h3 * 360)
    const hue4 = Math.floor(h4 * 360)

    const style = {
        backgroundColor: `hsl(${hue1} 25% 92%)`,
        backgroundImage: `
            radial-gradient(circle at 0% 0%, hsl(${hue1} 65% 80% / 0.6), transparent 50%),
            radial-gradient(circle at 100% 0%, hsl(${hue2} 65% 80% / 0.55), transparent 55%),
            radial-gradient(circle at 100% 100%, hsl(${hue3} 65% 78% / 0.5), transparent 50%),
            radial-gradient(circle at 0% 100%, hsl(${hue4} 65% 80% / 0.6), transparent 55%)
        `,
    } as React.CSSProperties

    return (
        <div
            aria-hidden="true"
            className={cn(
                'absolute inset-0 flex items-end p-5',
                'dark:opacity-60',
                className,
            )}
            style={style}
        >
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-foreground/40 dark:text-foreground/60">
                {slug}
            </span>
            <span className="sr-only">{title}</span>
        </div>
    )
}
