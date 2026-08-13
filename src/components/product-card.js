import { CircleCheck, CircleX } from 'lucide'
import { link } from '../router/router.js'
import { icon } from '../lib/icons.js'
import { getProductImageUrl } from '../lib/images.js'
import { formatPrice } from '../lib/format.js'
import { escapeHtml } from '../lib/dom.js'

export function renderProductCard(product) {
  const imageUrl = getProductImageUrl(product.image_path)
  const disponible = product.stock > 0
  const name = escapeHtml(product.name)
  const slug = encodeURIComponent(product.slug)

  return `
    <a
      href="${link(`/productos/${slug}`)}"
      data-link
      class="group overflow-hidden rounded-2xl border border-neutral-200 transition hover:border-neutral-300 hover:shadow-md dark:border-neutral-800 dark:hover:border-neutral-700"
    >
      <div class="aspect-square overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        ${
          imageUrl
            ? `<img src="${imageUrl}" alt="${name}" class="h-full w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" />`
            : ''
        }
      </div>
      <div class="p-4">
        <h3 class="truncate font-medium">${name}</h3>
        <p class="mt-1 text-lg font-semibold">${formatPrice(product.price)}</p>
        <p class="mt-2 flex items-center gap-1 text-sm ${disponible ? 'text-green-600 dark:text-green-500' : 'text-neutral-400 dark:text-neutral-500'}">
          ${icon(disponible ? CircleCheck : CircleX, { class: 'h-4 w-4' })}
          ${disponible ? 'Disponible' : 'Agotado'}
        </p>
      </div>
    </a>
  `
}

export function renderProductCardSkeleton() {
  return `
    <div class="animate-pulse overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800">
      <div class="aspect-square bg-neutral-100 dark:bg-neutral-800"></div>
      <div class="space-y-2 p-4">
        <div class="h-4 w-2/3 rounded bg-neutral-100 dark:bg-neutral-800"></div>
        <div class="h-4 w-1/3 rounded bg-neutral-100 dark:bg-neutral-800"></div>
      </div>
    </div>
  `
}
