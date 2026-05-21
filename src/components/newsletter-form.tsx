'use client'

import {useState} from 'react'
import {useGoogleReCaptcha} from 'react-google-recaptcha-v3'

interface NewsletterFormProps {
    variant?: 'card' | 'inline'
    heading?: string
    description?: string
}

export function NewsletterForm({
    variant = 'card',
    heading = 'Recibe los próximos posts en tu correo',
    description = 'Sin spam, solo cuando publico algo nuevo. Cancela cuando quieras.',
}: NewsletterFormProps) {
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')
    const {executeRecaptcha} = useGoogleReCaptcha()

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        setStatus('loading')

        try {
            if (!executeRecaptcha) throw new Error('ReCAPTCHA not available')

            const token = await executeRecaptcha('newsletter_subscribe')
            const verifyResponse = await fetch('/api/verify-recaptcha', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({token, action: 'newsletter_subscribe'}),
            })
            const verifyData = await verifyResponse.json()
            if (!verifyData.success) throw new Error(`ReCAPTCHA failed: ${verifyData.error}`)

            const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || ''
            const NEWSLETTER_CLIENT_KEY = process.env.NEXT_PUBLIC_NEWSLETTER_CLIENT_KEY || ''
            const NEWSLETTER_SECRET_KEY = process.env.NEXT_PUBLIC_NEWSLETTER_SECRET_KEY || ''

            const response = await fetch(
                `${WORDPRESS_URL}/wp-json/newsletter/v2/subscribers?client_key=${NEWSLETTER_CLIENT_KEY}&client_secret=${NEWSLETTER_SECRET_KEY}`,
                {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({email}),
                },
            )

            if (response.ok) {
                setStatus('success')
                setMessage('Listo. Revisa tu bandeja de entrada.')
                setEmail('')
            } else {
                throw new Error('Subscription failed')
            }
        } catch (error) {
            setStatus('error')
            setMessage('Algo salió mal. Intenta de nuevo.')
            console.error('Newsletter subscription error:', error)
        }

        setTimeout(() => {
            setStatus('idle')
            setMessage('')
        }, 5000)
    }

    const containerClass =
        variant === 'card'
            ? 'rounded-xl border border-border bg-card p-6 sm:p-8'
            : ''

    return (
        <div className={containerClass}>
            {heading && (
                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    Newsletter
                </p>
            )}
            {heading && (
                <h3 className="text-lg sm:text-xl font-semibold tracking-tight mb-2">{heading}</h3>
            )}
            {description && (
                <p className="text-sm text-muted-foreground mb-5">{description}</p>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                <input
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 focus:border-transparent disabled:opacity-50"
                    required
                    disabled={status === 'loading'}
                />
                <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {status === 'loading' ? 'Enviando…' : 'Suscribirme'}
                </button>
            </form>

            {message && (
                <p
                    className={`mt-3 text-xs ${
                        status === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                    }`}
                >
                    {message}
                </p>
            )}

            <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground/70">
                Este sitio está protegido por reCAPTCHA y se aplican la{' '}
                <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-foreground transition-colors"
                >
                    Política de Privacidad
                </a>{' '}
                y los{' '}
                <a
                    href="https://policies.google.com/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-foreground transition-colors"
                >
                    Términos de Servicio
                </a>{' '}
                de Google.
            </p>
        </div>
    )
}
