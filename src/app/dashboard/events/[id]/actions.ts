'use server'

import { requireRole } from '@/lib/auth/require-role'
import { redirect } from 'next/navigation'

export async function deleteEvent(formData: FormData) {
    const eventIdValue = formData.get('eventId')
    const eventId = typeof eventIdValue === 'string' ? eventIdValue : ''

    if (!eventId) {
        throw new Error('Missing eventId')
    }

    const { supabase, user } = await requireRole(['organizer', 'admin'], { redirectTo: '/dashboard' })

    const { data: event, error: eventError } = await supabase
        .from('events')
        .select('id, organizer_id')
        .eq('id', eventId)
        .single()

    if (eventError || !event) {
        throw new Error('Event not found')
    }

    if (event.organizer_id !== user.id) {
        throw new Error('Not authorized to delete this event')
    }

    const { error: deleteError } = await supabase.from('events').delete().eq('id', eventId)

    if (deleteError) {
        throw new Error(deleteError.message)
    }

    redirect('/dashboard/events')
}
