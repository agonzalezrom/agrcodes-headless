'use client'

import {useState} from 'react'
import {useGoogleReCaptcha} from 'react-google-recaptcha-v3'

export function NewsletterForm() {
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')
    const {executeRecaptcha} = useGoogleReCaptcha()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus('loading')

        try {
            // Verificar ReCAPTCHA primero
            if (!executeRecaptcha) {
                throw new Error('ReCAPTCHA not available')
            }

            const token = await executeRecaptcha('newsletter_subscribe')

            // Validar el token con nuestro API route
            const verifyResponse = await fetch('/api/verify-recaptcha', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({token, action: 'newsletter_subscribe'}),
            })

            const verifyData = await verifyResponse.json()

            if (!verifyData.success) {
                throw new Error(`ReCAPTCHA verification failed: ${verifyData.error}`)
            }

            // WordPress REST API endpoint para suscripciones
            // Nota: Requiere un plugin de newsletter en WordPress como Newsletter, Mailchimp for WordPress, etc.
            const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || ''
            const NEWSLETTER_CLIENT_KEY = process.env.NEXT_PUBLIC_NEWSLETTER_CLIENT_KEY || ''
            const NEWSLETTER_SECRET_KEY = process.env.NEXT_PUBLIC_NEWSLETTER_SECRET_KEY || ''

            const response = await fetch(`${WORDPRESS_URL}/wp-json/newsletter/v2/subscribers?client_key=${NEWSLETTER_CLIENT_KEY}&client_secret=${NEWSLETTER_SECRET_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({email}),
            })

            if (response.ok) {
                setStatus('success')
                setMessage('¡Gracias por suscribirte! Revisa tu bandeja de entrada.')
                setEmail('')
            } else {
                throw new Error('Subscription failed')
            }
        } catch (error) {
            setStatus('error')
            setMessage('Algo salió mal. Por favor intenta de nuevo.')
            console.error('Newsletter subscription error:', error)
        }

        // Reset status after 5 seconds
        setTimeout(() => {
            setStatus('idle')
            setMessage('')
        }, 5000)
    }

    return (
        <div className="max-w-md mx-auto mb-12">
            <h3 className="text-lg font-semibold mb-2 text-center">Suscríbete al newsletter</h3>
            <p className="text-sm text-muted-foreground mb-6 text-center">
                Recibe los últimos posts directamente en tu bandeja de entrada
            </p>

            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                    required
                    disabled={status === 'loading'}
                />
                <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="px-6 py-2 rounded-lg bg-foreground text-background font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {status === 'loading' ? 'Enviando...' : 'Suscribir'}
                </button>
            </form>

            {/* Feedback message */}
            {message && (
                <p
                    className={`mt-3 text-sm text-center ${
                        status === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}
                >
                    {message}
                </p>
            )}
        </div>
    )
}

/**
 * Configuración requerida en WordPress:
 *
 * 1. Instalar un plugin de newsletter (opciones recomendadas):
 *    - Newsletter (gratuito): https://wordpress.org/plugins/newsletter/
 *    - Mailchimp for WordPress: https://wordpress.org/plugins/mailchimp-for-wp/
 *    - Newsletter Glue: https://wordpress.org/plugins/newsletter-glue/
 *
 * 2. El plugin debe exponer un endpoint REST API como:
 *    POST /wp-json/newsletter/v1/subscribe
 *    Body: { "email": "user@example.com" }
 *
 * 3. Si usas un plugin diferente, ajusta la URL del endpoint en esta línea:
 *    `${WORDPRESS_URL}/wp-json/newsletter/v1/subscribe`
 *
 * Alternativa: Usar un servicio externo como:
 * - Mailchimp API
 * - ConvertKit API
 * - Buttondown API
 * - Substack API
 */