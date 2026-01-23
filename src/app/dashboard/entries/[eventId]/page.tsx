import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { submitEntries } from "@/app/dashboard/entries/actions"
import { EntryRow } from '@/components/entries/entry-row'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function EventEntriesPage({ params }: { params: { eventId: string } }) {
  const supabase = await createClient()
  const { eventId } = await params

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch Event Details
  const { data: event } = await supabase.from('events').select('*').eq('id', eventId).single()
  if (!event) notFound()

  // Verify access (optional but good)
  const { data: app } = await supabase
    .from('event_applications')
    .select('status')
    .eq('event_id', eventId)
    .eq('coach_id', user.id)
    .single()
  
  if (!app || app.status !== 'approved') {
      return <div>Access Denied. You are not approved for this event.</div>
  }

  // Fetch Data
  const studentsRes = await supabase.from('students').select('*, dojos(*)').order('name')
  // Filter for coach's students via RLS logic (implicit) but explicit join is safer if RLS wasn't perfect, but here we trust RLS for 'students' table.
  const students = studentsRes.data || []

  const categoriesRes = await supabase.from('categories').select('*').eq('event_id', eventId)
  const categories = categoriesRes.data || []

  const daysRes = await supabase.from('event_days').select('*').eq('event_id', eventId)
  const eventDays = daysRes.data || []

  const entriesRes = await supabase.from('entries').select('*').eq('event_id', eventId).eq('coach_id', user.id)
  const entries = entriesRes.data || []

  // Map Entries
  const entryMap = new Map()
  entries.forEach(e => entryMap.set(e.student_id, e))

  return (
    <div className="space-y-6 h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex flex-col gap-4 flex-none">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Link href="/dashboard/entries" className="hover:text-foreground flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" /> Back to Events
            </Link>
        </div>
        <div className="flex justify-between items-center">
             <div>
                <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
                <p className="text-muted-foreground">Manage entries for your team.</p>
             </div>
             <form action={submitEntries.bind(null, eventId)}>
                 <Button size="lg">
                    <Save className="mr-2 h-4 w-4" /> Submit All Drafts
                 </Button>
             </form>
        </div>
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col">
        <CardContent className="p-0 flex-1 overflow-auto">
             <table className="w-full caption-bottom text-sm text-left">
                <thead className="[&_tr]:border-b sticky top-0 bg-background z-10 shadow-sm">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground min-w-[150px]">Student</th>
                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground min-w-[200px]">Category</th>
                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground min-w-[150px]">Day</th>
                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Type</th>
                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-center">Status</th>
                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0 bg-white">
                     {students.map(student => (
                         <EntryRow 
                            key={student.id} 
                            student={student} 
                            entry={entryMap.get(student.id)} 
                            categories={categories}
                            eventDays={eventDays}
                            eventId={eventId}
                         />
                     ))}
                </tbody>
            </table>
        </CardContent>
      </Card>
      <div className="text-xs text-muted-foreground text-right flex-none">
          Showing {students.length} students.
      </div>
    </div>
  )
}
