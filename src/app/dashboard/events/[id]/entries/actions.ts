'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateEntryStatus(entryId: string, status: 'approved' | 'rejected') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Get entry and event to verify ownership
    const { data: entry } = await supabase
        .from('entries')
        .select('event_id, events(organizer_id)')
        .eq('id', entryId)
        .single()

    if (!entry) throw new Error('Entry not found')

    // @ts-ignore
    if (entry.events?.organizer_id !== user.id) {
        throw new Error('Unauthorized')
    }

    const { error } = await supabase
        .from('entries')
        .update({ status })
        .eq('id', entryId)

    if (error) throw new Error('Failed to update entry')

    revalidatePath(`/dashboard/events/${entry.event_id}/entries`)
    return { success: true }
}

export async function bulkUpdateEntryStatus(entryIds: string[], status: 'approved' | 'rejected') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')
    if (entryIds.length === 0) return { success: true }

    // Optimization: Check if all entries belong to events managed by this user
    // Ideally we filter the update by event ownership directly to be safe
    // UPDATE entries SET status = $status WHERE id IN $ids AND event_id IN (SELECT id FROM events WHERE organizer_id = $uid)
    
    // However, supabase-js query syntax:
    // We can fetch the events for these entries to verify, or do a subquery filter if possible.
    // Simpler approach for now: Get unique event_ids for these entries, check ownership.
    
    // Let's rely on filter logic during update if possible? 
    // Supabase simplified: verify first.
    
    // For large bulk, verification of ownership implies fetching.
    // "Select event_id from entries where id in ids"
    const { data: entries } = await supabase.from('entries').select('event_id, events(organizer_id)').in('id', entryIds)
    
    if (!entries || entries.some((e: any) => e.events?.organizer_id !== user.id)) {
        throw new Error('Unauthorized or some entries invalid')
    }

    const { error } = await supabase
        .from('entries')
        .update({ status })
        .in('id', entryIds)

    if (error) throw new Error('Failed to update entries')

    // Revalidate paths - potentially multiple if entries span events (unlikely here but good practice)
    const uniqueEventIds = Array.from(new Set(entries.map(e => e.event_id)))
    uniqueEventIds.forEach(eid => revalidatePath(`/dashboard/events/${eid}/entries`))

    return { success: true }
}
