import { supabase } from './supabase.js'
import { navigate, link } from '../router/router.js'

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

  return { id: session.user.id, email: session.user.email }
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
