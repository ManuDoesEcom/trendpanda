"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export interface AuthActionState {
  error: string | null
}

export async function login(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "")
  const password = String(formData.get("password") ?? "")

  if (!email || !password) {
    return { error: "Please enter your email and password." }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  redirect("/dashboard")
}

export async function signup(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "")
  const password = String(formData.get("password") ?? "")
  const fullName = String(formData.get("fullName") ?? "")

  if (!email || !password) {
    return { error: "Please enter your email and password." }
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  })

  if (error) {
    return { error: error.message }
  }

  redirect("/dashboard")
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/")
}
