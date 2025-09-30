import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { token, action } = await request.json()

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      )
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY

    if (!secretKey) {
      console.error('RECAPTCHA_SECRET_KEY not configured')
      return NextResponse.json(
        { success: false, error: 'ReCAPTCHA not configured' },
        { status: 500 }
      )
    }

    // Verificar el token con Google
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`

    const verifyResponse = await fetch(verifyUrl, {
      method: 'POST',
    })

    const verifyData = await verifyResponse.json()

    // ReCAPTCHA v3 retorna un score de 0.0 a 1.0
    // 1.0 es muy probablemente una interacción legítima
    // 0.0 es muy probablemente un bot
    if (verifyData.success) {
      // Verificar que el action coincida (opcional pero recomendado)
      if (action && verifyData.action !== action) {
        return NextResponse.json(
          {
            success: false,
            error: 'Action mismatch',
            score: verifyData.score
          },
          { status: 400 }
        )
      }

      // Score mínimo aceptable (ajustable según necesidades)
      // 0.5 es un buen punto medio
      // 0.7+ es más estricto
      // 0.3+ es más permisivo
      const minScore = 0.5

      if (verifyData.score >= minScore) {
        return NextResponse.json({
          success: true,
          score: verifyData.score,
        })
      } else {
        return NextResponse.json(
          {
            success: false,
            error: 'Low score',
            score: verifyData.score,
          },
          { status: 403 }
        )
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Verification failed',
          errorCodes: verifyData['error-codes'],
        },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('ReCAPTCHA verification error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
