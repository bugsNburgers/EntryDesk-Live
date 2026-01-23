import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ApprovalButtons } from '@/components/approvals/approval-buttons'

export default async function ApprovalsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch pending applications for events owned by this organizer
  // Complex filtered join needed
  // "Get applications where event_id is in (my events)"
  
  // 1. Get my event IDs
  const { data: events } = await supabase
    .from('events')
    .select('id')
    .eq('organizer_id', user.id)
  
  const eventIds = events?.map(e => e.id) || []

  if (eventIds.length === 0) {
       return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Approvals</h1>
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                 <p>No events found.</p>
            </div>
        </div>
       )
  }

  // 2. Get applications
  const { data: applications } = await supabase
    .from('event_applications')
    .select('*, profiles(full_name, email), events(title)')
    .in('event_id', eventIds)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Approvals</h1>
        <p className="text-muted-foreground">Review coach requests to join your events.</p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Pending Requests</CardTitle>
            <CardDescription>{applications?.length || 0} requests waiting.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
             {applications && applications.length > 0 ? (
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Event</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Coach</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Email</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Date</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {applications.map((app) => (
                                <tr key={app.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    {/* @ts-ignore */}
                                    <td className="p-4 align-middle font-medium">{app.events?.title}</td>
                                    {/* @ts-ignore */}
                                    <td className="p-4 align-middle">{app.profiles?.full_name}</td>
                                    {/* @ts-ignore */}
                                    <td className="p-4 align-middle">{app.profiles?.email}</td>
                                    <td className="p-4 align-middle">{new Date(app.created_at).toLocaleDateString()}</td>
                                    <td className="p-4 align-middle text-right">
                                        <ApprovalButtons applicationId={app.id} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             ) : (
                <div className="text-center py-12 text-muted-foreground">
                    <p>No pending approvals.</p>
                </div>
             )}
        </CardContent>
      </Card>
    </div>
  )
}
