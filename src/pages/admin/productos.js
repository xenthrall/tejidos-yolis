import { renderAdminHeader, attachAdminHeaderEvents } from '../../components/admin-header.js'
import { getAllProducts, deleteProduct } from '../../lib/adminProducts.js'
import { getProductImageUrl } from '../../lib/images.js'
import { formatPrice } from '../../lib/format.js'
import { escapeHtml } from '../../lib/dom.js'
import { signOut } from '../../lib/auth.js'
import { navigate, link } from '../../router/router.js'

function renderRow(product) {
  const imageUrl = getProductImageUrl(product.image_path)
  const name = escapeHtml(product.name)
  const category = product.category ? escapeHtml(product.category.name) : '—'

  return `
    <tr class="border-b" data-id="${product.id}">
      <td class="py-3 pr-4">
        <div class="h-12 w-12 overflow-hidden rounded bg-gray-100">
          ${imageUrl ? `<img src="${imageUrl}" alt="${name}" class="h-full w-full object-cover" />` : ''}
        </div>
      </td>
      <td class="py-3 pr-4">${name}</td>
      <td class="py-3 pr-4">${category}</td>
      <td class="py-3 pr-4">${formatPrice(product.price)}</td>
      <td class="py-3 pr-4">${product.stock}</td>
      <td class="py-3 pr-4">
        <span class="${product.is_published ? 'text-green-700' : 'text-gray-400'}">
          ${product.is_published ? 'Publicado' : 'Borrador'}
        </span>
      </td>
      <td class="py-3 pr-4 text-right">
        <a href="${link(`/admin/productos/${product.id}`)}" data-link class="text-sm hover:underline">Editar</a>
        <button type="button" data-action="delete" class="ml-4 text-sm text-red-600 hover:underline">
          Eliminar
        </button>
      </td>
    </tr>
  `
}

export async function adminProductosPage({ mount }) {
  mount.innerHTML = `
    ${renderAdminHeader()}

    <main class="mx-auto max-w-5xl px-6 py-16">
      <div class="mb-8 flex items-center justify-between">
        <h1 class="text-2xl font-semibold">Panel de productos</h1>
        <a href="${link('/admin/productos/nuevo')}" data-link class="rounded-lg bg-black px-4 py-2 text-sm text-white hover:opacity-80">
          Nuevo producto
        </a>
      </div>

      <div id="lista">
        <p>Cargando productos…</p>
      </div>
    </main>
  `

  attachAdminHeaderEvents(mount, {
    onLogout: async () => {
      await signOut()
      navigate(link('/admin/login'))
    },
  })

  const lista = mount.querySelector('#lista')

  async function loadProducts() {
    try {
      const products = await getAllProducts()

      if (products.length === 0) {
        lista.innerHTML = '<p>Todavía no hay productos.</p>'
        return
      }

      lista.innerHTML = `
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b text-xs uppercase tracking-wide">
              <th class="py-2 pr-4">Imagen</th>
              <th class="py-2 pr-4">Nombre</th>
              <th class="py-2 pr-4">Categoría</th>
              <th class="py-2 pr-4">Precio</th>
              <th class="py-2 pr-4">Stock</th>
              <th class="py-2 pr-4">Estado</th>
              <th class="py-2 pr-4"></th>
            </tr>
          </thead>
          <tbody>
            ${products.map(renderRow).join('')}
          </tbody>
        </table>
      `

      lista.querySelectorAll('[data-action="delete"]').forEach((button) => {
        button.addEventListener('click', async () => {
          const row = button.closest('tr')
          const id = row.dataset.id

          if (!confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return

          button.disabled = true
          try {
            await deleteProduct(id)
            row.remove()
          } catch (error) {
            console.error(error)
            alert('No se pudo eliminar el producto.')
            button.disabled = false
          }
        })
      })
    } catch (error) {
      console.error(error)
      lista.innerHTML = '<p>No se pudo cargar el listado de productos.</p>'
    }
  }

  await loadProducts()
}
