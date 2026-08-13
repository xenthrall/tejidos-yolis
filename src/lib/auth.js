import { supabase } from './supabase.js'
import { navigate, link } from '../router/router.js'

// Supabase's own client reads this same URL hash to finish an email/password
// confirmation link and then clears it — but only once the network round
// trip inside its `_initialize()` resolves. Reading it here, synchronously
// at module load, wins that race so pages can still tell what kind of link
// was just followed and show a one-time confirmation toast.
let authRedirectType = new URLSearchParams(window.location.hash.slice(1)).get('type')

export function consumeAuthRedirectType() {
  const type = authRedirectType
  authRedirectType = null
  return type
}

export async function signInWithPassword(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentAdmin() {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) return null

  return {
    id: session.user.id,
    email: session.user.email,
    displayName: session.user.user_metadata?.display_name ?? '',
  }
}

// Re-runs the password sign-in as a lightweight identity check before letting
// the admin change their email or password.
export async function verifyPassword(password) {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) throw new Error('No hay sesión activa.')

  const { error } = await supabase.auth.signInWithPassword({
    email: session.user.email,
    password,
  })
  if (error) throw new Error('La contraseña actual no es correcta.')
}

export async function updateDisplayName(displayName) {
  const { error } = await supabase.auth.updateUser({ data: { display_name: displayName } })
  if (error) throw error
}

export async function updateEmail(newEmail) {
  const { error } = await supabase.auth.updateUser(
    { email: newEmail },
    { emailRedirectTo: `${window.location.origin}${link('/admin/configuracion')}` }
  )
  if (error) throw error
}

export async function updatePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}

export function withAdminGuard(view) {
  return async (ctx) => {
    const admin = await getCurrentAdmin()

    if (!admin) {
      navigate(link('/admin/login'))
      return
    }

    await view({ ...ctx, admin })
  }
}
