'use client'

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'

interface ReCaptchaProviderClientProps {
  children: React.ReactNode
  reCaptchaKey: string
}

export function ReCaptchaProviderClient({ children, reCaptchaKey }: ReCaptchaProviderClientProps) {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={reCaptchaKey}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: 'head',
      }}
    >
      {children}
    </GoogleReCaptchaProvider>
  )
}