import { PackageSearch, TriangleAlert } from 'lucide'
import { renderHeader, bindHeaderEvents } from '../components/header.js'
import { renderFooter } from '../components/footer.js'
import { getPublishedProducts } from '../lib/products.js'
import { icon } from '../lib/icons.js'
import { renderProductCard, renderProductCardSkeleton } from '../components/product-card.js'

function renderMessage({ iconNode, title, tone = 'neutral' }) {
  const toneClass =
    tone === 'error'
      ? 'border-red-200 dark:border-red-900/50'
      : 'border-dashed border-neutral-300 dark:border-neutral-700'

  return `
    <div class="flex flex-col items-center rounded-2xl border ${toneClass} px-6 py-16 text-center">
      <div class="inline-flex rounded-full bg-neutral-100 p-3 dark:bg-neutral-800">
        ${icon(iconNode, { class: 'h-6 w-6 text-neutral-400 dark:text-neutral-500' })}
      </div>
      <p class="mt-4 text-neutral-500 dark:text-neutral-400">${title}</p>
    </div>
  `
}

export async function productosPage({ mount }) {
  mount.innerHTML = `
    ${renderHeader()}

    <main>
      <section class="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 class="mb-8 text-2xl font-semibold tracking-tight">Productos</h1>

        <div id="catalogo" class="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
          ${Array.from({ length: 8 }, renderProductCardSkeleton).join('')}
        </div>
      </section>
    </main>

    ${renderFooter()}
  `

  bindHeaderEvents(mount)

  const catalogo = mount.querySelector('#catalogo')

  try {
    const products = await getPublishedProducts()

    if (products.length === 0) {
      catalogo.className = ''
      catalogo.innerHTML = renderMessage({
        iconNode: PackageSearch,
        title: 'Todavía no hay productos publicados.',
      })
      return
    }

    catalogo.innerHTML = products.map(renderProductCard).join('')
  } catch (error) {
    console.error(error)
    catalogo.className = ''
    catalogo.innerHTML = renderMessage({
      iconNode: TriangleAlert,
      title: 'No se pudo cargar el catálogo. Intenta de nuevo más tarde.',
      tone: 'error',
    })
  }
}
