import { supabase } from './supabase.js'

const PRODUCT_IMAGES_BUCKET = 'product-images'

export function getProductImageUrl(imagePath) {
  if (!imagePath) return null

  const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(imagePath)
  return data.publicUrl
}
