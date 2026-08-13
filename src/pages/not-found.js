import { Compass } from 'lucide'
import { renderHeader, bindHeaderEvents } from '../components/header.js'
import { renderFooter } from '../components/footer.js'
import { link } from '../router/router.js'
import { icon } from '../lib/icons.js'

export function notFoundPage({ mount }) {
  mount.innerHTML = `
    ${renderHeader()}

    <main>
      <section class="mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center sm:px-6">
        <div class="inline-flex rounded-full bg-neutral-100 p-4 dark:bg-neutral-800">
          ${icon(Compass, { class: 'h-6 w-6' })}
        </div>
        <h1 class="mt-6 text-2xl font-semibold">Página no encontrada</h1>
        <p class="mt-2 text-neutral-500 dark:text-neutral-400">Revisa el enlace o vuelve al inicio.</p>
        <a
          href="${link('/')}"
          data-link
          class="mt-6 inline-block rounded-lg bg-neutral-900 px-6 py-3 font-medium text-white hover:opacity-90 dark:bg-white dark:text-neutral-900"
        >
          Volver al inicio
        </a>
      </section>
    </main>

    ${renderFooter()}
  `

  bindHeaderEvents(mount)
}
