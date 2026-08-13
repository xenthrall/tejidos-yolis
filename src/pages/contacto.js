import { MessageCircleOff, MapPin } from 'lucide'
import whatsappSvg from 'simple-icons/icons/whatsapp.svg?raw'
import instagramSvg from 'simple-icons/icons/instagram.svg?raw'
import facebookSvg from 'simple-icons/icons/facebook.svg?raw'
import tiktokSvg from 'simple-icons/icons/tiktok.svg?raw'
import xSvg from 'simple-icons/icons/x.svg?raw'
import { renderHeader, bindHeaderEvents } from '../components/header.js'
import { renderFooter } from '../components/footer.js'
import { icon } from '../lib/icons.js'
import { brandIcon } from '../lib/brand-icons.js'
import { resolveSocialUrl } from '../lib/social-links.js'
import { siteConfig } from '../site.config.js'

const PLATFORMS = [
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    svg: whatsappSvg,
    className: 'bg-[#25D366] text-white hover:opacity-90',
    buildHref: (url) => `${url}?text=${encodeURIComponent('Hola, quiero más información.')}`,
  },
  {
    key: 'instagram',
    label: 'Instagram',
    svg: instagramSvg,
    className: 'bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white hover:opacity-90',
  },
  {
    key: 'facebook',
    label: 'Facebook',
    svg: facebookSvg,
    className: 'bg-[#1877F2] text-white hover:opacity-90',
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    svg: tiktokSvg,
    className: 'bg-black text-white hover:opacity-90',
  },
  {
    key: 'x',
    label: 'X',
    svg: xSvg,
    className: 'bg-black text-white hover:opacity-90',
  },
]

function renderPlatformButton(platform) {
  const url = resolveSocialUrl(platform.key, siteConfig.social[platform.key])
  if (!url) return ''

  const href = platform.buildHref ? platform.buildHref(url) : url

  return `
    <a
      href="${href}"
      target="_blank"
      rel="noopener"
      class="flex items-center gap-3 rounded-2xl px-5 py-4 font-medium transition ${platform.className}"
    >
      ${brandIcon(platform.svg, 'h-5 w-5 shrink-0')}
      ${platform.label}
    </a>
  `
}

function renderLocation() {
  const { name, mapEmbedUrl } = siteConfig.location ?? {}
  if (!mapEmbedUrl) return ''

  return `
    <div class="mt-14">
      <div class="text-center">
        <h2 class="text-xl font-semibold tracking-tight">Nuestro taller</h2>
        ${
          name
            ? `<p class="mt-2 flex items-center justify-center gap-1.5 text-neutral-600 dark:text-neutral-300">
                ${icon(MapPin, { class: 'h-4 w-4 shrink-0' })}
                ${name}
              </p>`
            : ''
        }
      </div>

      <div class="mt-6 overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800">
        <iframe
          src="${mapEmbedUrl}"
          class="aspect-[4/3] w-full"
          style="border:0"
          allowfullscreen=""
          loading="lazy"
          referrerpolicy="strict-origin-when-cross-origin"
          title="Ubicación de ${siteConfig.storeName}${name ? ` en ${name}` : ''}"
        ></iframe>
      </div>
    </div>
  `
}

function renderEmptyState() {
  return `
    <div class="flex flex-col items-center rounded-2xl border border-dashed border-neutral-300 px-6 py-16 text-center dark:border-neutral-700">
      <div class="inline-flex rounded-full bg-neutral-100 p-3 dark:bg-neutral-800">
        ${icon(MessageCircleOff, { class: 'h-6 w-6 text-neutral-400 dark:text-neutral-500' })}
      </div>
      <p class="mt-4 text-neutral-500 dark:text-neutral-400">Todavía no hay canales de contacto configurados.</p>
    </div>
  `
}

export function contactoPage({ mount }) {
  const buttons = PLATFORMS.map(renderPlatformButton).join('')
  const hasAnySocial = Object.values(siteConfig.social).some(Boolean)

  mount.innerHTML = `
    ${renderHeader()}

    <main>
      <section class="mx-auto max-w-md px-4 py-16 sm:px-6 sm:py-20">
        <div class="text-center">
          <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">Contacto</h1>
          <p class="mt-3 text-neutral-600 dark:text-neutral-300">
            Escríbenos por el canal que prefieras.
          </p>
        </div>

        <div class="mt-10 flex flex-col gap-3">
          ${hasAnySocial ? buttons : renderEmptyState()}
        </div>

        ${renderLocation()}
      </section>
    </main>

    ${renderFooter()}
  `

  bindHeaderEvents(mount)
}
