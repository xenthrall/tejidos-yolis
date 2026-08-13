import { renderAdminHeader, attachAdminHeaderEvents } from '../../components/admin-header.js'
import {
  getCategories,
  getProductById,
  createProduct,
  updateProduct,
  uploadProductImage,
  deleteProductImage,
} from '../../lib/adminProducts.js'
import { getProductImageUrl } from '../../lib/images.js'
import { escapeHtml } from '../../lib/dom.js'
import { slugify } from '../../lib/slug.js'
import { signOut } from '../../lib/auth.js'
import { navigate, link } from '../../router/router.js'

function renderCategoryOptions(categories, selectedId) {
  const options = categories
    .map(
      (category) =>
        `<option value="${category.id}" ${category.id === selectedId ? 'selected' : ''}>${escapeHtml(category.name)}</option>`
    )
    .join('')

  return `<option value="">Sin categoría</option>${options}`
}

export async function adminProductoFormPage({ params, mount }) {
  const isEdit = Boolean(params.id)

  mount.innerHTML = `
    ${renderAdminHeader()}

    <main class="mx-auto max-w-2xl px-6 py-16">
      <a href="${link('/admin/productos')}" data-link class="text-sm hover:underline">← Volver</a>
      <h1 class="mt-4 text-2xl font-semibold">${isEdit ? 'Editar producto' : 'Nuevo producto'}</h1>
      <div id="contenido" class="mt-6">
        <p>Cargando…</p>
      </div>
    </main>
  `

  attachAdminHeaderEvents(mount, {
    onLogout: async () => {
      await signOut()
      navigate(link('/admin/login'))
    },
  })

  const contenido = mount.querySelector('#contenido')

  let categories
  let product = null

  try {
    ;[categories, product] = await Promise.all([
      getCategories(),
      isEdit ? getProductById(params.id) : Promise.resolve(null),
    ])
  } catch (error) {
    console.error(error)
    contenido.innerHTML = '<p>No se pudo cargar el formulario.</p>'
    return
  }

  if (isEdit && !product) {
    contenido.innerHTML = '<p>Producto no encontrado.</p>'
    return
  }

  const currentImageUrl = product ? getProductImageUrl(product.image_path) : null

  contenido.innerHTML = `
    <form id="producto-form" class="flex flex-col gap-4">
      <label class="flex flex-col gap-1 text-sm">
        Nombre
        <input type="text" name="name" required value="${product ? escapeHtml(product.name) : ''}" class="rounded-lg border px-3 py-2" />
      </label>

      <label class="flex flex-col gap-1 text-sm">
        Descripción
        <textarea name="description" rows="4" class="rounded-lg border px-3 py-2">${product ? escapeHtml(product.description ?? '') : ''}</textarea>
      </label>

      <div class="grid grid-cols-2 gap-4">
        <label class="flex flex-col gap-1 text-sm">
          Precio
          <input type="number" name="price" required min="0" step="1" value="${product ? product.price : ''}" class="rounded-lg border px-3 py-2" />
        </label>

        <label class="flex flex-col gap-1 text-sm">
          Stock
          <input type="number" name="stock" required min="0" step="1" value="${product ? product.stock : 0}" class="rounded-lg border px-3 py-2" />
        </label>
      </div>

      <label class="flex flex-col gap-1 text-sm">
        Categoría
        <select name="category_id" class="rounded-lg border px-3 py-2">
          ${renderCategoryOptions(categories, product?.category_id ?? null)}
        </select>
      </label>

      <label class="flex flex-col gap-1 text-sm">
        Imagen
        ${currentImageUrl ? `<img src="${currentImageUrl}" alt="" class="mb-2 h-24 w-24 rounded object-cover" />` : ''}
        <input type="file" name="image" accept="image/*" class="text-sm" />
      </label>

      <label class="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_published" ${product?.is_published ? 'checked' : ''} />
        Publicado
      </label>

      <p id="form-error" class="hidden text-sm text-red-600"></p>

      <button type="submit" class="mt-2 self-start rounded-lg bg-black px-6 py-3 text-sm text-white hover:opacity-80">
        Guardar
      </button>
    </form>
  `

  const form = mount.querySelector('#producto-form')
  const errorEl = mount.querySelector('#form-error')

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    errorEl.classList.add('hidden')

    const formData = new FormData(form)
    const submitButton = form.querySelector('button[type="submit"]')
    const imageFile = formData.get('image')

    submitButton.disabled = true
    submitButton.textContent = 'Guardando…'

    try {
      const name = formData.get('name').trim()
      const values = {
        name,
        slug: slugify(name),
        description: formData.get('description').trim() || null,
        price: Number(formData.get('price')),
        stock: Number(formData.get('stock')),
        category_id: formData.get('category_id') || null,
        is_published: formData.get('is_published') === 'on',
      }

      let uploadedImagePath = null
      if (imageFile && imageFile.size > 0) {
        uploadedImagePath = await uploadProductImage(imageFile)
        values.image_path = uploadedImagePath
      }

      if (isEdit) {
        await updateProduct(product.id, values)
      } else {
        await createProduct(values)
      }

      if (uploadedImagePath && product?.image_path) {
        await deleteProductImage(product.image_path).catch(() => {})
      }

      navigate(link('/admin/productos'))
    } catch (error) {
      console.error(error)
      errorEl.textContent =
        error.code === '23505'
          ? 'Ya existe un producto con un nombre muy parecido. Usa un nombre distinto.'
          : 'No se pudo guardar el producto.'
      errorEl.classList.remove('hidden')
      submitButton.disabled = false
      submitButton.textContent = 'Guardar'
    }
  })
}
