import { ArrowLeft, CircleCheck, CircleX, PackageX, TriangleAlert } from 'lucide'
import whatsappSvg from 'simple-icons/icons/whatsapp.svg?raw'
import { renderHeader, bindHeaderEvents } from '../components/header.js'
import { renderFooter } from '../components/footer.js'
import { getProductBySlug } from '../lib/products.js'
import { getProductImageUrl } from '../lib/images.js'
import { formatPrice } from '../lib/format.js'
import { escapeHtml } from '../lib/dom.js'
import { buildWhatsAppUrl, isWhatsAppConfigured } from '../lib/whatsapp.js'
import { link } from '../router/router.js'
import { icon } from '../lib/icons.js'
import { brandIcon } from '../lib/brand-icons.js'

function renderBackLink() {
  return `
    <a href="${link('/productos')}" data-link class="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white">
      ${icon(ArrowLeft, { class: 'h-4 w-4' })}
      Volver a productos
    </a>
  `
}

function renderProduct(product) {
  const imageUrl = getProductImageUrl(product.image_path)
  const disponible = product.stock > 0
  const name = escapeHtml(product.name)
  const description = escapeHtml(product.description)
  const category = product.category ? escapeHtml(product.category.name) : null
  const puedeComprar = disponible && isWhatsAppConfigured()
  const productUrl = `${location.origin}${link(`/productos/${encodeURIComponent(product.slug)}`)}`

  return `
    ${renderBackLink()}

    <div class="mt-6 grid gap-8 sm:grid-cols-2 sm:gap-12">
      <div class="aspect-square overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800">
        ${
          imageUrl
            ? `<img src="${imageUrl}" alt="${name}" class="h-full w-full object-cover" />`
            : ''
        }
      </div>

      <div>
        ${category ? `<p class="text-sm font-medium uppercase tracking-widest text-neutral-500 dark:text-neutral-400">${category}</p>` : ''}
        <h1 class="mt-2 text-3xl font-semibold tracking-tight">${name}</h1>
        <p class="mt-4 text-2xl font-semibold">${formatPrice(product.price)}</p>

        <p class="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm ${disponible ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-500' : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'}">
          ${icon(disponible ? CircleCheck : CircleX, { class: 'h-4 w-4' })}
          ${disponible ? 'Disponible' : 'Agotado'}
        </p>

        ${description ? `<p class="mt-6 leading-relaxed text-neutral-600 dark:text-neutral-300">${description}</p>` : ''}

        ${
          puedeComprar
            ? `<a
                href="${buildWhatsAppUrl(product, productUrl)}"
                target="_blank"
                rel="noopener"
                class="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-500 sm:w-auto"
              >
                ${brandIcon(whatsappSvg, 'h-5 w-5')}
                Comprar por WhatsApp
              </a>`
            : ''
        }
      </div>
    </div>
  `
}

function renderNotFound() {
  return `
    <div class="flex flex-col items-center py-16 text-center">
      <div class="inline-flex rounded-full bg-neutral-100 p-3 dark:bg-neutral-800">
        ${icon(PackageX, { class: 'h-6 w-6 text-neutral-400 dark:text-neutral-500' })}
      </div>
      <h1 class="mt-4 text-xl font-semibold">Producto no encontrado</h1>
      <a
        href="${link('/productos')}"
        data-link
        class="mt-6 inline-block rounded-lg bg-neutral-900 px-6 py-3 font-medium text-white hover:opacity-90 dark:bg-white dark:text-neutral-900"
      >
        Volver a productos
      </a>
    </div>
  `
}

function renderError() {
  return `
    <div class="flex flex-col items-center py-16 text-center">
      <div class="inline-flex rounded-full bg-neutral-100 p-3 dark:bg-neutral-800">
        ${icon(TriangleAlert, { class: 'h-6 w-6 text-neutral-400 dark:text-neutral-500' })}
      </div>
      <p class="mt-4 text-neutral-500 dark:text-neutral-400">No se pudo cargar el producto. Intenta de nuevo más tarde.</p>
    </div>
  `
}

function renderSkeleton() {
  return `
    <div class="animate-pulse">
      <div class="h-4 w-32 rounded bg-neutral-100 dark:bg-neutral-800"></div>
      <div class="mt-6 grid gap-8 sm:grid-cols-2 sm:gap-12">
        <div class="aspect-square rounded-2xl bg-neutral-100 dark:bg-neutral-800"></div>
        <div class="space-y-4">
          <div class="h-4 w-24 rounded bg-neutral-100 dark:bg-neutral-800"></div>
          <div class="h-8 w-3/4 rounded bg-neutral-100 dark:bg-neutral-800"></div>
          <div class="h-6 w-32 rounded bg-neutral-100 dark:bg-neutral-800"></div>
          <div class="h-24 rounded bg-neutral-100 dark:bg-neutral-800"></div>
        </div>
      </div>
    </div>
  `
}

export async function productoDetallePage({ params, mount }) {
  mount.innerHTML = `
    ${renderHeader()}

    <main>
      <section class="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16" id="producto">
        ${renderSkeleton()}
      </section>
    </main>

    ${renderFooter()}
  `

  bindHeaderEvents(mount)

  const contenedor = mount.querySelector('#producto')

  try {
    const product = await getProductBySlug(params.slug)
    contenedor.innerHTML = product ? renderProduct(product) : renderNotFound()
  } catch (error) {
    console.error(error)
    contenedor.innerHTML = renderError()
  }
}
