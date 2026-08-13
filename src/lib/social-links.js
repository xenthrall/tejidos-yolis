const PLATFORM_BASE_URL = {
  instagram: 'https://instagram.com/',
  facebook: 'https://facebook.com/',
  tiktok: 'https://tiktok.com/@',
  x: 'https://x.com/',
}

// Accepts either a full URL or a bare handle (with or without a leading @)
// in site.config.js, so editing it doesn't require knowing each platform's
// URL format.
export function resolveSocialUrl(key, value) {
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value

  if (key === 'whatsapp') {
    const digits = value.replace(/\D/g, '')
    return digits ? `https://wa.me/${digits}` : ''
  }

  const base = PLATFORM_BASE_URL[key]
  if (!base) return ''

  return base + value.replace(/^@/, '').trim()
}
