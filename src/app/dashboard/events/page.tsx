import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateEventDialog } from '@/components/events/create-event-dialog'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function EventsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  // RLS ensures organizers only see their own events on this query logic if we add the filter
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('organizer_id', user.id)
    .order('start_date', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Events</h1>
            <p className="text-muted-foreground">Manage your tournaments and seminars.</p>
        </div>
        <CreateEventDialog />
      </div>

      <div className="grid gap-4">
        {events && events.length > 0 ? (
             events.map(event => (
                <Card key={event.id}>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                             <div>
                                <CardTitle>{event.title}</CardTitle>
                                <CardDescription>{new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}</CardDescription>
                             </div>
                             <div className="flex gap-2">
                                <span className="px-2 py-1 bg-secondary text-xs rounded-full capitalize">{event.event_type}</span>
                                {event.is_public && <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Public</span>}
                             </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground line-clamp-1 max-w-lg">{event.description}</p>
                        <div className="flex gap-2">
                            <Link href={`/dashboard/events/${event.id}`}>
                                <Button variant="outline">Manage</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
             ))
        ) : (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                 <p>No events found.</p>
                 <p className="text-sm">Create your first event to get started.</p>
            </div>
        )}
      </div>
    </div>
  )
}
