import { supabase } from './supabase.js'

export async function getCategories() {
  const { data, error } = await supabase.from('categories').select('id, name, slug').order('name')
  if (error) throw error
  return data
}

export async function createCategory(values) {
  const { data, error } = await supabase.from('categories').insert(values).select().single()
  if (error) throw error
  return data
}

export async function updateCategory(id, values) {
  const { data, error } = await supabase.from('categories').update(values).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteCategory(id) {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
}

// Used to warn before deleting: products keep their row (category_id is set
// to null via ON DELETE SET NULL) but silently lose their category.
export async function getCategoryProductCount(id) {
  const { count, error } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', id)

  if (error) throw error
  return count ?? 0
}
