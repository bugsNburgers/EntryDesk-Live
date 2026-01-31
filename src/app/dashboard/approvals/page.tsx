import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ApprovalButtons } from '@/components/approvals/approval-buttons'
import { DashboardPageHeader } from '@/components/dashboard/page-header'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

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
                <DashboardPageHeader
                    title="Approvals"
                    description="Review coach requests to join your events."
                />
                <div className="rounded-xl border-2 border-dashed bg-muted/10 py-12 text-center text-muted-foreground">
                    <p className="font-medium text-foreground">No events yet</p>
                    <p className="text-sm">Create an event to start receiving coach requests.</p>
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
            <DashboardPageHeader
                title="Approvals"
                description="Review coach requests to join your events."
            />

            <Card>
                <CardHeader>
                    <CardTitle>Pending Requests</CardTitle>
                    <CardDescription>{applications?.length || 0} requests waiting.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {applications && applications.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Event</TableHead>
                                    <TableHead>Coach</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {applications.map((app) => (
                                    <TableRow key={app.id}>
                                        {/* @ts-ignore */}
                                        <TableCell className="font-medium">{app.events?.title}</TableCell>
                                        {/* @ts-ignore */}
                                        <TableCell>{app.profiles?.full_name || app.profiles?.email || '—'}</TableCell>
                                        {/* @ts-ignore */}
                                        <TableCell className="text-muted-foreground">{app.profiles?.email || '—'}</TableCell>
                                        <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <ApprovalButtons applicationId={app.id} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="py-10 text-center text-muted-foreground">
                            <p className="font-medium text-foreground">All clear</p>
                            <p className="text-sm">No pending approvals right now.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
