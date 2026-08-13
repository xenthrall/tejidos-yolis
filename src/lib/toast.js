import { CircleCheck, CircleAlert } from 'lucide'
import { icon } from './icons.js'
import { escapeHtml } from './dom.js'

let container = null

function getContainer() {
  if (container && document.body.contains(container)) return container

  container = document.createElement('div')
  container.className =
    'fixed inset-x-4 bottom-4 z-50 flex flex-col items-stretch gap-2 sm:inset-x-auto sm:right-4 sm:items-end'
  document.body.appendChild(container)
  return container
}

// Mounted on document.body (outside #app) so a toast survives the SPA
// navigation that usually follows the action it's confirming.
export function showToast(message, { type = 'success' } = {}) {
  const isError = type === 'error'

  const toast = document.createElement('div')
  toast.className = `flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg transition duration-200 ${
    isError ? 'bg-red-600 text-white' : 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
  }`
  toast.innerHTML = `${icon(isError ? CircleAlert : CircleCheck, { class: 'h-4 w-4 shrink-0' })}<span>${escapeHtml(message)}</span>`

  getContainer().appendChild(toast)

  setTimeout(() => {
    toast.classList.add('opacity-0')
    setTimeout(() => toast.remove(), 200)
  }, 3000)
}
