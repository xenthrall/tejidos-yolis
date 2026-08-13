import { renderHeader } from '../components/header.js'
import { renderFooter } from '../components/footer.js'
import { getProductBySlug } from '../lib/products.js'
import { getProductImageUrl } from '../lib/images.js'
import { formatPrice } from '../lib/format.js'
import { escapeHtml } from '../lib/dom.js'
import { buildWhatsAppUrl, isWhatsAppConfigured } from '../lib/whatsapp.js'
import { link } from '../router/router.js'

function renderProduct(product) {
  const imageUrl = getProductImageUrl(product.image_path)
  const disponible = product.stock > 0
  const name = escapeHtml(product.name)
  const description = escapeHtml(product.description)
  const category = product.category ? escapeHtml(product.category.name) : null
  const puedeComprar = disponible && isWhatsAppConfigured()
  const productUrl = `${location.origin}${link(`/productos/${encodeURIComponent(product.slug)}`)}`

  return `
    <a href="${link('/productos')}" data-link class="text-sm hover:underline">← Volver a productos</a>

    <div class="mt-6 grid gap-10 sm:grid-cols-2">
      <div class="aspect-square overflow-hidden rounded-lg bg-gray-100">
        ${
          imageUrl
            ? `<img src="${imageUrl}" alt="${name}" class="h-full w-full object-cover" />`
            : ''
        }
      </div>

      <div>
        ${category ? `<p class="text-sm uppercase tracking-widest">${category}</p>` : ''}
        <h1 class="mt-2 text-3xl font-semibold">${name}</h1>
        <p class="mt-4 text-2xl">${formatPrice(product.price)}</p>
        <p class="mt-2 text-sm ${disponible ? 'text-green-700' : 'text-gray-400'}">
          ${disponible ? 'Disponible' : 'Agotado'}
        </p>
        ${description ? `<p class="mt-6">${description}</p>` : ''}
        ${
          puedeComprar
            ? `<a
                href="${buildWhatsAppUrl(product, productUrl)}"
                target="_blank"
                rel="noopener"
                class="mt-8 inline-block rounded-lg bg-green-600 px-6 py-3 text-white hover:opacity-80"
              >
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
    <div class="text-center">
      <h1 class="text-2xl font-semibold">Producto no encontrado</h1>
      <a href="${link('/productos')}" data-link class="mt-4 inline-block hover:underline">Volver a productos</a>
    </div>
  `
}

export async function productoDetallePage({ params, mount }) {
  mount.innerHTML = `
    ${renderHeader()}

    <main>
      <section class="mx-auto max-w-7xl px-6 py-16" id="producto">
        <p>Cargando producto…</p>
      </section>
    </main>

    ${renderFooter()}
  `

  const contenedor = mount.querySelector('#producto')

  try {
    const product = await getProductBySlug(params.slug)
    contenedor.innerHTML = product ? renderProduct(product) : renderNotFound()
  } catch (error) {
    console.error(error)
    contenedor.innerHTML = '<p>No se pudo cargar el producto. Intenta de nuevo más tarde.</p>'
  }
}
