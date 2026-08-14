import {
  ShieldCheck,
  LayoutDashboard,
  Package,
  Tag,
  Settings,
  Menu,
  X,
  Store,
  LogOut,
} from 'lucide'
import { link } from '../router/router.js'
import { icon } from '../lib/icons.js'
import { renderThemeToggle, bindThemeToggle } from '../lib/theme.js'
import { siteConfig } from '../site.config.js'

// Add new sections here as the admin panel grows — both the sidebar and the
// mobile drawer read from this single list.
const NAV_ITEMS = [
  { key: 'inicio', label: 'Inicio', path: '/admin', icon: LayoutDashboard },
  { key: 'productos', label: 'Productos', path: '/admin/productos', icon: Package },
  { key: 'categorias', label: 'Categorías', path: '/admin/categorias', icon: Tag },
]

// Rendered separately, pinned to the bottom of the sidebar.
const NAV_FOOTER_ITEMS = [
  { key: 'configuracion', label: 'Configuración', path: '/admin/configuracion', icon: Settings },
]

function renderNavLink(item, active) {
  const isActive = item.key === active
  return `
    <a
      href="${link(item.path)}"
      data-link
      class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
        isActive
          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
          : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
      }"
      ${isActive ? 'aria-current="page"' : ''}
    >
      ${icon(item.icon, { class: 'h-4 w-4 shrink-0' })}
      ${item.label}
    </a>
  `
}

export function renderAdminShell({ active, content }) {
  return `
    <header class="sticky top-0 z-30 flex items-center justify-between border-b border-neutral-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80 lg:hidden">
      <div class="flex items-center gap-1">
        <button
          type="button"
          data-action="open-sidebar"
          aria-label="Abrir menú"
          class="-ml-2 rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          ${icon(Menu, { class: 'h-5 w-5' })}
        </button>
        <a href="${link('/admin')}" data-link class="flex items-center gap-2 px-1 font-semibold">
          ${icon(ShieldCheck, { class: 'h-5 w-5' })}
          <span>${siteConfig.storeName} · Admin</span>
        </a>
      </div>
      ${renderThemeToggle()}
    </header>

    <div
      data-sidebar-overlay
      class="fixed inset-0 z-40 hidden bg-black/50 lg:hidden"
    ></div>

    <aside
      data-sidebar
      class="fixed inset-y-0 left-0 z-50 flex w-72 -translate-x-full flex-col border-r border-neutral-200 bg-white transition-transform duration-200 ease-out dark:border-neutral-800 dark:bg-neutral-950 lg:w-64 lg:translate-x-0"
    >
      <div class="flex items-center justify-between px-5 py-4">
        <a href="${link('/admin')}" data-link class="flex items-center gap-2 font-semibold">
          ${icon(ShieldCheck, { class: 'h-5 w-5' })}
          <span>${siteConfig.storeName}</span>
        </a>
        <button
          type="button"
          data-action="close-sidebar"
          aria-label="Cerrar menú"
          class="rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 lg:hidden"
        >
          ${icon(X, { class: 'h-5 w-5' })}
        </button>
      </div>

      <nav class="flex-1 space-y-1 overflow-y-auto px-3">
        ${NAV_ITEMS.map((item) => renderNavLink(item, active)).join('')}
      </nav>

      <div class="space-y-1 border-t border-neutral-200 px-3 py-3 dark:border-neutral-800">
        ${NAV_FOOTER_ITEMS.map((item) => renderNavLink(item, active)).join('')}

        <a
          href="${link('/productos')}"
          data-link
          class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          ${icon(Store, { class: 'h-4 w-4 shrink-0' })}
          Ver tienda
        </a>
        <button
          type="button"
          data-action="logout"
          class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-500/10"
        >
          ${icon(LogOut, { class: 'h-4 w-4 shrink-0' })}
          Cerrar sesión
        </button>
      </div>

      <div class="hidden items-center justify-end border-t border-neutral-200 px-3 py-3 dark:border-neutral-800 lg:flex">
        ${renderThemeToggle()}
      </div>
    </aside>

    <div class="lg:pl-64">
      ${content}
    </div>
  `
}

function setSidebarOpen(mount, open) {
  const sidebar = mount.querySelector('[data-sidebar]')
  const overlay = mount.querySelector('[data-sidebar-overlay]')

  sidebar.classList.toggle('-translate-x-full', !open)
  sidebar.classList.toggle('translate-x-0', open)
  overlay.classList.toggle('hidden', !open)
  document.body.classList.toggle('overflow-hidden', open)
}

export function attachAdminShellEvents(mount, { onLogout }) {
  bindThemeToggle(mount)

  mount.querySelector('[data-action="open-sidebar"]')?.addEventListener('click', () => {
    setSidebarOpen(mount, true)
  })
  mount.querySelector('[data-action="close-sidebar"]')?.addEventListener('click', () => {
    setSidebarOpen(mount, false)
  })
  mount.querySelector('[data-sidebar-overlay]')?.addEventListener('click', () => {
    setSidebarOpen(mount, false)
  })
  mount.querySelector('[data-sidebar]')?.addEventListener('click', (event) => {
    if (event.target.closest('a[data-link]')) setSidebarOpen(mount, false)
  })
  document.addEventListener('keydown', function onKeydown(event) {
    if (!mount.isConnected) {
      document.removeEventListener('keydown', onKeydown)
      return
    }
    if (event.key === 'Escape') setSidebarOpen(mount, false)
  })

  mount.querySelector('[data-action="logout"]')?.addEventListener('click', onLogout)
}
