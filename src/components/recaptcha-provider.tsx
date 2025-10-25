import { ReCaptchaProviderClient } from './recaptcha-provider-client'

export async function ReCaptchaProvider({ children }: { children: React.ReactNode }) {
  const recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

  if (!recaptchaKey) {
    console.warn('ReCAPTCHA site key not found. ReCAPTCHA protection disabled.')
    return <>{children}</>
  }

  return (
    <ReCaptchaProviderClient reCaptchaKey={recaptchaKey}>
      {children}
    </ReCaptchaProviderClient>
  )
}
