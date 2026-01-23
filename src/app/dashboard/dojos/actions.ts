'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createDojo(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const name = formData.get('name') as string

  const { error } = await supabase
    .from('dojos')
    .insert({
      name,
      coach_id: user.id
    })

  if (error) {
    throw new Error('Failed to create dojo')
  }

  revalidatePath('/dashboard/dojos')
  return { success: true }
}

export async function updateDojo(dojoId: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name = formData.get('name') as string

  const { error } = await supabase
    .from('dojos')
    .update({ name })
    .eq('id', dojoId)
    .eq('coach_id', user.id) // Security check

  if (error) {
     throw new Error('Failed to update dojo')
  }

  revalidatePath('/dashboard/dojos')
  return { success: true }
}

export async function deleteDojo(dojoId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { error } = await supabase
        .from('dojos')
        .delete()
        .eq('id', dojoId)
        .eq('coach_id', user.id) // Security check
    
    if (error) {
        throw new Error('Failed to delete dojo')
    }

    revalidatePath('/dashboard/dojos')
    return { success: true }
}
