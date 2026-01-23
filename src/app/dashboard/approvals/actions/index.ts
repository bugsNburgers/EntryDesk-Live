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

  const { error } = await supabase
    .from('event_applications')
    .update({ status })
    .eq('id', applicationId)

  if (error) {
    console.error(error)
    throw new Error('Failed to update application')
  }

  revalidatePath('/dashboard/approvals')
  return { success: true }
}
