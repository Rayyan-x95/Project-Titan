import { useEffect } from 'react'

type SeoMetaProps = {
  title: string
  description: string
  keywords?: string
  canonicalPath?: string
  ogImage?: string
  noIndex?: boolean
}

const SITE_URL = 'https://titanapp.qzz.io'

function ensureMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector(selector) as HTMLMetaElement | null

  if (!element) {
    element = document.createElement('meta')
    document.head.appendChild(element)
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element?.setAttribute(key, value)
  })
}

function ensureCanonical(href: string) {
  let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null

  if (!link) {
    link = document.createElement('link')
    link.rel = 'canonical'
    document.head.appendChild(link)
  }

  link.href = href
}

export function SeoMeta({
  title,
  description,
  keywords,
  canonicalPath = '/',
  ogImage = '/Opengraph.png',
  noIndex = false,
}: SeoMetaProps) {
  useEffect(() => {
    const canonicalUrl = `${SITE_URL}${canonicalPath}`

    document.title = title
    ensureCanonical(canonicalUrl)

    ensureMeta('meta[name="description"]', {
      name: 'description',
      content: description,
    })

    if (keywords) {
      ensureMeta('meta[name="keywords"]', {
        name: 'keywords',
        content: keywords,
      })
    }

    ensureMeta('meta[property="og:title"]', {
      property: 'og:title',
      content: title,
    })
    ensureMeta('meta[property="og:description"]', {
      property: 'og:description',
      content: description,
    })
    ensureMeta('meta[property="og:url"]', {
      property: 'og:url',
      content: canonicalUrl,
    })
    ensureMeta('meta[property="og:image"]', {
      property: 'og:image',
      content: ogImage,
    })

    ensureMeta('meta[name="twitter:title"]', {
      name: 'twitter:title',
      content: title,
    })
    ensureMeta('meta[name="twitter:description"]', {
      name: 'twitter:description',
      content: description,
    })
    ensureMeta('meta[name="twitter:image"]', {
      name: 'twitter:image',
      content: ogImage,
    })

    if (noIndex) {
      ensureMeta('meta[name="robots"]', {
        name: 'robots',
        content: 'noindex, nofollow',
      })
      return
    }

    ensureMeta('meta[name="robots"]', {
      name: 'robots',
      content: 'index, follow, max-image-preview:large',
    })
  }, [title, description, keywords, canonicalPath, ogImage, noIndex])

  return null
}
