import { Store, Menu, X } from 'lucide'
import { link } from '../router/router.js'
import { icon } from '../lib/icons.js'
import { renderThemeToggle, bindThemeToggle } from '../lib/theme.js'
import { siteConfig } from '../site.config.js'

const NAV_LINKS = [
  { href: '/productos', label: 'Productos' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/contacto', label: 'Contacto' },
]

function renderNavLink({ href, label }, extraClass = '') {
  return `<a href="${link(href)}" data-link class="rounded-lg px-3 py-2 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 ${extraClass}">${label}</a>`
}

export function renderHeader() {
  return `
    <header class="sticky top-0 z-40 border-b border-neutral-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
      <nav class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="${link('/')}" data-link class="flex items-center gap-2 text-lg font-semibold tracking-tight">
          ${icon(Store, { class: 'h-5 w-5' })}
          ${siteConfig.storeName}
        </a>

        <div class="hidden items-center gap-1 sm:flex">
          ${NAV_LINKS.map((item) => renderNavLink(item)).join('')}
          ${renderThemeToggle('ml-2')}
        </div>

        <div class="flex items-center gap-1 sm:hidden">
          ${renderThemeToggle()}
          <button
            type="button"
            data-action="toggle-menu"
            aria-label="Abrir menú"
            aria-expanded="false"
            class="rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            ${icon(Menu, { class: 'h-5 w-5' })}
          </button>
        </div>
      </nav>

      <div data-mobile-menu class="hidden border-t border-neutral-200 sm:hidden dark:border-neutral-800">
        <div class="flex flex-col gap-1 px-4 py-3">
          ${NAV_LINKS.map((item) => renderNavLink(item, 'block')).join('')}
        </div>
      </div>
    </header>
  `
}

export function bindHeaderEvents(root) {
  bindThemeToggle(root)

  const toggleButton = root.querySelector('[data-action="toggle-menu"]')
  const menu = root.querySelector('[data-mobile-menu]')
  if (!toggleButton || !menu) return

  toggleButton.addEventListener('click', () => {
    const willOpen = menu.classList.contains('hidden')
    menu.classList.toggle('hidden')
    toggleButton.setAttribute('aria-expanded', String(willOpen))
    toggleButton.innerHTML = icon(willOpen ? X : Menu, { class: 'h-5 w-5' })
  })

  menu.querySelectorAll('a').forEach((anchor) => {
    anchor.addEventListener('click', () => {
      menu.classList.add('hidden')
      toggleButton.setAttribute('aria-expanded', 'false')
      toggleButton.innerHTML = icon(Menu, { class: 'h-5 w-5' })
    })
  })
}
