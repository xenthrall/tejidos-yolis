import { TriangleAlert } from 'lucide'
import { icon } from './icons.js'
import { escapeHtml } from './dom.js'

// Imperative confirmation modal. Resolves true on confirm, false on
// cancel/backdrop click/Escape. Mounted on document.body so it works the
// same regardless of which page/mount called it.
export function confirmModal({
  title,
  description = '',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  destructive = false,
} = {}) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div')
    overlay.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
    overlay.innerHTML = `
      <div role="alertdialog" aria-modal="true" aria-labelledby="modal-title" class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-900">
        <div class="inline-flex rounded-full p-3 ${destructive ? 'bg-red-50 dark:bg-red-500/10' : 'bg-neutral-100 dark:bg-neutral-800'}">
          ${icon(TriangleAlert, { class: `h-5 w-5 ${destructive ? 'text-red-600 dark:text-red-500' : ''}` })}
        </div>
        <h2 id="modal-title" class="mt-4 text-lg font-semibold">${escapeHtml(title)}</h2>
        ${description ? `<p class="mt-2 text-sm text-neutral-500 dark:text-neutral-400">${escapeHtml(description)}</p>` : ''}
        <div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" data-action="cancel" class="rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800">
            ${escapeHtml(cancelLabel)}
          </button>
          <button
            type="button"
            data-action="confirm"
            class="rounded-lg px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 ${destructive ? 'bg-red-600' : 'bg-neutral-900 dark:bg-white dark:text-neutral-900'}"
          >
            ${escapeHtml(confirmLabel)}
          </button>
        </div>
      </div>
    `

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
    overlay.querySelector('[data-action="cancel"]').addEventListener('click', () => close(false))
    overlay.querySelector('[data-action="confirm"]').addEventListener('click', () => close(true))

    document.addEventListener('keydown', onKeydown)
    document.body.appendChild(overlay)
    overlay.querySelector('[data-action="confirm"]').focus()
  })
}
