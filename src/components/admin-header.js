import { link } from '../router/router.js'

export function renderAdminHeader() {
  return `
    <header class="border-b">
      <nav class="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <a href="${link('/admin/productos')}" data-link class="text-xl font-semibold">Nativa · Admin</a>

        <div class="flex items-center gap-6 text-sm">
          <a href="${link('/productos')}" data-link class="hover:underline">Ver tienda</a>
          <button type="button" data-action="logout" class="hover:underline">Cerrar sesión</button>
        </div>
      </nav>
    </header>
  `
}

export function attachAdminHeaderEvents(mount, { onLogout }) {
  mount.querySelector('[data-action="logout"]')?.addEventListener('click', onLogout)
}
