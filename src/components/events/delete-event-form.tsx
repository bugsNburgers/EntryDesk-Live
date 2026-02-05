'use client'

import { deleteEvent } from '@/app/dashboard/events/[id]/actions'
import { PendingButton } from '@/components/ui/pending-button'

export function DeleteEventForm({ eventId }: { eventId: string }) {
    return (
        <form
            action={deleteEvent}
            onSubmit={(e) => {
                const ok = window.confirm('Delete this event? This cannot be undone.')
                if (!ok) e.preventDefault()
            }}
        >
            <input type="hidden" name="eventId" value={eventId} />
            <PendingButton variant="destructive" size="sm" pendingText="Deleting...">
                Delete Event
            </PendingButton>
        </form>
    )
}
