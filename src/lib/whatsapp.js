import { formatPrice } from './format.js'

const whatsappNumber = (import.meta.env.VITE_WHATSAPP_NUMBER ?? '').replace(/\D/g, '')

export function isWhatsAppConfigured() {
  return Boolean(whatsappNumber)
}

export function buildWhatsAppUrl(product, productUrl) {
  const message = [`Hola, quiero comprar *${product.name}*`, formatPrice(product.price), productUrl].join('\n')

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
}
