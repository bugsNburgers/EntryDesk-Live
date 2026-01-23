'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { addDays, format } from 'date-fns'

export async function createEvent(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const event_type = formData.get('event_type') as 'tournament' | 'seminar' | 'test'
  const location = formData.get('location') as string
  const start_date = formData.get('start_date') as string // YYYY-MM-DD
  const end_date = formData.get('end_date') as string // YYYY-MM-DD
  const is_public = formData.get('is_public') === 'on'

  // Insert Event
  const { data: event, error } = await supabase
    .from('events')
    .insert({
      title,
      description,
      event_type,
      location,
      start_date,
      end_date,
      is_public,
      organizer_id: user.id
    })
    .select()
    .single()

  if (error) {
    console.error(error)
    throw new Error('Failed to create event')
  }

  // Auto-generate Event Days if multi-day or single day
  if (event) {
      const start = new Date(start_date)
      const end = new Date(end_date)
      let current = start
      let dayCount = 1

      while (current <= end) {
          await supabase.from('event_days').insert({
              event_id: event.id,
              date: format(current, 'yyyy-MM-dd'),
              name: `Day ${dayCount}`
          })
          current = addDays(current, 1)
          dayCount++
      }
  }

  revalidatePath('/dashboard/events')
  return { success: true, eventId: event.id }
}
