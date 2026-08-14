import { Plus, Pencil, Trash2, Tag, TriangleAlert, LoaderCircle, CircleAlert } from 'lucide'
import { renderAdminShell, attachAdminShellEvents } from '../../components/admin-sidebar.js'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryProductCount,
} from '../../lib/adminCategories.js'
import { slugify } from '../../lib/slug.js'
import { escapeHtml } from '../../lib/dom.js'
import { signOut } from '../../lib/auth.js'
import { navigate, link } from '../../router/router.js'
import { icon } from '../../lib/icons.js'
import { confirmModal } from '../../lib/modal.js'
import { showToast } from '../../lib/toast.js'

const INPUT_CLASS =
  'w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:focus:border-white'

// Imperative, promise-based form modal (mirrors confirmModal in lib/modal.js)
// tailored to a single "name" field, with inline error handling so a
// duplicate-name response from the server doesn't lose what was typed.
function categoryFormModal({ title, initialName = '', onSubmit }) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div')
    overlay.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
    overlay.innerHTML = `
      <div role="dialog" aria-modal="true" aria-labelledby="category-modal-title" class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-900">
        <h2 id="category-modal-title" class="text-lg font-semibold">${escapeHtml(title)}</h2>
        <form id="category-form" class="mt-4 flex flex-col gap-4">
          <label class="flex flex-col gap-1.5 text-sm font-medium">
            Nombre
            <input
              type="text"
              name="name"
              required
              value="${escapeHtml(initialName)}"
              class="${INPUT_CLASS}"
            />
          </label>

          <p data-error class="hidden items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-500">
            ${icon(CircleAlert, { class: 'h-4 w-4 shrink-0' })}
            <span></span>
          </p>

          <div class="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              data-action="cancel"
              class="rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 dark:bg-white dark:text-neutral-900"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    `

    const form = overlay.querySelector('#category-form')
    const input = form.querySelector('input')
    const errorEl = form.querySelector('[data-error]')
    const errorText = errorEl.querySelector('span')
    const submitButton = form.querySelector('button[type="submit"]')

    function close(result) {
      document.removeEventListener('keydown', onKeydown)
      overlay.remove()
      resolve(result)
    }

    function onKeydown(event) {
      if (event.key === 'Escape') close(false)
    }

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) close(false)
    })
    form.querySelector('[data-action="cancel"]').addEventListener('click', () => close(false))

    form.addEventListener('submit', async (event) => {
      event.preventDefault()
      errorEl.classList.add('hidden')
      errorEl.classList.remove('flex')

      const name = new FormData(form).get('name').trim()

      submitButton.disabled = true
      submitButton.innerHTML = `${icon(LoaderCircle, { class: 'h-4 w-4 animate-spin' })} Guardando…`

      try {
        await onSubmit(name)
        close(true)
      } catch (error) {
        console.error(error)
        errorText.textContent =
          error.code === '23505'
            ? 'Ya existe una categoría con un nombre muy parecido.'
            : 'No se pudo guardar la categoría.'
        errorEl.classList.remove('hidden')
        errorEl.classList.add('flex')
        submitButton.disabled = false
        submitButton.textContent = 'Guardar'
      }
    })

    document.addEventListener('keydown', onKeydown)
    document.body.appendChild(overlay)
    input.focus()
  })
}

function renderCategoryRow(category) {
  const name = escapeHtml(category.name)

  return `
    <div
      class="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800"
      data-id="${category.id}"
      data-name="${name}"
    >
      <div class="min-w-0">
        <p class="truncate font-medium">${name}</p>
        <p class="truncate text-sm text-neutral-500 dark:text-neutral-400">${escapeHtml(category.slug)}</p>
      </div>
      <div class="flex shrink-0 gap-1">
        <button
          type="button"
          data-action="edit"
          title="Editar"
          class="rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          ${icon(Pencil, { class: 'h-4 w-4' })}
        </button>
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
  `
}

function renderSkeleton() {
  const row = `
    <div class="h-[68px] animate-pulse rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800">
      <div class="h-4 w-1/3 rounded bg-neutral-100 dark:bg-neutral-800"></div>
      <div class="mt-2 h-3 w-1/4 rounded bg-neutral-100 dark:bg-neutral-800"></div>
    </div>
  `
  return `<div class="grid gap-3">${row.repeat(4)}</div>`
}

function renderEmptyState() {
  return `
    <div class="flex flex-col items-center rounded-2xl border border-dashed border-neutral-300 px-6 py-16 text-center dark:border-neutral-700">
      <div class="inline-flex rounded-full bg-neutral-100 p-3 dark:bg-neutral-800">
        ${icon(Tag, { class: 'h-6 w-6 text-neutral-400 dark:text-neutral-500' })}
      </div>
      <p class="mt-4 text-neutral-500 dark:text-neutral-400">Todavía no hay categorías.</p>
    </div>
  `
}

function renderErrorState() {
  return `
    <div class="flex flex-col items-center rounded-2xl border border-red-200 px-6 py-16 text-center dark:border-red-900/50">
      <div class="inline-flex rounded-full bg-neutral-100 p-3 dark:bg-neutral-800">
        ${icon(TriangleAlert, { class: 'h-6 w-6 text-neutral-400 dark:text-neutral-500' })}
      </div>
      <p class="mt-4 text-neutral-500 dark:text-neutral-400">No se pudo cargar el listado de categorías.</p>
    </div>
  `
}

export async function adminCategoriasPage({ mount }) {
  mount.innerHTML = renderAdminShell({
    active: 'categorias',
    content: `
      <main class="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
        <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 class="text-2xl font-semibold tracking-tight">Categorías</h1>
          <button
            type="button"
            data-action="new"
            class="inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 dark:bg-white dark:text-neutral-900"
          >
            ${icon(Plus, { class: 'h-4 w-4' })}
            Nueva categoría
          </button>
        </div>

        <div id="lista">${renderSkeleton()}</div>
      </main>
    `,
  })

  attachAdminShellEvents(mount, {
    onLogout: async () => {
      await signOut()
      navigate(link('/admin/login'))
    },
  })

  const lista = mount.querySelector('#lista')
  let categories = []

  function renderList() {
    lista.innerHTML =
      categories.length === 0
        ? renderEmptyState()
        : `<div class="grid gap-3">${categories.map(renderCategoryRow).join('')}</div>`
  }

  function upsertLocal(category) {
    const others = categories.filter((c) => c.id !== category.id)
    categories = [...others, category].sort((a, b) => a.name.localeCompare(b.name))
  }

  mount.querySelector('[data-action="new"]').addEventListener('click', () => {
    categoryFormModal({
      title: 'Nueva categoría',
      onSubmit: async (name) => {
        const category = await createCategory({ name, slug: slugify(name) })
        upsertLocal(category)
        renderList()
        showToast('Categoría creada')
      },
    })
  })

  lista.addEventListener('click', async (event) => {
    const editButton = event.target.closest('[data-action="edit"]')
    const deleteButton = event.target.closest('[data-action="delete"]')

    if (editButton) {
      const { id } = editButton.closest('[data-id]').dataset
      const category = categories.find((c) => c.id === id)

      categoryFormModal({
        title: 'Editar categoría',
        initialName: category.name,
        onSubmit: async (name) => {
          const updated = await updateCategory(id, { name, slug: slugify(name) })
          upsertLocal(updated)
          renderList()
          showToast('Categoría actualizada')
        },
      })
      return
    }

    if (deleteButton) {
      const { id, name } = deleteButton.closest('[data-id]').dataset
      const productCount = await getCategoryProductCount(id).catch(() => 0)

      const confirmed = await confirmModal({
        title: `¿Eliminar "${name}"?`,
        description:
          productCount > 0
            ? `${productCount} producto${productCount === 1 ? '' : 's'} quedará${productCount === 1 ? '' : 'n'} sin categoría.`
            : 'Esta acción no se puede deshacer.',
        confirmLabel: 'Eliminar',
        destructive: true,
      })
      if (!confirmed) return

      deleteButton.disabled = true

      try {
        await deleteCategory(id)
        categories = categories.filter((c) => c.id !== id)
        renderList()
        showToast('Categoría eliminada')
      } catch (error) {
        console.error(error)
        showToast('No se pudo eliminar la categoría.', { type: 'error' })
        deleteButton.disabled = false
      }
    }
  })

  try {
    categories = await getCategories()
    renderList()
  } catch (error) {
    console.error(error)
    lista.innerHTML = renderErrorState()
  }
}
