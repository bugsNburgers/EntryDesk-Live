import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateEventDialog } from '@/components/events/create-event-dialog'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { DashboardPageHeader } from '@/components/dashboard/page-header'
import { Badge } from '@/components/ui/badge'

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
      <DashboardPageHeader
        title="Events"
        description="Create, publish, and manage your events."
        actions={<CreateEventDialog />}
      />

      <div className="grid gap-3">
        {events && events.length > 0 ? (
          events.map(event => (
            <Card key={event.id} className="relative hover:shadow-sm transition-shadow cursor-pointer">
              <Link
                href={`/dashboard/events/${event.id}`}
                aria-label={`Manage event ${event.title}`}
                className="absolute inset-0 z-10 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle className="text-base">{event.title}</CardTitle>
                    <CardDescription>
                      {new Date(event.start_date).toLocaleDateString()} – {new Date(event.end_date).toLocaleDateString()}
                      {event.location ? ` • ${event.location}` : ''}
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="capitalize" variant="secondary">{event.event_type}</Badge>
                    {event.is_public ? <Badge variant="success">Public</Badge> : <Badge variant="outline">Private</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground line-clamp-2 max-w-2xl">
                  {event.description || 'No description provided.'}
                </p>
                <div className="relative z-20 flex gap-2">
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
