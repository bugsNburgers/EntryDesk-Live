'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function applyToEvent(eventId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check if already applied
  const { data: existing } = await supabase
    .from('event_applications')
    .select('id')
    .eq('event_id', eventId)
    .eq('coach_id', user.id)
    .single()

  if (existing) {
      return { success: false, message: 'Already applied' }
  }

  const { error } = await supabase
    .from('event_applications')
    .insert({
      event_id: eventId,
      coach_id: user.id
    })

  if (error) {
    console.error(error)
    throw new Error('Failed to apply to event')
  }

  revalidatePath('/dashboard/events-browser')
  return { success: true }
}
