import { useEffect } from 'react'

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

export function GoogleAnalytics() {
  useEffect(() => {
    if (!MEASUREMENT_ID) {
      return
    }

    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`
    document.head.appendChild(script)

    window.dataLayer = window.dataLayer || []
    window.gtag = (...args: unknown[]) => {
      window.dataLayer.push(args)
    }

    window.gtag('js', new Date())
    window.gtag('config', MEASUREMENT_ID, { send_page_view: true })

    return () => {
      script.remove()
    }
  }, [])

  return null
}
