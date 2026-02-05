import { requireRole } from '@/lib/auth/require-role'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, Shield, Swords, Medal, Building2, AlertCircle, XCircle } from "lucide-react"
import Link from 'next/link'

export default async function EventOverviewPage({ params }: { params: { id: string } }) {
    const { id } = await params
    const { supabase } = await requireRole(['organizer', 'admin'], { redirectTo: '/dashboard' })

    // Fetch all valid entries (no drafts) from the view for analysis
    const { data: entries } = await supabase
        .from('organizer_entries_view')
        .select('*')
        .eq('event_id', id)
        .neq('status', 'draft')

    // Fetch pending coach applications
    const { count: pendingApprovals } = await supabase
        .from('event_applications')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', id)
        .eq('status', 'pending')

    // Fetch approved coach applications (approved to participate)
    const { count: approvedCoaches } = await supabase
        .from('event_applications')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', id)
        .eq('status', 'approved')

    const { data: approvedCoachRows } = await supabase
        .from('event_applications')
        .select('id, created_at, profiles(full_name, email)')
        .eq('event_id', id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(8)

    // Compute Stats
    const totalEntries = entries?.length || 0

    const statusStats = {
        approved: entries?.filter(e => e.status === 'approved').length || 0,
        submitted: entries?.filter(e => e.status === 'submitted').length || 0,
        rejected: entries?.filter(e => e.status === 'rejected').length || 0,
    }

    const submittedCoachesMap = new Map<string, string>()
    entries
        ?.filter(e => e.status === 'submitted')
        .forEach((e: any) => {
            const coachId = e.coach_id as string | undefined
            const email = (e.coach_email as string | undefined) || ''
            const name = (e.coach_name as string | undefined) || email.split('@')?.[0] || email || '—'
            if (coachId && !submittedCoachesMap.has(coachId)) submittedCoachesMap.set(coachId, name)
        })
    const submittedCoachNames = Array.from(submittedCoachesMap.values())
    const submittedCoachPreview = submittedCoachNames.slice(0, 3)
    const submittedCoachMore = submittedCoachNames.length - submittedCoachPreview.length
    const submittedCoachSummary =
        submittedCoachPreview.length > 0
            ? `Coaches: ${submittedCoachPreview.join(', ')}${submittedCoachMore > 0 ? ` +${submittedCoachMore} more` : ''}`
            : 'No submissions yet'

    const typeStats = {
        kata: entries?.filter(e => e.participation_type === 'kata').length || 0,
        kumite: entries?.filter(e => e.participation_type === 'kumite').length || 0,
        both: entries?.filter(e => e.participation_type === 'both').length || 0,
    }

    const genderStats = {
        male: entries?.filter(e => e.student_gender === 'male').length || 0,
        female: entries?.filter(e => e.student_gender === 'female').length || 0,
    }

    // Top Dojos
    const dojoCounts: Record<string, number> = {}
    entries?.forEach(e => {
        const name = e.dojo_name || 'Unknown'
        dojoCounts[name] = (dojoCounts[name] || 0) + 1
    })

    const topDojos = Object.entries(dojoCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)

    const distinctDojosCount = Object.keys(dojoCounts).length

    return (
        <div className="space-y-6">
            {/* Top-level Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                <Link href={`/dashboard/events/${id}/entries`} className="group block h-full focus:outline-none">
                    <Card className="h-full cursor-pointer transition-shadow group-hover:shadow-sm">
                        <CardHeader className="flex min-h-[52px] flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="min-w-0 truncate text-sm font-medium">Total Entries</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalEntries}</div>
                            <p className="text-xs text-muted-foreground">Across {distinctDojosCount} dojos</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href={`/dashboard/events/${id}/approvals?status=pending`} className="group block h-full focus:outline-none">
                    <Card className="h-full cursor-pointer transition-shadow group-hover:shadow-sm">
                        <CardHeader className="flex min-h-[52px] flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="min-w-0 truncate text-sm font-medium">Pending Approvals</CardTitle>
                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{pendingApprovals || 0}</div>
                            <p className="text-xs text-muted-foreground">Coach requests</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href={`/dashboard/events/${id}/approvals?status=approved`} className="group block h-full focus:outline-none">
                    <Card className="h-full cursor-pointer transition-shadow group-hover:shadow-sm">
                        <CardHeader className="flex min-h-[52px] flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="min-w-0 truncate text-sm font-medium">Approved Coaches</CardTitle>
                            <Shield className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">{approvedCoaches || 0}</div>
                            <p className="text-xs text-muted-foreground">Cleared to enter</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href={`/dashboard/events/${id}/entries?status=approved`} className="group block h-full focus:outline-none">
                    <Card className="h-full cursor-pointer transition-shadow group-hover:shadow-sm">
                        <CardHeader className="flex min-h-[52px] flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="min-w-0 truncate text-sm font-medium">Approved Entries</CardTitle>
                            <Medal className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">{statusStats.approved}</div>
                            <p className="text-xs text-muted-foreground">Ready for event</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href={`/dashboard/events/${id}/entries?status=submitted`} className="group block h-full focus:outline-none">
                    <Card className="h-full cursor-pointer transition-shadow group-hover:shadow-sm">
                        <CardHeader className="flex min-h-[52px] flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="min-w-0 truncate text-sm font-medium">Submitted</CardTitle>
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{statusStats.submitted}</div>
                            <p className="text-xs text-muted-foreground truncate">{submittedCoachSummary}</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href={`/dashboard/events/${id}/entries?status=rejected`} className="group block h-full focus:outline-none">
                    <Card className="h-full cursor-pointer transition-shadow group-hover:shadow-sm">
                        <CardHeader className="flex min-h-[52px] flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="min-w-0 truncate text-sm font-medium">Rejected Entries</CardTitle>
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{statusStats.rejected}</div>
                            <p className="text-xs text-muted-foreground">Needs changes</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Main Stats Area - Discipline & Gender */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                                    <Swords className="h-4 w-4" /> Participation
                                </h4>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <span>Kata</span>
                                            <span className="font-medium">{typeStats.kata}</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-secondary overflow-hidden">
                                            <div className="h-full bg-blue-500" style={{ width: `${totalEntries ? (typeStats.kata / totalEntries) * 100 : 0}%` }} />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <span>Kumite</span>
                                            <span className="font-medium">{typeStats.kumite}</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-secondary overflow-hidden">
                                            <div className="h-full bg-red-500" style={{ width: `${totalEntries ? (typeStats.kumite / totalEntries) * 100 : 0}%` }} />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <span>Both</span>
                                            <span className="font-medium">{typeStats.both}</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-secondary overflow-hidden">
                                            <div className="h-full bg-purple-500" style={{ width: `${totalEntries ? (typeStats.both / totalEntries) * 100 : 0}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                                    <Users className="h-4 w-4" /> Demographics
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center text-blue-700 font-bold">M</div>
                                            <span className="text-sm">Male</span>
                                        </div>
                                        <span className="font-bold">{genderStats.male}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded bg-pink-100 flex items-center justify-center text-pink-700 font-bold">F</div>
                                            <span className="text-sm">Female</span>
                                        </div>
                                        <span className="font-bold">{genderStats.female}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Top Dojos */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" /> Top Dojos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topDojos.length > 0 ? topDojos.map(([name, count], i) => (
                                <div key={name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                                            {i + 1}
                                        </div>
                                        <div className="font-medium text-sm">{name}</div>
                                    </div>
                                    <div className="text-sm font-bold">{count}</div>
                                </div>
                            )) : (
                                <p className="text-sm text-muted-foreground">No data yet.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Approved coaches</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {approvedCoachRows && approvedCoachRows.length > 0 ? (
                            <div className="space-y-3">
                                {approvedCoachRows.map((row: any) => {
                                    const email = row.profiles?.email as string | undefined
                                    const displayName = (row.profiles?.full_name || email?.split('@')?.[0] || email || '—') as string
                                    return (
                                        <div key={row.id} className="flex items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="truncate text-sm font-medium">{displayName}</div>
                                                <div className="truncate text-xs text-muted-foreground">{email || '—'}</div>
                                            </div>
                                            <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                                                approved
                                            </span>
                                        </div>
                                    )
                                })}
                                {approvedCoaches && approvedCoaches > approvedCoachRows.length ? (
                                    <div className="pt-2 text-sm text-muted-foreground">
                                        +{approvedCoaches - approvedCoachRows.length} more
                                    </div>
                                ) : null}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No approved coaches yet.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
