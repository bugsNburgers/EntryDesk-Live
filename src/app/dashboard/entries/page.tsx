import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Calendar, ArrowRight, CheckCircle2 } from 'lucide-react'

export default async function EntriesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Get Approved Events
  const { data: applications } = await supabase
    .from('event_applications')
    .select(`
        event_id, 
        events (
            id, 
            title, 
            start_date, 
            location, 
            description
        )
    `)
    .eq('coach_id', user.id)
    .eq('status', 'approved')
  
  const approvedEvents = applications?.map(app => app.events) || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Entry Management</h1>
        <p className="text-muted-foreground">Select an event to manage your team's participation.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* @ts-ignore */}
        {approvedEvents.length > 0 ? (
            /* @ts-ignore */
            approvedEvents.map((event: any) => (
                <Card key={event.id} className="flex flex-col">
                    <CardHeader>
                        <CardTitle>{event.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                             <Calendar className="h-4 w-4" />
                             {new Date(event.start_date).toLocaleDateString()}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-end gap-4">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                            {event.description || 'No description provided.'}
                        </p>
                        <div className="flex items-center justify-between mt-auto">
                            <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Approved
                            </span>
                            <Button asChild size="sm">
                                <Link href={`/dashboard/entries/${event.id}`}>
                                    Manage Entries <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))
        ) : (
             <div className="col-span-full text-center py-20 border-2 border-dashed rounded-xl text-muted-foreground">
                <p>No approved events found.</p>
                <Button variant="link" asChild className="mt-2">
                    <Link href="/dashboard/events-browser">Browse Events</Link>
                </Button>
             </div>
        )}
      </div>
    </div>
  )
}
