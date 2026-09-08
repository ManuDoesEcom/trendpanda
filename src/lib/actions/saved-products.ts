"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

const DEFAULT_COLLECTION = "Default"

export interface SavedProductRow {
  id: string
  product_id: string
  collection_name: string
  notes: string | null
  created_at: string
}

export async function getSavedProductRows(): Promise<SavedProductRow[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from("saved_products")
    .select("id, product_id, collection_name, notes, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) return []

  return data
}

export async function isProductSaved(productId: string): Promise<boolean> {
  const rows = await getSavedProductRows()
  return rows.some((row) => row.product_id === productId)
}

export async function toggleSaveProduct(
  productId: string
): Promise<{ saved: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { saved: false, error: "You must be logged in to save products." }
  }

  const { data: existing } = await supabase
    .from("saved_products")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .eq("collection_name", DEFAULT_COLLECTION)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase.from("saved_products").delete().eq("id", existing.id)
    if (error) return { saved: true, error: error.message }
    revalidatePath("/saved")
    revalidatePath(`/products/${productId}`)
    return { saved: false }
  }

  const { error } = await supabase.from("saved_products").insert({
    user_id: user.id,
    product_id: productId,
    collection_name: DEFAULT_COLLECTION,
  })

  if (error) return { saved: false, error: error.message }

  revalidatePath("/saved")
  revalidatePath(`/products/${productId}`)
  return { saved: true }
}
