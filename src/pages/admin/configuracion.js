import { UserRound, Mail, KeyRound, LoaderCircle, CircleAlert } from 'lucide'
import { renderAdminShell, attachAdminShellEvents } from '../../components/admin-sidebar.js'
import {
  signOut,
  verifyPassword,
  updateDisplayName,
  updateEmail,
  updatePassword,
  consumeAuthRedirectType,
} from '../../lib/auth.js'
import { navigate, link } from '../../router/router.js'
import { icon } from '../../lib/icons.js'
import { escapeHtml } from '../../lib/dom.js'
import { showToast } from '../../lib/toast.js'

const INPUT_CLASS =
  'w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:focus:border-white'

function renderSection({ id, icon: sectionIcon, title, description, body }) {
  return `
    <section class="rounded-2xl border border-neutral-200 p-5 sm:p-6 dark:border-neutral-800">
      <div class="flex items-start gap-3">
        <div class="inline-flex shrink-0 rounded-xl bg-neutral-100 p-2.5 dark:bg-neutral-800">
          ${icon(sectionIcon, { class: 'h-4 w-4' })}
        </div>
        <div>
          <h2 class="font-semibold">${title}</h2>
          <p class="text-sm text-neutral-500 dark:text-neutral-400">${description}</p>
        </div>
      </div>

      <form id="${id}" class="mt-5 flex flex-col gap-4">
        ${body}
      </form>
    </section>
  `
}

function renderFieldError() {
  return `
    <p data-error class="hidden items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-500">
      ${icon(CircleAlert, { class: 'h-4 w-4 shrink-0' })}
      <span></span>
    </p>
  `
}

function renderSaveButton(label) {
  return `
    <button
      type="submit"
      class="inline-flex items-center justify-center gap-2 self-start rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 dark:bg-white dark:text-neutral-900"
    >
      ${label}
    </button>
  `
}

function renderContent(admin) {
  return `
    <main class="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
      <h1 class="text-2xl font-semibold tracking-tight">Configuración</h1>
      <p class="mt-1 text-neutral-500 dark:text-neutral-400">Gestiona los datos de tu cuenta de administrador.</p>

      <div class="mt-8 flex flex-col gap-6">
        ${renderSection({
          id: 'profile-form',
          icon: UserRound,
          title: 'Perfil',
          description: 'Este nombre se muestra en el panel en lugar de tu correo.',
          body: `
            <label class="flex flex-col gap-1.5 text-sm font-medium">
              Nombre para mostrar
              <input
                type="text"
                name="display_name"
                maxlength="60"
                placeholder="Tu nombre"
                value="${escapeHtml(admin.displayName)}"
                class="${INPUT_CLASS}"
              />
            </label>
            ${renderFieldError()}
            ${renderSaveButton('Guardar nombre')}
          `,
        })}

        ${renderSection({
          id: 'email-form',
          icon: Mail,
          title: 'Correo electrónico',
          description: `Correo actual: ${escapeHtml(admin.email)}`,
          body: `
            <label class="flex flex-col gap-1.5 text-sm font-medium">
              Nuevo correo electrónico
              <input type="email" name="email" required autocomplete="email" class="${INPUT_CLASS}" />
            </label>
            <label class="flex flex-col gap-1.5 text-sm font-medium">
              Contraseña actual
              <input type="password" name="current_password" required autocomplete="current-password" class="${INPUT_CLASS}" />
            </label>
            ${renderFieldError()}
            ${renderSaveButton('Cambiar correo')}
          `,
        })}

        ${renderSection({
          id: 'password-form',
          icon: KeyRound,
          title: 'Contraseña',
          description: 'Usa una contraseña de al menos 6 caracteres.',
          body: `
            <label class="flex flex-col gap-1.5 text-sm font-medium">
              Contraseña actual
              <input type="password" name="current_password" required autocomplete="current-password" class="${INPUT_CLASS}" />
            </label>
            <label class="flex flex-col gap-1.5 text-sm font-medium">
              Nueva contraseña
              <input type="password" name="new_password" required minlength="6" autocomplete="new-password" class="${INPUT_CLASS}" />
            </label>
            <label class="flex flex-col gap-1.5 text-sm font-medium">
              Confirmar nueva contraseña
              <input type="password" name="confirm_password" required minlength="6" autocomplete="new-password" class="${INPUT_CLASS}" />
            </label>
            ${renderFieldError()}
            ${renderSaveButton('Cambiar contraseña')}
          `,
        })}
      </div>
    </main>
  `
}

function bindForm(mount, id, onSubmit) {
  const form = mount.querySelector(`#${id}`)
  const errorEl = form.querySelector('[data-error]')
  const errorText = errorEl.querySelector('span')
  const submitButton = form.querySelector('button[type="submit"]')
  const defaultLabel = submitButton.textContent

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    errorEl.classList.add('hidden')
    errorEl.classList.remove('flex')

    const formData = new FormData(form)

    submitButton.disabled = true
    submitButton.innerHTML = `${icon(LoaderCircle, { class: 'h-4 w-4 animate-spin' })} Guardando…`

    try {
      await onSubmit(formData, form)
    } catch (error) {
      errorText.textContent = error.message || 'Ocurrió un error inesperado.'
      errorEl.classList.remove('hidden')
      errorEl.classList.add('flex')
    } finally {
      submitButton.disabled = false
      submitButton.textContent = defaultLabel
    }
  })
}

export async function adminConfiguracionPage({ mount, admin }) {
  mount.innerHTML = renderAdminShell({
    active: 'configuracion',
    content: renderContent(admin),
  })

  attachAdminShellEvents(mount, {
    onLogout: async () => {
      await signOut()
      navigate(link('/admin/login'))
    },
  })

  if (consumeAuthRedirectType() === 'email_change') {
    showToast('Correo confirmado correctamente')
  }

  bindForm(mount, 'profile-form', async (formData) => {
    const displayName = formData.get('display_name').trim()
    await updateDisplayName(displayName)
    showToast('Nombre actualizado')
  })

  bindForm(mount, 'email-form', async (formData, form) => {
    const email = formData.get('email').trim()
    const currentPassword = formData.get('current_password')

    await verifyPassword(currentPassword)
    await updateEmail(email)
    form.reset()
    showToast('Revisa tu correo para confirmar el cambio')
  })

  bindForm(mount, 'password-form', async (formData, form) => {
    const currentPassword = formData.get('current_password')
    const newPassword = formData.get('new_password')
    const confirmPassword = formData.get('confirm_password')

    if (newPassword !== confirmPassword) {
      throw new Error('Las contraseñas nuevas no coinciden.')
    }

    await verifyPassword(currentPassword)
    await updatePassword(newPassword)
    form.reset()
    showToast('Contraseña actualizada')
  })
}
