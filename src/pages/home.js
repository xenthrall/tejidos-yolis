import { renderHeader } from '../components/header.js'
import { renderFooter } from '../components/footer.js'
import { link } from '../router/router.js'

export function homePage({ mount }) {
  mount.innerHTML = `
    ${renderHeader()}

    <main>
      <section class="mx-auto max-w-7xl px-6 py-24 text-center">
        <p class="mb-4 text-sm font-medium uppercase tracking-widest">
          Nativa
        </p>

        <h1 class="text-4xl font-bold tracking-tight sm:text-6xl">
          Productos con identidad
        </h1>

        <p class="mx-auto mt-6 max-w-2xl text-lg">
          Descubre nuestra selección de productos.
        </p>

        <a
          href="${link('/productos')}"
          data-link
          class="mt-8 inline-block rounded-lg bg-black px-6 py-3 text-white hover:opacity-80"
        >
          Ver productos
        </a>
      </section>
    </main>

    ${renderFooter()}
  `
}
