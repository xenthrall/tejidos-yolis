import { renderHeader } from '../components/header.js'
import { renderFooter } from '../components/footer.js'
import { getPublishedProducts } from '../lib/products.js'
import { getProductImageUrl } from '../lib/images.js'
import { formatPrice } from '../lib/format.js'
import { escapeHtml } from '../lib/dom.js'
import { link } from '../router/router.js'

function renderProductCard(product) {
  const imageUrl = getProductImageUrl(product.image_path)
  const disponible = product.stock > 0
  const name = escapeHtml(product.name)
  const slug = encodeURIComponent(product.slug)

  return `
    <a href="${link(`/productos/${slug}`)}" data-link class="rounded-xl border p-6 hover:opacity-80">
      <div class="mb-4 aspect-square overflow-hidden rounded-lg bg-gray-100">
        ${
          imageUrl
            ? `<img src="${imageUrl}" alt="${name}" class="h-full w-full object-cover" loading="lazy" />`
            : ''
        }
      </div>
      <h3 class="font-medium">${name}</h3>
      <p class="mt-2">${formatPrice(product.price)}</p>
      <p class="mt-1 text-sm ${disponible ? 'text-green-700' : 'text-gray-400'}">
        ${disponible ? 'Disponible' : 'Agotado'}
      </p>
    </a>
  `
}

export async function productosPage({ mount }) {
  mount.innerHTML = `
    ${renderHeader()}

    <main>
      <section class="mx-auto max-w-7xl px-6 py-16">
        <div class="mb-8">
          <h1 class="text-2xl font-semibold">Productos</h1>
        </div>

        <div id="catalogo">
          <p>Cargando productos…</p>
        </div>
      </section>
    </main>

    ${renderFooter()}
  `

  const catalogo = mount.querySelector('#catalogo')

  try {
    const products = await getPublishedProducts()

    if (products.length === 0) {
      catalogo.innerHTML = '<p>Todavía no hay productos publicados.</p>'
      return
    }

    catalogo.innerHTML = `
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        ${products.map(renderProductCard).join('')}
      </div>
    `
  } catch (error) {
    console.error(error)
    catalogo.innerHTML = '<p>No se pudo cargar el catálogo. Intenta de nuevo más tarde.</p>'
  }
}
