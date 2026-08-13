import { ArrowLeft, ImagePlus, LoaderCircle, CircleAlert, TriangleAlert, PackageX } from 'lucide'
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
import { icon } from '../../lib/icons.js'

const INPUT_CLASS =
  'w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:focus:border-white'

function renderCategoryOptions(categories, selectedId) {
  const options = categories
    .map(
      (category) =>
        `<option value="${category.id}" ${category.id === selectedId ? 'selected' : ''}>${escapeHtml(category.name)}</option>`
    )
    .join('')

  return `<option value="">Sin categoría</option>${options}`
}

function renderForm({ isEdit, product, categories }) {
  const currentImageUrl = product ? getProductImageUrl(product.image_path) : null

  return `
    <form id="producto-form" class="flex flex-col gap-5">
      <label class="flex flex-col gap-1.5 text-sm font-medium">
        Nombre
        <input
          type="text"
          name="name"
          required
          value="${product ? escapeHtml(product.name) : ''}"
          class="${INPUT_CLASS}"
        />
      </label>

      <label class="flex flex-col gap-1.5 text-sm font-medium">
        Descripción
        <textarea name="description" rows="4" class="${INPUT_CLASS} resize-none">${product ? escapeHtml(product.description ?? '') : ''}</textarea>
      </label>

      <div class="grid grid-cols-2 gap-4">
        <label class="flex flex-col gap-1.5 text-sm font-medium">
          Precio
          <div class="flex items-center gap-1 rounded-lg border border-neutral-300 px-3 py-2 focus-within:border-neutral-900 dark:border-neutral-700 dark:focus-within:border-white">
            <span class="text-neutral-400">$</span>
            <input
              type="number"
              name="price"
              required
              min="0"
              step="1"
              value="${product ? product.price : ''}"
              class="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </label>

        <label class="flex flex-col gap-1.5 text-sm font-medium">
          Stock
          <input
            type="number"
            name="stock"
            required
            min="0"
            step="1"
            value="${product ? product.stock : 0}"
            class="${INPUT_CLASS}"
          />
        </label>
      </div>

      <label class="flex flex-col gap-1.5 text-sm font-medium">
        Categoría
        <select name="category_id" class="${INPUT_CLASS}">
          ${renderCategoryOptions(categories, product?.category_id ?? null)}
        </select>
      </label>

      <div class="flex flex-col gap-1.5 text-sm font-medium">
        <span>Imagen</span>
        <label
          for="image-input"
          class="relative flex aspect-video w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-neutral-300 hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-600"
        >
          <img
            id="image-preview"
            src="${currentImageUrl ?? ''}"
            alt=""
            class="absolute inset-0 h-full w-full object-cover ${currentImageUrl ? '' : 'hidden'}"
          />
          <div id="image-placeholder" class="flex flex-col items-center gap-1 text-neutral-400 ${currentImageUrl ? 'hidden' : ''}">
            ${icon(ImagePlus, { class: 'h-6 w-6' })}
            <span class="text-xs font-normal">Toca para subir una imagen</span>
          </div>
        </label>
        <input id="image-input" type="file" name="image" accept="image/*" class="sr-only" />
      </div>

      <label class="flex items-start gap-3 rounded-lg border border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <input
          type="checkbox"
          name="is_published"
          class="mt-0.5 h-4 w-4 accent-neutral-900 dark:accent-white"
          ${product?.is_published ? 'checked' : ''}
        />
        <span>
          <span class="block text-sm font-medium">Publicar producto</span>
          <span class="block text-xs text-neutral-500 dark:text-neutral-400">Visible en la tienda cuando está activado.</span>
        </span>
      </label>

      <p id="form-error" class="hidden items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-500">
        ${icon(CircleAlert, { class: 'h-4 w-4 shrink-0' })}
        <span></span>
      </p>

      <div class="flex flex-col-reverse gap-3 sm:flex-row">
        <a
          href="${link('/admin/productos')}"
          data-link
          class="rounded-lg px-6 py-3 text-center text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          Cancelar
        </a>
        <button
          type="submit"
          class="flex flex-1 items-center justify-center gap-2 rounded-lg bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:opacity-90 sm:flex-none dark:bg-white dark:text-neutral-900"
        >
          Guardar
        </button>
      </div>
    </form>
  `
}

function bindForm({ mount, contenido, isEdit, product }) {
  const form = mount.querySelector('#producto-form')
  const errorEl = mount.querySelector('#form-error')
  const errorText = errorEl.querySelector('span')
  const imageInput = mount.querySelector('#image-input')
  const imagePreview = mount.querySelector('#image-preview')
  const imagePlaceholder = mount.querySelector('#image-placeholder')

  imageInput.addEventListener('change', () => {
    const file = imageInput.files[0]
    if (!file) return
    imagePreview.src = URL.createObjectURL(file)
    imagePreview.classList.remove('hidden')
    imagePlaceholder.classList.add('hidden')
  })

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    errorEl.classList.add('hidden')
    errorEl.classList.remove('flex')

    const formData = new FormData(form)
    const submitButton = form.querySelector('button[type="submit"]')
    const imageFile = formData.get('image')

    submitButton.disabled = true
    submitButton.innerHTML = `${icon(LoaderCircle, { class: 'h-4 w-4 animate-spin' })} Guardando…`

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
      errorText.textContent =
        error.code === '23505'
          ? 'Ya existe un producto con un nombre muy parecido. Usa un nombre distinto.'
          : 'No se pudo guardar el producto.'
      errorEl.classList.remove('hidden')
      errorEl.classList.add('flex')
      submitButton.disabled = false
      submitButton.textContent = 'Guardar'
    }
  })
}

export async function adminProductoFormPage({ params, mount }) {
  const isEdit = Boolean(params.id)

  mount.innerHTML = `
    ${renderAdminHeader()}

    <main class="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
      <a href="${link('/admin/productos')}" data-link class="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white">
        ${icon(ArrowLeft, { class: 'h-4 w-4' })}
        Volver
      </a>
      <h1 class="mt-4 text-2xl font-semibold tracking-tight">${isEdit ? 'Editar producto' : 'Nuevo producto'}</h1>

      <div id="contenido" class="mt-6 animate-pulse space-y-4">
        <div class="h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800"></div>
        <div class="h-24 rounded-lg bg-neutral-100 dark:bg-neutral-800"></div>
        <div class="h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800"></div>
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
    contenido.className = ''
    contenido.innerHTML = `
      <div class="flex flex-col items-center rounded-2xl border border-red-200 px-6 py-16 text-center dark:border-red-900/50">
        ${icon(TriangleAlert, { class: 'h-6 w-6 text-neutral-400 dark:text-neutral-500' })}
        <p class="mt-4 text-neutral-500 dark:text-neutral-400">No se pudo cargar el formulario.</p>
      </div>
    `
    return
  }

  if (isEdit && !product) {
    contenido.className = ''
    contenido.innerHTML = `
      <div class="flex flex-col items-center rounded-2xl border border-neutral-200 px-6 py-16 text-center dark:border-neutral-800">
        ${icon(PackageX, { class: 'h-6 w-6 text-neutral-400 dark:text-neutral-500' })}
        <p class="mt-4 text-neutral-500 dark:text-neutral-400">Producto no encontrado.</p>
      </div>
    `
    return
  }

  contenido.className = 'mt-6'
  contenido.innerHTML = renderForm({ isEdit, product, categories })
  bindForm({ mount, contenido, isEdit, product })
}
