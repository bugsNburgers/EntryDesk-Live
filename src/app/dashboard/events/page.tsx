import { requireRole } from '@/lib/auth/require-role'
import { CreateEventDialog } from '@/components/events/create-event-dialog'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { DashboardPageHeader } from '@/components/dashboard/page-header'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, ArrowRight, Globe, Lock } from 'lucide-react'

export default async function EventsPage() {
  const { supabase, user } = await requireRole(['organizer', 'admin'], { redirectTo: '/dashboard' })

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('organizer_id', user.id)
    .order('start_date', { ascending: false })

  return (
    <div className="space-y-4">
      <DashboardPageHeader
        title="Events"
        description="Create, publish, and manage your events."
        actions={<CreateEventDialog />}
      />

      <div className="rounded-2xl border border-black/5 bg-gradient-to-b from-background/95 to-background/70 shadow-[0_12px_30px_-22px_rgba(0,0,0,0.25)] dark:border-white/10 dark:bg-background/40 dark:from-background/60 dark:to-background/30 dark:shadow-black/40">
        {events && events.length > 0 ? (
          <div className="divide-y divide-border">
            {events.map(event => (
              <Link
                key={event.id}
                href={`/dashboard/events/${event.id}`}
                className="group flex items-center justify-between gap-4 p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{event.title}</span>
                      <Badge className="capitalize text-[10px] px-1.5 py-0" variant="secondary">{event.event_type}</Badge>
                      {event.is_public ? (
                        <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-500">
                          <Globe className="h-2.5 w-2.5" /> Public
                        </span>
                      ) : (
                        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                          <Lock className="h-2.5 w-2.5" /> Private
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>{new Date(event.start_date).toLocaleDateString()} – {new Date(event.end_date).toLocaleDateString()}</span>
                      {event.location && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            <MapPin className="h-2.5 w-2.5" />
                            {event.location}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    Manage
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <Calendar className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
            <p className="text-sm font-medium">No events found</p>
            <p className="mt-1 text-xs text-muted-foreground">Create your first event to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}
