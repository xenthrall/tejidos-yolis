import { ArrowRight } from 'lucide'
import { renderHeader, bindHeaderEvents } from '../components/header.js'
import { renderFooter } from '../components/footer.js'
import { renderProductCard, renderProductCardSkeleton } from '../components/product-card.js'
import { getFeaturedProducts } from '../lib/products.js'
import { link } from '../router/router.js'
import { icon } from '../lib/icons.js'
import { siteConfig } from '../site.config.js'

export async function homePage({ mount }) {
  mount.innerHTML = `
    ${renderHeader()}

    <main>
      <section class="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 sm:py-28">
        <p class="mb-4 text-sm font-medium uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
          ${siteConfig.storeName}
        </p>

        <h1 class="text-4xl font-bold tracking-tight sm:text-6xl">
          Productos con identidad
        </h1>

        <p class="mx-auto mt-6 max-w-2xl text-lg text-neutral-600 dark:text-neutral-300">
          Descubre nuestra selección de productos.
        </p>

        <a
          href="${link('/productos')}"
          data-link
          class="mt-8 inline-block rounded-lg bg-neutral-900 px-6 py-3 font-medium text-white hover:opacity-90 dark:bg-white dark:text-neutral-900"
        >
          Ver productos
        </a>
      </section>

      <section id="destacados-section" class="border-t border-neutral-200 dark:border-neutral-800">
        <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <h2 class="text-2xl font-semibold tracking-tight">Productos destacados</h2>

          <div id="destacados" class="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
            ${Array.from({ length: 4 }, renderProductCardSkeleton).join('')}
          </div>

          <div class="mt-10 text-center">
            <a
              href="${link('/productos')}"
              data-link
              class="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-6 py-3 font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              Conoce todo nuestro catálogo
              ${icon(ArrowRight, { class: 'h-4 w-4' })}
            </a>
          </div>
        </div>
      </section>
    </main>

    ${renderFooter()}
  `

  bindHeaderEvents(mount)

  const destacadosSection = mount.querySelector('#destacados-section')
  const destacados = mount.querySelector('#destacados')

  try {
    const products = await getFeaturedProducts()

    if (products.length === 0) {
      destacadosSection.remove()
      return
    }

    destacados.innerHTML = products.map(renderProductCard).join('')
  } catch (error) {
    console.error(error)
    destacadosSection.remove()
  }
}
