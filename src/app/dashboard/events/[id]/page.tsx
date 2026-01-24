import { createClient } from '@/lib/supabase/server'

export default async function EventOverviewPage({ params }: { params: { id: string } }) {
  const { id } = await params
  const supabase = await createClient()

  // Get total entries
  const { count: entriesCount } = await supabase
    .from('entries')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', id)

  // Get pending approvals (coach applications)
  const { count: pendingCount } = await supabase
    .from('event_applications')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', id)
    .eq('status', 'pending')

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
            <h3 className="text-lg font-semibold">Total Entries</h3>
            <p className="text-3xl font-bold mt-2">{entriesCount || 0}</p>
        </div>
         <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
            <h3 className="text-lg font-semibold">Pending Approvals</h3>
            <p className="text-3xl font-bold mt-2 text-yellow-600">{pendingCount || 0}</p>
        </div>
    </div>
  )
}
