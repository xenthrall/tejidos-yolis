import { signInWithPassword, getCurrentAdmin } from '../../lib/auth.js'
import { navigate, link } from '../../router/router.js'

export async function adminLoginPage({ mount }) {
  const admin = await getCurrentAdmin()
  if (admin) {
    navigate(link('/admin/productos'))
    return
  }

  mount.innerHTML = `
    <main class="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 class="text-2xl font-semibold">Iniciar sesión</h1>

      <form id="login-form" class="mt-6 flex flex-col gap-4">
        <label class="flex flex-col gap-1 text-sm">
          Correo
          <input type="email" name="email" required autocomplete="email" class="rounded-lg border px-3 py-2" />
        </label>

        <label class="flex flex-col gap-1 text-sm">
          Contraseña
          <input type="password" name="password" required autocomplete="current-password" class="rounded-lg border px-3 py-2" />
        </label>

        <p id="login-error" class="hidden text-sm text-red-600"></p>

        <button type="submit" class="mt-2 rounded-lg bg-black px-6 py-3 text-white hover:opacity-80">
          Entrar
        </button>
      </form>
    </main>
  `

  const form = mount.querySelector('#login-form')
  const errorEl = mount.querySelector('#login-error')

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    errorEl.classList.add('hidden')

    const formData = new FormData(form)
    const email = formData.get('email')
    const password = formData.get('password')
    const submitButton = form.querySelector('button[type="submit"]')

    submitButton.disabled = true
    submitButton.textContent = 'Entrando…'

    try {
      await signInWithPassword(email, password)
      navigate(link('/admin/productos'))
    } catch (error) {
      errorEl.textContent = error.message
      errorEl.classList.remove('hidden')
      submitButton.disabled = false
      submitButton.textContent = 'Entrar'
    }
  })
}
