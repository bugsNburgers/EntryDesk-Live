'use server'

import { revalidatePath } from 'next/cache'
import { requireRole } from '@/lib/auth/require-role'

export async function applyToEvent(eventId: string) {
  const { supabase, user } = await requireRole('coach')

  // Ensure we have a profile row for FK references (coach_id -> profiles.id)
  // This is needed because Supabase Auth does not auto-create rows in public.profiles.
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    console.error(profileError)
    throw new Error('Failed to load profile')
  }

  if (!profile) {
    const email = user.email
    if (!email) {
      throw new Error('Missing email on user; cannot create profile')
    }

    // Best-effort display name for UI.
    // Supabase may store name in user_metadata depending on provider.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const meta = (user as any)?.user_metadata as any
    const fullName = (meta?.full_name || meta?.name || meta?.display_name || email.split('@')[0]) as string

    const { error: createProfileError } = await supabase
      .from('profiles')
      .insert({ id: user.id, email, full_name: fullName })

    if (createProfileError) {
      console.error(createProfileError)
      throw new Error('Failed to create profile')
    }
  }

  // Check if already applied
  const { data: existing, error: existingError } = await supabase
    .from('event_applications')
    .select('id')
    .eq('event_id', eventId)
    .eq('coach_id', user.id)
    .maybeSingle()

  if (existingError) {
    console.error(existingError)
    throw new Error('Failed to check existing application')
  }

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
    // Unique constraint (event_id, coach_id) can still race; treat as already applied.
    // Postgres unique violation code: 23505
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pgCode = (error as any)?.code
    if (pgCode === '23505') {
      return { success: false, message: 'Already applied' }
    }

    console.error(error)
    throw new Error('Failed to apply to event')
  }

  revalidatePath('/dashboard/events-browser')
  return { success: true }
}
