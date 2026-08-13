import { supabase } from './supabase.js'

const PRODUCT_COLUMNS = 'id, name, slug, description, price, stock, image_path, category:categories(name, slug)'

export async function getPublishedProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_COLUMNS)
    .eq('is_published', true)
    .order('name')

  if (error) throw error
  return data
}

export async function getProductBySlug(slug) {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_COLUMNS)
    .eq('is_published', true)
    .eq('slug', slug)
    .maybeSingle()

  if (error) throw error
  return data
}
