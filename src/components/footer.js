import { Heart, LockKeyhole } from 'lucide'
import { link } from '../router/router.js'
import { icon } from '../lib/icons.js'

export function renderFooter() {
  return `
    <footer class="border-t border-neutral-200 dark:border-neutral-800">
      <div class="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-8 text-sm text-neutral-500 sm:flex-row sm:justify-between sm:px-6 dark:text-neutral-400">
        <p class="flex items-center gap-1.5">
          Hecho con ${icon(Heart, { class: 'h-4 w-4 fill-red-500 text-red-500' })} por
          <a
            href="https://hello.tequia.dev/"
            target="_blank"
            rel="noopener"
            class="font-medium text-neutral-700 hover:underline dark:text-neutral-300"
          >
            Tequia
          </a>
        </p>

        <a href="${link('/admin/login')}" data-link class="flex items-center gap-1.5 hover:underline">
          ${icon(LockKeyhole, { class: 'h-4 w-4' })}
          Panel administrativo
        </a>
      </div>
    </footer>
  `
}
