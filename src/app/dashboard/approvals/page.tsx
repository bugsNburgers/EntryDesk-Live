import { createClient } from '@/lib/supabase/server'
import { ApprovalButtons } from '@/components/approvals/approval-buttons'
import { DashboardPageHeader } from '@/components/dashboard/page-header'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CheckSquare, Calendar } from 'lucide-react'

export default async function ApprovalsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // 1. Get my event IDs
    const { data: events } = await supabase
        .from('events')
        .select('id')
        .eq('organizer_id', user.id)

    const eventIds = events?.map(e => e.id) || []

    if (eventIds.length === 0) {
        return (
            <div className="space-y-4">
                <DashboardPageHeader
                    title="Approvals"
                    description="Review coach requests to join your events."
                />
                <div className="rounded-2xl border border-dashed border-black/10 bg-muted/20 py-8 text-center dark:border-white/10">
                    <Calendar className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                    <p className="text-sm font-medium">No events yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">Create an event to start receiving coach requests.</p>
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
        <div className="space-y-4">
            <DashboardPageHeader
                title="Approvals"
                description={`${applications?.length || 0} pending requests`}
            />

            <div className="rounded-2xl border border-black/5 bg-gradient-to-b from-background/95 to-background/70 shadow-[0_12px_30px_-22px_rgba(0,0,0,0.25)] dark:border-white/10 dark:bg-background/40 dark:from-background/60 dark:to-background/30 dark:shadow-black/40">
                {applications && applications.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Event</TableHead>
                                <TableHead>Coach</TableHead>
                                <TableHead className="hidden sm:table-cell">Email</TableHead>
                                <TableHead className="hidden md:table-cell">Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {applications.map((app) => (
                                <TableRow key={app.id}>
                                    {/* @ts-ignore */}
                                    <TableCell className="font-medium text-xs">{app.events?.title}</TableCell>
                                    {/* @ts-ignore */}
                                    <TableCell className="text-xs">{app.profiles?.full_name || app.profiles?.email || '—'}</TableCell>
                                    {/* @ts-ignore */}
                                    <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">{app.profiles?.email || '—'}</TableCell>
                                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{new Date(app.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        <ApprovalButtons applicationId={app.id} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="py-8 text-center">
                        <CheckSquare className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                        <p className="text-sm font-medium">All clear</p>
                        <p className="mt-1 text-xs text-muted-foreground">No pending approvals right now.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
