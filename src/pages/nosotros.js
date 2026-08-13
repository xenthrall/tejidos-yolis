import { Leaf, HandHeart, Sparkles, MapPin } from 'lucide'
import { renderHeader, bindHeaderEvents } from '../components/header.js'
import { renderFooter } from '../components/footer.js'
import { icon } from '../lib/icons.js'
import { siteConfig } from '../site.config.js'

const FEATURES = [
  {
    icon: Leaf,
    title: 'Lana 100% de oveja',
    description: 'Cada ruana se teje con lana 100% de oveja, sin mezclas ni fibras sintéticas.',
  },
  {
    icon: HandHeart,
    title: 'Tejido en telar horizontal',
    description: 'Cada pieza se teje en telar horizontal, hilo a hilo, con años de experiencia en el oficio.',
  },
  {
    icon: Sparkles,
    title: 'Fieltro seco artesanal',
    description: 'Yolanda también trabaja el fieltro seco, con acabados de calidad profesional.',
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
            ${siteConfig.storeName} es sinónimo de ruanas 100% de lana de oveja, tejidas en telar horizontal en
            ${siteConfig.location.name}, con la tradición textil boyacense de siempre.
          </p>
        </div>

        <div class="mt-12 grid gap-6 sm:grid-cols-3">
          ${FEATURES.map(renderFeature).join('')}
        </div>
      </section>

      <section class="border-t border-neutral-200 dark:border-neutral-800">
        <div class="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          <div class="rounded-3xl border border-neutral-200 p-8 dark:border-neutral-800 sm:p-10">
            <p class="flex items-center gap-1.5 text-sm font-medium uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              ${icon(MapPin, { class: 'h-4 w-4 shrink-0' })}
              ${siteConfig.location.name}
            </p>
            <h2 class="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Yolanda Rojas</h2>
            <p class="mt-4 text-neutral-600 dark:text-neutral-300">
              Yolanda es quien teje y vende cada pieza de ${siteConfig.storeName}. Es mujer de El Espino, Boyacá,
              y lleva años tejiendo ruanas de lana 100% de oveja en telar horizontal, perfeccionando el oficio
              hilo a hilo.
            </p>
            <p class="mt-4 text-neutral-600 dark:text-neutral-300">
              Además del telar, trabaja el fieltro seco, una técnica que domina hasta lograr acabados de calidad
              profesional. Cada ruana que sale de sus manos lleva la tradición textil boyacense y el cuidado de un
              trabajo hecho de principio a fin por una sola persona.
            </p>
          </div>
        </div>
      </section>
    </main>

    ${renderFooter()}
  `

  bindHeaderEvents(mount)
}
