import { Users, Package, MessageCircle } from 'lucide'
import { renderHeader, bindHeaderEvents } from '../components/header.js'
import { renderFooter } from '../components/footer.js'
import { icon } from '../lib/icons.js'
import { siteConfig } from '../site.config.js'

const FEATURES = [
  {
    icon: Users,
    title: 'Tienda familiar',
    description: 'Atención cercana y de confianza, sin intermediarios.',
  },
  {
    icon: Package,
    title: 'Catálogo cuidado',
    description: 'Cada producto publicado tiene stock y disponibilidad reales.',
  },
  {
    icon: MessageCircle,
    title: 'Compra por WhatsApp',
    description: 'Sin registros ni carritos: escríbenos y coordinamos directo.',
  },
]

function renderFeature(feature) {
  return `
    <div class="rounded-2xl border border-neutral-200 p-6 dark:border-neutral-800">
      <div class="inline-flex rounded-lg bg-neutral-100 p-2.5 dark:bg-neutral-800">
        ${icon(feature.icon, { class: 'h-5 w-5' })}
      </div>
      <h3 class="mt-4 font-medium">${feature.title}</h3>
      <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">${feature.description}</p>
    </div>
  `
}

export function nosotrosPage({ mount }) {
  mount.innerHTML = `
    ${renderHeader()}

    <main>
      <section class="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <div class="mx-auto max-w-2xl text-center">
          <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">Nosotros</h1>
          <p class="mt-4 text-lg text-neutral-600 dark:text-neutral-300">
            ${siteConfig.storeName} nació como una tienda familiar y sigue funcionando así: catálogo simple,
            trato directo y compras que se cierran por WhatsApp.
          </p>
        </div>

        <div class="mt-12 grid gap-6 sm:grid-cols-3">
          ${FEATURES.map(renderFeature).join('')}
        </div>
      </section>
    </main>

    ${renderFooter()}
  `

  bindHeaderEvents(mount)
}
