import { Plus, Pencil, Trash2, Eye, EyeOff, PackageOpen, TriangleAlert } from 'lucide'
import { renderAdminHeader, attachAdminHeaderEvents } from '../../components/admin-header.js'
import { getAllProducts, deleteProduct } from '../../lib/adminProducts.js'
import { getProductImageUrl } from '../../lib/images.js'
import { formatPrice } from '../../lib/format.js'
import { escapeHtml } from '../../lib/dom.js'
import { signOut } from '../../lib/auth.js'
import { navigate, link } from '../../router/router.js'
import { icon } from '../../lib/icons.js'

function renderStatusBadge(product) {
  return `
    <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${product.is_published ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-500' : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'}">
      ${icon(product.is_published ? Eye : EyeOff, { class: 'h-3.5 w-3.5' })}
      ${product.is_published ? 'Publicado' : 'Borrador'}
    </span>
  `
}

function renderThumb(product, name, sizeClass) {
  const imageUrl = getProductImageUrl(product.image_path)
  return `
    <div class="${sizeClass} shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
      ${imageUrl ? `<img src="${imageUrl}" alt="${name}" class="h-full w-full object-cover" />` : ''}
    </div>
  `
}

function renderDesktopRow(product) {
  const name = escapeHtml(product.name)
  const category = product.category ? escapeHtml(product.category.name) : '—'

  return `
    <tr class="border-b border-neutral-100 last:border-0 dark:border-neutral-800" data-id="${product.id}">
      <td class="py-3 pl-4">${renderThumb(product, name, 'h-12 w-12')}</td>
      <td class="py-3 pr-4 font-medium">${name}</td>
      <td class="py-3 pr-4 text-neutral-500 dark:text-neutral-400">${category}</td>
      <td class="py-3 pr-4">${formatPrice(product.price)}</td>
      <td class="py-3 pr-4">${product.stock}</td>
      <td class="py-3 pr-4">${renderStatusBadge(product)}</td>
      <td class="py-3 pr-4 text-right">
        <div class="flex justify-end gap-1">
          <a
            href="${link(`/admin/productos/${product.id}`)}"
            data-link
            title="Editar"
            class="rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            ${icon(Pencil, { class: 'h-4 w-4' })}
          </a>
          <button
            type="button"
            data-action="delete"
            title="Eliminar"
            class="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-500/10"
          >
            ${icon(Trash2, { class: 'h-4 w-4' })}
          </button>
        </div>
      </td>
    </tr>
  `
}

function renderMobileCard(product) {
  const name = escapeHtml(product.name)
  const category = product.category ? escapeHtml(product.category.name) : '—'

  return `
    <div class="flex gap-3 rounded-2xl border border-neutral-200 p-3 dark:border-neutral-800" data-id="${product.id}">
      ${renderThumb(product, name, 'h-16 w-16')}
      <div class="min-w-0 flex-1">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <p class="truncate font-medium">${name}</p>
            <p class="text-sm text-neutral-500 dark:text-neutral-400">${category}</p>
          </div>
          <div class="flex shrink-0 gap-1">
            <a
              href="${link(`/admin/productos/${product.id}`)}"
              data-link
              title="Editar"
              class="rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              ${icon(Pencil, { class: 'h-4 w-4' })}
            </a>
            <button
              type="button"
              data-action="delete"
              title="Eliminar"
              class="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-500/10"
            >
              ${icon(Trash2, { class: 'h-4 w-4' })}
            </button>
          </div>
        </div>
        <div class="mt-2 flex flex-wrap items-center gap-2">
          <span class="font-medium">${formatPrice(product.price)}</span>
          <span class="text-sm text-neutral-500 dark:text-neutral-400">· Stock: ${product.stock}</span>
          ${renderStatusBadge(product)}
        </div>
      </div>
    </div>
  `
}

function renderSkeleton() {
  const card = `
    <div class="flex animate-pulse gap-3 rounded-2xl border border-neutral-200 p-3 dark:border-neutral-800">
      <div class="h-16 w-16 shrink-0 rounded-lg bg-neutral-100 dark:bg-neutral-800"></div>
      <div class="flex-1 space-y-2 py-1">
        <div class="h-4 w-1/2 rounded bg-neutral-100 dark:bg-neutral-800"></div>
        <div class="h-4 w-1/3 rounded bg-neutral-100 dark:bg-neutral-800"></div>
      </div>
    </div>
  `
  return `<div class="grid gap-3">${card.repeat(4)}</div>`
}

function renderEmptyState() {
  return `
    <div class="flex flex-col items-center rounded-2xl border border-dashed border-neutral-300 px-6 py-16 text-center dark:border-neutral-700">
      <div class="inline-flex rounded-full bg-neutral-100 p-3 dark:bg-neutral-800">
        ${icon(PackageOpen, { class: 'h-6 w-6 text-neutral-400 dark:text-neutral-500' })}
      </div>
      <p class="mt-4 text-neutral-500 dark:text-neutral-400">Todavía no hay productos.</p>
      <a
        href="${link('/admin/productos/nuevo')}"
        data-link
        class="mt-6 inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-6 py-3 font-medium text-white hover:opacity-90 dark:bg-white dark:text-neutral-900"
      >
        ${icon(Plus, { class: 'h-4 w-4' })}
        Crear el primero
      </a>
    </div>
  `
}

function renderErrorState() {
  return `
    <div class="flex flex-col items-center rounded-2xl border border-red-200 px-6 py-16 text-center dark:border-red-900/50">
      <div class="inline-flex rounded-full bg-neutral-100 p-3 dark:bg-neutral-800">
        ${icon(TriangleAlert, { class: 'h-6 w-6 text-neutral-400 dark:text-neutral-500' })}
      </div>
      <p class="mt-4 text-neutral-500 dark:text-neutral-400">No se pudo cargar el listado de productos.</p>
    </div>
  `
}

export async function adminProductosPage({ mount }) {
  mount.innerHTML = `
    ${renderAdminHeader()}

    <main class="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 class="text-2xl font-semibold tracking-tight">Panel de productos</h1>
        <a
          href="${link('/admin/productos/nuevo')}"
          data-link
          class="inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 dark:bg-white dark:text-neutral-900"
        >
          ${icon(Plus, { class: 'h-4 w-4' })}
          Nuevo producto
        </a>
      </div>

      <div id="lista">${renderSkeleton()}</div>
    </main>
  `

  attachAdminHeaderEvents(mount, {
    onLogout: async () => {
      await signOut()
      navigate(link('/admin/login'))
    },
  })

  const lista = mount.querySelector('#lista')

  lista.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-action="delete"]')
    if (!button) return

    const container = button.closest('[data-id]')
    const id = container.dataset.id

    if (!confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return

    const buttons = lista.querySelectorAll(`[data-id="${id}"] [data-action="delete"]`)
    buttons.forEach((b) => (b.disabled = true))

    try {
      await deleteProduct(id)
      lista.querySelectorAll(`[data-id="${id}"]`).forEach((el) => el.remove())
    } catch (error) {
      console.error(error)
      alert('No se pudo eliminar el producto.')
      buttons.forEach((b) => (b.disabled = false))
    }
  })

  try {
    const products = await getAllProducts()

    if (products.length === 0) {
      lista.innerHTML = renderEmptyState()
      return
    }

    lista.innerHTML = `
      <div class="hidden overflow-x-auto rounded-2xl border border-neutral-200 md:block dark:border-neutral-800">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-neutral-200 text-xs uppercase tracking-wide text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
              <th class="py-3 pl-4 font-medium">Imagen</th>
              <th class="py-3 pr-4 font-medium">Nombre</th>
              <th class="py-3 pr-4 font-medium">Categoría</th>
              <th class="py-3 pr-4 font-medium">Precio</th>
              <th class="py-3 pr-4 font-medium">Stock</th>
              <th class="py-3 pr-4 font-medium">Estado</th>
              <th class="py-3 pr-4"></th>
            </tr>
          </thead>
          <tbody>
            ${products.map(renderDesktopRow).join('')}
          </tbody>
        </table>
      </div>

      <div class="grid gap-3 md:hidden">
        ${products.map(renderMobileCard).join('')}
      </div>
    `
  } catch (error) {
    console.error(error)
    lista.innerHTML = renderErrorState()
  }
}
