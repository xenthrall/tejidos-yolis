import { LockKeyhole, Mail, KeyRound, LoaderCircle, CircleAlert, ArrowLeft } from 'lucide'
import { signInWithPassword, getCurrentAdmin } from '../../lib/auth.js'
import { navigate, link } from '../../router/router.js'
import { icon } from '../../lib/icons.js'
import { renderThemeToggle, bindThemeToggle } from '../../lib/theme.js'

export async function adminLoginPage({ mount }) {
  const admin = await getCurrentAdmin()
  if (admin) {
    navigate(link('/admin/productos'))
    return
  }

  mount.innerHTML = `
    <main class="flex min-h-screen flex-col bg-neutral-50 px-4 dark:bg-neutral-900">
      <div class="flex justify-between py-4">
        <a href="${link('/')}" data-link class="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white">
          ${icon(ArrowLeft, { class: 'h-4 w-4' })}
          Volver a la tienda
        </a>
        ${renderThemeToggle()}
      </div>

      <div class="flex flex-1 items-center justify-center py-8">
        <div class="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <div class="mx-auto inline-flex rounded-full bg-neutral-100 p-3 dark:bg-neutral-800">
            ${icon(LockKeyhole, { class: 'h-5 w-5' })}
          </div>

          <h1 class="mt-4 text-center text-xl font-semibold">Panel administrativo</h1>
          <p class="mt-1 text-center text-sm text-neutral-500 dark:text-neutral-400">Inicia sesión para continuar</p>

          <form id="login-form" class="mt-6 flex flex-col gap-4">
            <label class="flex flex-col gap-1.5 text-sm font-medium">
              Correo
              <div class="flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 focus-within:border-neutral-900 dark:border-neutral-700 dark:focus-within:border-white">
                ${icon(Mail, { class: 'h-4 w-4 text-neutral-400' })}
                <input
                  type="email"
                  name="email"
                  required
                  autocomplete="email"
                  class="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </label>

            <label class="flex flex-col gap-1.5 text-sm font-medium">
              Contraseña
              <div class="flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 focus-within:border-neutral-900 dark:border-neutral-700 dark:focus-within:border-white">
                ${icon(KeyRound, { class: 'h-4 w-4 text-neutral-400' })}
                <input
                  type="password"
                  name="password"
                  required
                  autocomplete="current-password"
                  class="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </label>

            <p id="login-error" class="hidden items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-500">
              ${icon(CircleAlert, { class: 'h-4 w-4 shrink-0' })}
              <span></span>
            </p>

            <button
              type="submit"
              class="mt-2 flex items-center justify-center gap-2 rounded-lg bg-neutral-900 px-6 py-3 font-medium text-white hover:opacity-90 dark:bg-white dark:text-neutral-900"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    </main>
  `

  bindThemeToggle(mount)

  const form = mount.querySelector('#login-form')
  const errorEl = mount.querySelector('#login-error')
  const errorText = errorEl.querySelector('span')

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    errorEl.classList.add('hidden')
    errorEl.classList.remove('flex')

    const formData = new FormData(form)
    const email = formData.get('email')
    const password = formData.get('password')
    const submitButton = form.querySelector('button[type="submit"]')

    submitButton.disabled = true
    submitButton.innerHTML = `${icon(LoaderCircle, { class: 'h-4 w-4 animate-spin' })} Entrando…`

    try {
      await signInWithPassword(email, password)
      navigate(link('/admin/productos'))
    } catch (error) {
      errorText.textContent = error.message
      errorEl.classList.remove('hidden')
      errorEl.classList.add('flex')
      submitButton.disabled = false
      submitButton.textContent = 'Entrar'
    }
  })
}
