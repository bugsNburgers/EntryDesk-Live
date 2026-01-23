import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { ApplyButton } from '@/components/events/apply-button'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function EventBrowserPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch all public events
  // Also need to know if WE have applied to them.
  // Supabase doesn't support easy "left join with filter on joined table" in single query via JS SDK neatly for this specific structure
  // So we fetch events, then fetch our applications.
  
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('is_public', true)
    .order('start_date', { ascending: true })

  const { data: applications } = await supabase
    .from('event_applications')
    .select('event_id, status')
    .eq('coach_id', user.id)

  // Map applications to a lookup
  const appMap = new Map()
  applications?.forEach(app => {
      appMap.set(app.event_id, app.status)
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Browse Events</h1>
        <p className="text-muted-foreground">Find tournaments and seminars to attend.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events && events.length > 0 ? (
            events.map((event) => {
                const status = appMap.get(event.id)
                return (
                    <Card key={event.id} className="flex flex-col">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <span className="px-2 py-1 bg-secondary text-xs rounded-full capitalize mb-2 inline-block">{event.event_type}</span>
                                {status === 'approved' && <span className="text-xs font-bold text-green-600">Enter Now &rarr;</span>}
                            </div>
                            <CardTitle>{event.title}</CardTitle>
                            <CardDescription>{new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <p className="text-sm text-muted-foreground line-clamp-3">
                            {event.description || "No description provided."}
                            </p>
                        </CardContent>
                        <CardFooter className="flex justify-between items-center border-t pt-4">
                            <ApplyButton eventId={event.id} status={status} />
                             {status === 'approved' && (
                                <Link href={`/dashboard/entries?event=${event.id}`}>
                                    <Button variant="default">Manage Entries</Button>
                                </Link>
                            )}
                        </CardFooter>
                    </Card>
                )
            })
        ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                 <p>No public events available.</p>
            </div>
        )}
      </div>
    </div>
  )
}
