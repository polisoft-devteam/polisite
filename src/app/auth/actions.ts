"use server"

import { revalidatePath } from "next/cache"

import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function signOut() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()

  // Server Components cached the signed-in header; drop it so the page re-renders signed out.
  revalidatePath("/", "layout")
}
