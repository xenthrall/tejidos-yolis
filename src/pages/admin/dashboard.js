import { Package, ArrowRight } from 'lucide'
import { renderAdminShell, attachAdminShellEvents } from '../../components/admin-sidebar.js'
import { signOut } from '../../lib/auth.js'
import { navigate, link } from '../../router/router.js'
import { icon } from '../../lib/icons.js'
import { escapeHtml } from '../../lib/dom.js'

// Each entry becomes a quick-access card on the dashboard. Add one per new
// admin section as the panel grows.
const QUICK_LINKS = [
  {
    path: '/admin/productos',
    label: 'Productos',
    description: 'Crea, edita y publica los productos de la tienda.',
    icon: Package,
  },
]

function renderQuickLink(item) {
  return `
    <a
      href="${link(item.path)}"
      data-link
      class="group flex items-center gap-4 rounded-2xl border border-neutral-200 p-5 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:border-neutral-700 dark:hover:bg-neutral-900"
    >
      <div class="inline-flex shrink-0 rounded-xl bg-neutral-100 p-3 dark:bg-neutral-800">
        ${icon(item.icon, { class: 'h-5 w-5' })}
      </div>
      <div class="min-w-0 flex-1">
        <p class="font-medium">${item.label}</p>
        <p class="text-sm text-neutral-500 dark:text-neutral-400">${item.description}</p>
      </div>
      ${icon(ArrowRight, { class: 'h-4 w-4 shrink-0 text-neutral-300 group-hover:text-neutral-500 dark:text-neutral-700 dark:group-hover:text-neutral-400' })}
    </a>
  `
}

export async function adminDashboardPage({ mount, admin }) {
  const greetingName = admin?.displayName || admin?.email

  mount.innerHTML = renderAdminShell({
    active: 'inicio',
    content: `
      <main class="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
        <h1 class="text-2xl font-semibold tracking-tight">Inicio</h1>
        <p class="mt-1 text-neutral-500 dark:text-neutral-400">Hola${greetingName ? `, ${escapeHtml(greetingName)}` : ''}. Esto es lo que puedes gestionar.</p>

        <div class="mt-8 grid gap-3 sm:grid-cols-2">
          ${QUICK_LINKS.map(renderQuickLink).join('')}
        </div>
      </main>
    `,
  })

  attachAdminShellEvents(mount, {
    onLogout: async () => {
      await signOut()
      navigate(link('/admin/login'))
    },
  })
}
