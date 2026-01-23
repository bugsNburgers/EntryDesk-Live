import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExportEntries } from '@/components/events/export-entries'

export default async function EventEntriesPage({ params }: { params: { id: string } }) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch entries for this event
  // Join student, category, dojo via nested relations
  const { data: entries } = await supabase
    .from('entries')
    .select(`
        *,
        students(name, gender, rank, weight, dojos(name)),
        categories(name),
        event_days(name),
        profiles(full_name, email)
    `)
    .eq('event_id', id)
    // .eq('status', 'submitted') // Maybe we want to see drafts too? distinct logic usually
    .order('created_at', { ascending: false })

  // Flatten for export
  const exportData = entries?.map(e => ({
      Student: e.students?.name,
      Dojo: e.students?.dojos?.name,
      Category: e.categories?.name,
      Day: e.event_days?.name,
      Type: e.participation_type,
      Status: e.status,
      Coach: e.profiles?.full_name,
      Email: e.profiles?.email
  })) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-xl font-bold tracking-tight">Entries</h2>
            <p className="text-muted-foreground">Monitor participation.</p>
        </div>
        <ExportEntries data={exportData} />
      </div>

      <Card>
        <CardContent className="p-0">
             {entries && entries.length > 0 ? (
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Student</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Dojo</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Category</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Type</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {entries.map((entry) => (
                                <tr key={entry.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    {/* @ts-ignore */}
                                    <td className="p-4 align-middle font-medium">{entry.students?.name}</td>
                                    {/* @ts-ignore */}
                                    <td className="p-4 align-middle">{entry.students?.dojos?.name}</td>
                                    {/* @ts-ignore */}
                                    <td className="p-4 align-middle">{entry.categories?.name || '-'}</td>
                                    <td className="p-4 align-middle capitalize">{entry.participation_type}</td>
                                    <td className="p-4 align-middle">
                                         <span className={entry.status === 'submitted' ? "text-green-600 font-medium" : "text-yellow-600"}>
                                            {entry.status}
                                         </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             ) : (
                <div className="text-center py-8 text-muted-foreground">
                    No entries yet.
                </div>
             )}
        </CardContent>
      </Card>
    </div>
  )
}
