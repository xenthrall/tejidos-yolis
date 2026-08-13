import { supabase } from './supabase.js'

const ADMIN_PRODUCT_COLUMNS =
  'id, name, slug, description, price, stock, image_path, is_published, category_id, category:categories(name)'

const PRODUCT_IMAGES_BUCKET = 'product-images'

export async function getCategories() {
  const { data, error } = await supabase.from('categories').select('id, name, slug').order('name')
  if (error) throw error
  return data
}

export async function getAllProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(ADMIN_PRODUCT_COLUMNS)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getProductById(id) {
  const { data, error } = await supabase
    .from('products')
    .select(ADMIN_PRODUCT_COLUMNS)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createProduct(values) {
  const { data, error } = await supabase.from('products').insert(values).select().single()
  if (error) throw error
  return data
}

export async function updateProduct(id, values) {
  const { data, error } = await supabase.from('products').update(values).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteProduct(id, imagePath) {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error

  if (imagePath) {
    await deleteProductImage(imagePath).catch((error) => {
      console.error('No se pudo eliminar la imagen del producto:', error)
    })
  }
}

export async function uploadProductImage(file) {
  const extension = file.name.includes('.') ? file.name.split('.').pop() : 'jpg'
  const path = `${crypto.randomUUID()}.${extension}`

  const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).upload(path, file)
  if (error) throw error

  return path
}

export async function deleteProductImage(path) {
  if (!path) return
  const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([path])
  if (error) throw error
}
