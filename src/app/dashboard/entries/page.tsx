import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EventFilter } from '@/components/entries/event-filter'
import { Button } from '@/components/ui/button'
import { submitEntries, upsertEntry, deleteEntry } from "@/app/dashboard/entries/actions"
import { EntryRow } from '@/components/entries/entry-row'

export default async function EntriesPage({
    searchParams,
  }: {
    searchParams: { [key: string]: string | string[] | undefined }
  }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // 1. Get Approved Events for Filter
  // Complex query: Get events where I have an approved application
  const { data: applications } = await supabase
    .from('event_applications')
    .select('event_id, events(title)')
    .eq('coach_id', user.id)
    .eq('status', 'approved')
  
  const approvedEvents = applications?.map(app => ({
      // @ts-ignore
      id: app.event_id, title: app.events?.title 
  })) || []

  // 2. Determine Selected Event
  const selectedEventId = searchParams['event'] as string
  
  let students = []
  let categories = []
  let entries = []
  let eventDays = []

  if (selectedEventId) {
      // Fetch data for the grid
      const studentsRes = await supabase.from('students').select('*, dojos(*)').order('name')
      // Note: In real app, we filter students by search query too
      
      // We need to fetch ONLY my students. RLS handles it conceptually but for safety/performance we can filter via dojo logic if needed.
      // Assuming RLS works as tested before.
      students = studentsRes.data || []

      const categoriesRes = await supabase.from('categories').select('*').eq('event_id', selectedEventId)
      categories = categoriesRes.data || []

      const daysRes = await supabase.from('event_days').select('*').eq('event_id', selectedEventId)
      eventDays = daysRes.data || []

      const entriesRes = await supabase.from('entries').select('*').eq('event_id', selectedEventId).eq('coach_id', user.id)
      entries = entriesRes.data || []
  }

  // Create a map of studentId -> Entry for easy lookup
  const entryMap = new Map()
  entries.forEach(e => entryMap.set(e.student_id, e))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Entry Management</h1>
        <p className="text-muted-foreground">Select an event to manage your team's participation.</p>
        <div className="flex justify-between items-center">
             <EventFilter events={approvedEvents} />
             {selectedEventId && (
                 <form action={submitEntries.bind(null, selectedEventId)}>
                     <Button>Submit All Drafts</Button>
                 </form>
             )}
        </div>
      </div>

      {selectedEventId ? (
          <Card>
            <CardContent className="p-0">
                <div className="relative w-full overflow-auto max-h-[70vh]">
                    <div className="p-4 text-sm text-muted-foreground">
                        Showing {students.length} students. Use the rows to sign them up.
                    </div>
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
                                    eventId={selectedEventId}
                                 />
                             ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
          </Card>
      ) : (
          <div className="text-center py-20 border-2 border-dashed rounded-xl text-muted-foreground">
              Please select an approved event above to start managing entries.
          </div>
      )}
    </div>
  )
}
