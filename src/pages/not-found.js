import { renderHeader } from '../components/header.js'
import { renderFooter } from '../components/footer.js'
import { link } from '../router/router.js'

export function notFoundPage({ mount }) {
  mount.innerHTML = `
    ${renderHeader()}

    <main>
      <section class="mx-auto max-w-7xl px-6 py-24 text-center">
        <h1 class="text-2xl font-semibold">Página no encontrada</h1>
        <a href="${link('/')}" data-link class="mt-4 inline-block hover:underline">Volver al inicio</a>
      </section>
    </main>

    ${renderFooter()}
  `
}
