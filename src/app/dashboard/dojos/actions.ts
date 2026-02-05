'use server'

import { revalidatePath } from 'next/cache'
import { requireRole } from '@/lib/auth/require-role'

export async function createDojo(formData: FormData) {
  const { supabase, user } = await requireRole('coach')

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
  const { supabase, user } = await requireRole('coach')

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
  const { supabase, user } = await requireRole('coach')

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
