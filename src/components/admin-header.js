import { ShieldCheck, Store, LogOut } from 'lucide'
import { link } from '../router/router.js'
import { icon } from '../lib/icons.js'
import { renderThemeToggle, bindThemeToggle } from '../lib/theme.js'
import { siteConfig } from '../site.config.js'

export function renderAdminHeader() {
  return `
    <header class="sticky top-0 z-40 border-b border-neutral-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
      <nav class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="${link('/admin/productos')}" data-link class="flex items-center gap-2 font-semibold">
          ${icon(ShieldCheck, { class: 'h-5 w-5' })}
          <span class="hidden sm:inline">${siteConfig.storeName} · Admin</span>
          <span class="sm:hidden">Admin</span>
        </a>

        <div class="flex items-center gap-1">
          ${renderThemeToggle()}
          <a
            href="${link('/productos')}"
            data-link
            title="Ver tienda"
            class="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            ${icon(Store, { class: 'h-4 w-4' })}
            <span class="hidden sm:inline">Ver tienda</span>
          </a>
          <button
            type="button"
            data-action="logout"
            title="Cerrar sesión"
            class="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-500/10"
          >
            ${icon(LogOut, { class: 'h-4 w-4' })}
            <span class="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </nav>
    </header>
  `
}

export function attachAdminHeaderEvents(mount, { onLogout }) {
  bindThemeToggle(mount)
  mount.querySelector('[data-action="logout"]')?.addEventListener('click', onLogout)
}
