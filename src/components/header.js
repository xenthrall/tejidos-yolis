import { link } from '../router/router.js'

export function renderHeader() {
  return `
    <header class="border-b">
      <nav class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="${link('/')}" data-link class="text-xl font-semibold">
          Nativa
        </a>

        <div class="flex items-center gap-6 text-sm">
          <a href="${link('/productos')}" data-link class="hover:underline">Productos</a>
          <a href="${link('/#nosotros')}" data-link class="hover:underline">Nosotros</a>
          <a href="${link('/#contacto')}" data-link class="hover:underline">Contacto</a>
        </div>
      </nav>
    </header>
  `
}
