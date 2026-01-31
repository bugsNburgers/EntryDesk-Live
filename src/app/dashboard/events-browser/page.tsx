import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { ApplyButton } from '@/components/events/apply-button'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DashboardPageHeader } from '@/components/dashboard/page-header'
import { Badge } from '@/components/ui/badge'

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
            <DashboardPageHeader
                title="Browse Events"
                description="Find tournaments and seminars to attend."
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {events && events.length > 0 ? (
                    events.map((event) => {
                        const status = appMap.get(event.id)
                        return (
                            <Card key={event.id} className="flex flex-col hover:shadow-sm transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between gap-3">
                                        <Badge className="capitalize" variant="secondary">{event.event_type}</Badge>
                                        {status === 'approved' ? <Badge variant="success">Approved</Badge> : null}
                                    </div>
                                    <CardTitle className="text-base">{event.title}</CardTitle>
                                    <CardDescription>
                                        {new Date(event.start_date).toLocaleDateString()} – {new Date(event.end_date).toLocaleDateString()}
                                    </CardDescription>
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
                    <div className="col-span-full rounded-xl border-2 border-dashed bg-muted/10 py-14 text-center text-muted-foreground">
                        <p className="font-medium text-foreground">No public events available</p>
                        <p className="text-sm">Check back later.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
