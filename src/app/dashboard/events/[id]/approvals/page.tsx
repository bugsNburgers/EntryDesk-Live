import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ApprovalButtons } from '@/components/approvals/approval-buttons'
import { notFound, redirect } from 'next/navigation'

export default async function EventApprovalsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { id } = await params

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify ownership of event
  const { data: event } = await supabase
    .from('events')
    .select('title, organizer_id')
    .eq('id', id)
    .single()

  if (!event || event.organizer_id !== user.id) {
      return notFound()
  }

  // Get applications for this event
  const { data: applications } = await supabase
    .from('event_applications')
    .select('*, profiles(full_name, email)')
    .eq('event_id', id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Approvals</h2>
        <p className="text-muted-foreground">Manage coach requests for {event.title}.</p>
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
                                    <td className="p-4 align-middle font-medium">{app.profiles?.full_name}</td>
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
                <div className="text-center py-8 text-muted-foreground">
                    No pending approvals for this event.
                </div>
             )}
        </CardContent>
      </Card>
    </div>
  )
}
