'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function updateApplicationStatus(applicationId: string, status: 'approved' | 'rejected') {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Security: Ensure the event belongs to this organizer
    // We can do this with a complex RLS policy (already have "Organizers manage applications")
    // or by doing an explicit join check if RLS is too loose.
    // Our RLS: "exists (select 1 from events where events.id = event_applications.event_id and events.organizer_id = auth.uid())"
    // This protects UPDATES too.

  // Fetch event_id to revalidate the correct page
  const { data: updated, error } = await supabase
    .from('event_applications')
    .update({ status })
    .eq('id', applicationId)
    .select('event_id')
    .single()

  if (error) {
    console.error(error)
    throw new Error('Failed to update application')
  }

  revalidatePath('/dashboard/approvals')
  if (updated) {
       revalidatePath(`/dashboard/events/${updated.event_id}/approvals`)
  }
  return { success: true }
}
