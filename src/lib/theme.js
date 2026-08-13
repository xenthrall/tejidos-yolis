import { Sun, Moon } from 'lucide'
import { icon } from './icons.js'

const STORAGE_KEY = 'nativa-theme'

function systemPrefersDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function getTheme() {
  return localStorage.getItem(STORAGE_KEY) ?? (systemPrefersDark() ? 'dark' : 'light')
}

export function setTheme(theme) {
  localStorage.setItem(STORAGE_KEY, theme)
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export function renderThemeToggle(className = '') {
  return `
    <button type="button" data-action="toggle-theme" aria-label="Cambiar tema" class="rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 ${className}">
      <span class="block dark:hidden">${icon(Sun, { class: 'h-5 w-5' })}</span>
      <span class="hidden dark:block">${icon(Moon, { class: 'h-5 w-5' })}</span>
    </button>
  `
}

export function bindThemeToggle(root) {
  root.querySelectorAll('[data-action="toggle-theme"]').forEach((button) => {
    button.addEventListener('click', () => {
      setTheme(getTheme() === 'dark' ? 'light' : 'dark')
    })
  })
}
