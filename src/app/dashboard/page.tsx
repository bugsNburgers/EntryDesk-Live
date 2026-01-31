import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardPageHeader } from '@/components/dashboard/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    const role = profile?.role || 'coach'
    const name = profile?.full_name || user.email

    // Counts (for a “real” dashboard feel)
    const isOrganizer = role === 'organizer'

    const { count: eventsCount } = isOrganizer
        ? await supabase
            .from('events')
            .select('id', { count: 'exact', head: true })
            .eq('organizer_id', user.id)
        : { count: 0 }

    const { data: organizerEventIds } = isOrganizer
        ? await supabase.from('events').select('id').eq('organizer_id', user.id)
        : { data: [] as Array<{ id: string }> }

    const myEventIds = (organizerEventIds ?? []).map((e) => e.id)

    const { count: pendingApprovalsCount } = isOrganizer && myEventIds.length
        ? await supabase
            .from('event_applications')
            .select('id', { count: 'exact', head: true })
            .in('event_id', myEventIds)
            .eq('status', 'pending')
        : { count: 0 }

    const { count: dojosCount } = !isOrganizer
        ? await supabase
            .from('dojos')
            .select('id', { count: 'exact', head: true })
            .eq('coach_id', user.id)
        : { count: 0 }

    const { data: dojoIds } = !isOrganizer
        ? await supabase.from('dojos').select('id').eq('coach_id', user.id)
        : { data: [] as Array<{ id: string }> }

    const myDojoIds = (dojoIds ?? []).map((d) => d.id)

    const { count: studentsCount } = !isOrganizer && myDojoIds.length
        ? await supabase
            .from('students')
            .select('id', { count: 'exact', head: true })
            .in('dojo_id', myDojoIds)
        : { count: 0 }

    const { count: entriesCount } = !isOrganizer
        ? await supabase
            .from('entries')
            .select('id', { count: 'exact', head: true })
            .eq('coach_id', user.id)
        : { count: 0 }

    return (
        <div className="space-y-6">
            <DashboardPageHeader
                title={`Welcome back, ${name}`}
                description={isOrganizer ? 'Manage events, approvals, and exports.' : 'Manage your dojos, students, and entries.'}
                actions={
                    isOrganizer ? (
                        <Link href="/dashboard/events">
                            <Button>Manage Events</Button>
                        </Link>
                    ) : (
                        <Link href="/dashboard/events-browser">
                            <Button>Browse Events</Button>
                        </Link>
                    )
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {isOrganizer ? (
                    <>
                        <Link href="/dashboard/events" className="group block focus:outline-none">
                            <Card className="cursor-pointer transition-shadow group-hover:shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">Events</CardTitle>
                                    <CardDescription>Created by you</CardDescription>
                                </CardHeader>
                                <CardContent className="flex items-end justify-between">
                                    <div className="text-3xl font-semibold tracking-tight">{eventsCount ?? 0}</div>
                                    <Badge variant="secondary">Organizer</Badge>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/dashboard/approvals" className="group block focus:outline-none">
                            <Card className="cursor-pointer transition-shadow group-hover:shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">Pending approvals</CardTitle>
                                    <CardDescription>Coach applications</CardDescription>
                                </CardHeader>
                                <CardContent className="flex items-end justify-between">
                                    <div className="text-3xl font-semibold tracking-tight">{pendingApprovalsCount ?? 0}</div>
                                    <Badge variant={(pendingApprovalsCount ?? 0) > 0 ? 'warning' : 'secondary'}>Queue</Badge>
                                </CardContent>
                            </Card>
                        </Link>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Quick actions</CardTitle>
                                <CardDescription>Common organizer tasks</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-2">
                                <Link href="/dashboard/events" className="text-sm font-medium hover:underline">Create / manage events →</Link>
                                <Link href="/dashboard/approvals" className="text-sm font-medium hover:underline">Review approvals →</Link>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <>
                        <Link href="/dashboard/dojos" className="group block focus:outline-none">
                            <Card className="cursor-pointer transition-shadow group-hover:shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">Dojos</CardTitle>
                                    <CardDescription>You manage</CardDescription>
                                </CardHeader>
                                <CardContent className="flex items-end justify-between">
                                    <div className="text-3xl font-semibold tracking-tight">{dojosCount ?? 0}</div>
                                    <Badge variant="secondary">Coach</Badge>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/dashboard/students" className="group block focus:outline-none">
                            <Card className="cursor-pointer transition-shadow group-hover:shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">Students</CardTitle>
                                    <CardDescription>In your dojos</CardDescription>
                                </CardHeader>
                                <CardContent className="flex items-end justify-between">
                                    <div className="text-3xl font-semibold tracking-tight">{studentsCount ?? 0}</div>
                                    <Badge variant="secondary">Roster</Badge>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/dashboard/entries" className="group block focus:outline-none">
                            <Card className="cursor-pointer transition-shadow group-hover:shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">Entries</CardTitle>
                                    <CardDescription>Submitted or draft</CardDescription>
                                </CardHeader>
                                <CardContent className="flex items-end justify-between">
                                    <div className="text-3xl font-semibold tracking-tight">{entriesCount ?? 0}</div>
                                    <Badge variant="secondary">Entries</Badge>
                                </CardContent>
                            </Card>
                        </Link>
                    </>
                )}
            </div>
        </div>
    )
}
