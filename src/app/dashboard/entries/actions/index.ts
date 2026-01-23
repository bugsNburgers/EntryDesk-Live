'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function upsertEntry(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const event_id = formData.get('event_id') as string
  const student_id = formData.get('student_id') as string
  const category_id = formData.get('category_id') as string
  const event_day_id = formData.get('event_day_id') as string
  const participation_type = formData.get('participation_type') as string

  // Upsert logic: If entry exists for (event_id, student_id), update it.
  // We need to check if one exists first or rely on unique constraint?
  // Schema doesn't enforce one entry per student per event strictly unique index yet, but logic implies it.
  // Let's assume one entry row per student per event.
  
  const { data: existing } = await supabase
    .from('entries')
    .select('id')
    .eq('event_id', event_id)
    .eq('student_id', student_id)
    .single()

  const payload = {
      event_id,
      coach_id: user.id,
      student_id,
      category_id: category_id || null, // handle 'null' string from selects if any
      event_day_id: event_day_id || null,
      participation_type: participation_type || null,
      status: 'draft' // Always reset to draft if edited? Or keep current status? Usually editing puts back to draft.
  }

  let error;
  if (existing) {
       const res = await supabase.from('entries').update(payload).eq('id', existing.id)
       error = res.error
  } else {
       const res = await supabase.from('entries').insert(payload)
       error = res.error
  }

  if (error) {
    console.error(error)
    throw new Error('Failed to save entry')
  }

  revalidatePath(`/dashboard/entries`)
  revalidatePath(`/dashboard/entries/${event_id}`)
  return { success: true }
}

export async function submitEntries(eventId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Update all 'draft' entries for this event and coach to 'submitted'
    const { error } = await supabase
        .from('entries')
        .update({ status: 'submitted' })
        .eq('event_id', eventId)
        .eq('coach_id', user.id)
        .eq('status', 'draft')

    if (error) throw new Error('Failed to submit entries')
    
    revalidatePath(`/dashboard/entries`)
    revalidatePath(`/dashboard/entries/${eventId}`)
    return { success: true }
}

export async function deleteEntry(entryId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { error } = await supabase.from('entries').delete().eq('id', entryId).eq('coach_id', user.id)
     if (error) throw new Error('Failed to delete entry')
    
    revalidatePath(`/dashboard/entries`)
    return { success: true }
}
