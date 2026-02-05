import { createClient } from '@/lib/supabase/server'
import { DashboardPageHeader } from '@/components/dashboard/page-header'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, Calendar, Users, ClipboardList, LayoutGrid, CheckSquare, FolderOpen, ListTodo, MapPin, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ApplyButton } from '@/components/events/apply-button'

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


    const isOrganizer = role === 'organizer'

    const today = new Date().toISOString().slice(0, 10)

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

    // Fetch Public events for Coach
    const { data: publicEvents } = !isOrganizer
        ? await supabase
            .from('events')
            .select('*')
            .eq('is_public', true)
            .order('start_date', { ascending: true })
        : { data: [] }

    // Fetch Applications for Coach
    const { data: applications } = !isOrganizer && user
        ? await supabase
            .from('event_applications')
            .select('event_id, status')
            .eq('coach_id', user.id)
        : { data: [] }

    const { data: approvedApplications } = !isOrganizer && user
        ? await supabase
            .from('event_applications')
            .select(`
                event_id,
                status,
                events (
                    id,
                    title,
                    start_date,
                    end_date,
                    location,
                    event_type
                )
            `)
            .eq('coach_id', user.id)
            .eq('status', 'approved')
        : { data: [] }

    const appMap = new Map()
    applications?.forEach(app => {
        appMap.set(app.event_id, app.status)
    })

    const approvedEvents = (approvedApplications ?? [])
        // @ts-ignore
        .map((app) => app.events)
        // @ts-ignore
        .filter((event) => event && event.end_date >= today)

    const activePublicEvents = (publicEvents ?? [])
        .filter((event: any) => event.end_date >= today)
        .filter((event: any) => appMap.get(event.id) !== 'approved')

    const getStatusIcon = (status: string | undefined) => {
        if (status === 'approved') return <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-500" />
        if (status === 'pending') return <Clock className="h-3 w-3 text-amber-600 dark:text-amber-500" />
        if (status === 'rejected') return <XCircle className="h-3 w-3 text-red-600 dark:text-red-500" />
        return null
    }

    const getStatusText = (status: string | undefined) => {
        if (status === 'approved') return 'Approved'
        if (status === 'pending') return 'Pending'
        if (status === 'rejected') return 'Rejected'
        return null
    }

    return (
        <div className="space-y-8">
            <DashboardPageHeader
                title={`Welcome, ${name?.split(' ')[0] ?? 'User'}`}
                description={isOrganizer ? 'Manage events, approvals, and exports.' : 'Manage your dojos, students, and entries.'}
                actions={
                    isOrganizer ? (
                        <Link href="/dashboard/events">
                            <Button size="sm" className="shadow-lg shadow-primary/20 rounded-full">Manage Events</Button>
                        </Link>
                    ) : (
                        null
                    )
                }
            />

            {/* Bento Grid Metrics */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {isOrganizer ? (
                    <>
                        {/* Events Tile */}
                        <Link
                            href="/dashboard/events"
                            className="group relative overflow-hidden rounded-2xl border border-black/5 bg-gradient-to-b from-background/95 to-background/60 p-6 shadow-[0_12px_30px_-22px_rgba(0,0,0,0.25)] transition-all hover:bg-background/80 hover:shadow-[0_18px_40px_-26px_rgba(0,0,0,0.30)] hover:-translate-y-1 dark:border-white/10 dark:bg-background/40 dark:from-background/60 dark:to-background/30 dark:shadow-black/40"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Calendar className="h-24 w-24" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 text-muted-foreground mb-4">
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                        <Calendar className="h-4 w-4" />
                                    </div>
                                    <span className="text-xs font-semibold uppercase tracking-wider">Events</span>
                                </div>
                                <div className="text-3xl font-bold tabular-nums text-foreground">{eventsCount ?? 0}</div>
                                <div className="mt-1 text-xs text-muted-foreground font-medium">Active tournaments</div>
                            </div>
                        </Link>

                        {/* Pending Approvals Tile */}
                        <Link
                            href="/dashboard/approvals"
                            className="group relative overflow-hidden rounded-2xl border border-black/5 bg-gradient-to-b from-background/95 to-background/60 p-6 shadow-[0_12px_30px_-22px_rgba(0,0,0,0.25)] transition-all hover:bg-background/80 hover:shadow-[0_18px_40px_-26px_rgba(0,0,0,0.30)] hover:-translate-y-1 dark:border-white/10 dark:bg-background/40 dark:from-background/60 dark:to-background/30 dark:shadow-black/40"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <CheckSquare className="h-24 w-24" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 text-muted-foreground mb-4">
                                    <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                                        <CheckSquare className="h-4 w-4" />
                                    </div>
                                    <span className="text-xs font-semibold uppercase tracking-wider">Approvals</span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold tabular-nums text-foreground">{pendingApprovalsCount ?? 0}</span>
                                    {(pendingApprovalsCount ?? 0) > 0 && (
                                        <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-500 ring-1 ring-inset ring-amber-500/20">
                                            Pending
                                        </span>
                                    )}
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground font-medium">Coach applications</div>
                            </div>
                        </Link>

                        {/* Quick Actions - spans 2 cols */}
                        <div className="col-span-1 sm:col-span-2 rounded-2xl border border-black/10 bg-gradient-to-b from-background/90 to-background/50 p-6 backdrop-blur-sm shadow-md shadow-black/5 dark:border-white/10 dark:shadow-black/40">
                            <div className="flex items-center gap-3 text-muted-foreground mb-6">
                                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                                    <ListTodo className="h-4 w-4" />
                                </div>
                                <span className="text-xs font-semibold uppercase tracking-wider">Quick Actions</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Link href="/dashboard/events">
                                    <div className="flex items-center gap-3 p-3 rounded-xl border border-black/10 bg-white/5 shadow-sm shadow-black/5 hover:bg-primary/5 hover:border-primary/20 transition-colors group cursor-pointer dark:border-white/10 dark:shadow-black/40">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                            <Calendar className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm text-foreground">Create Event</div>
                                            <div className="text-xs text-muted-foreground">Start a new tournament</div>
                                        </div>
                                    </div>
                                </Link>
                                <Link href="/dashboard/approvals">
                                    <div className="flex items-center gap-3 p-3 rounded-xl border border-black/10 bg-white/5 shadow-sm shadow-black/5 hover:bg-orange-500/5 hover:border-orange-500/20 transition-colors group cursor-pointer dark:border-white/10 dark:shadow-black/40">
                                        <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                                            <CheckSquare className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm text-foreground">Review Queue</div>
                                            <div className="text-xs text-muted-foreground">Process applications</div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Dojos Tile */}
                        <Link
                            href="/dashboard/dojos"
                            className="group relative overflow-hidden rounded-2xl border border-black/10 bg-gradient-to-b from-background/90 to-background/50 p-6 shadow-md shadow-black/5 transition-all hover:bg-background/70 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-1 dark:border-white/10 dark:shadow-black/40"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <LayoutGrid className="h-24 w-24" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 text-muted-foreground mb-4">
                                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                        <LayoutGrid className="h-4 w-4" />
                                    </div>
                                    <span className="text-xs font-semibold uppercase tracking-wider">Dojos</span>
                                </div>
                                <div className="text-3xl font-bold tabular-nums text-foreground">{dojosCount ?? 0}</div>
                                <div className="mt-1 text-xs text-muted-foreground font-medium">Managed dojos</div>
                            </div>
                        </Link>

                        {/* Students Tile */}
                        <Link
                            href="/dashboard/students"
                            className="group relative overflow-hidden rounded-2xl border border-black/10 bg-gradient-to-b from-background/90 to-background/50 p-6 shadow-md shadow-black/5 transition-all hover:bg-background/70 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-1 dark:border-white/10 dark:shadow-black/40"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Users className="h-24 w-24" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 text-muted-foreground mb-4">
                                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                                        <Users className="h-4 w-4" />
                                    </div>
                                    <span className="text-xs font-semibold uppercase tracking-wider">Students</span>
                                </div>
                                <div className="text-3xl font-bold tabular-nums text-foreground">{studentsCount ?? 0}</div>
                                <div className="mt-1 text-xs text-muted-foreground font-medium">Total registered</div>
                            </div>
                        </Link>

                        {/* Entries Tile */}
                        <Link
                            href="/dashboard/entries"
                            className="group relative overflow-hidden rounded-2xl border border-black/10 bg-gradient-to-b from-background/90 to-background/50 p-6 shadow-md shadow-black/5 transition-all hover:bg-background/70 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-1 dark:border-white/10 dark:shadow-black/40"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <ClipboardList className="h-24 w-24" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 text-muted-foreground mb-4">
                                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                                        <ClipboardList className="h-4 w-4" />
                                    </div>
                                    <span className="text-xs font-semibold uppercase tracking-wider">Entries</span>
                                </div>
                                <div className="text-3xl font-bold tabular-nums text-foreground">{entriesCount ?? 0}</div>
                                <div className="mt-1 text-xs text-muted-foreground font-medium">Tournament entries</div>
                            </div>
                        </Link>

                        {/* Browse Events Tile (Now just a consistent tile, maybe keep it or merge intent later, but user said remove separate section)
                            User said "remove browse events separate section and add it in the home itself"
                            The tile was there, but the section below is what they want. 
                            I'll keep this tile as a stats summary maybe? Or remove it since the full list is below?
                            "add it down these ui elements as browse events"
                            I think keeping the tile is fine as a quick link, but the full list is requested below.
                        */}
                        <Link
                            href="/dashboard/events-browser"
                            className="group relative overflow-hidden rounded-2xl border border-black/10 bg-gradient-to-b from-background/90 to-background/50 p-6 shadow-md shadow-black/5 transition-all hover:bg-background/70 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-1 dark:border-white/10 dark:shadow-black/40"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <FolderOpen className="h-24 w-24" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 text-muted-foreground mb-4">
                                    <div className="p-2 rounded-lg bg-pink-500/10 text-pink-500">
                                        <FolderOpen className="h-4 w-4" />
                                    </div>
                                    <span className="text-xs font-semibold uppercase tracking-wider">Public Events</span>
                                </div>
                                <div className="text-3xl font-bold tabular-nums text-foreground">{activePublicEvents?.length ?? 0}</div>
                                <div className="mt-1 text-xs text-muted-foreground font-medium">Available now</div>
                            </div>
                        </Link>
                    </>
                )}
            </div>

            {/* Coach: Approved + Active Events (home) */}
            {!isOrganizer && (
                <div className="pt-4 space-y-8">
                    <div>
                        <div className="flex items-center justify-between gap-3 mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-500">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                                <h2 className="text-xl font-bold tracking-tight">Approved Events</h2>
                            </div>
                            <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
                                <Link href="/dashboard/entries">View Entries</Link>
                            </Button>
                        </div>

                        <div className="rounded-2xl border border-black/5 bg-gradient-to-b from-background/95 to-background/70 shadow-[0_12px_30px_-22px_rgba(0,0,0,0.25)] dark:border-white/10 dark:bg-background/40 dark:from-background/60 dark:to-background/30 dark:shadow-black/40">
                            {/* @ts-ignore */}
                            {approvedEvents.length > 0 ? (
                                <div className="divide-y divide-border">
                                    {/* @ts-ignore */}
                                    {approvedEvents.map((event: any) => (
                                        <Link
                                            key={event.id}
                                            href={`/dashboard/entries/${event.id}`}
                                            className="group flex items-center justify-between gap-4 p-3 transition-colors hover:bg-muted/50"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-100 dark:bg-emerald-950">
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-500" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium truncate">{event.title}</span>
                                                        <Badge className="capitalize text-[10px] px-1.5 py-0" variant="secondary">{event.event_type}</Badge>
                                                        <span className="text-[10px] text-emerald-600 dark:text-emerald-500 font-medium">Approved</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                                        <span className="flex items-center gap-0.5">
                                                            <Calendar className="h-2.5 w-2.5" />
                                                            {new Date(event.start_date).toLocaleDateString()}
                                                        </span>
                                                        {event.location && (
                                                            <>
                                                                <span>•</span>
                                                                <span className="flex items-center gap-0.5">
                                                                    <MapPin className="h-2.5 w-2.5" />
                                                                    {event.location}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                                Manage
                                                <ArrowRight className="ml-1 h-3 w-3" />
                                            </Button>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center">
                                    <ClipboardList className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                                    <p className="text-sm font-medium">No approved events yet</p>
                                    <p className="mt-1 text-xs text-muted-foreground">When you’re approved, events show up here.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between gap-3 mb-6">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <FolderOpen className="h-5 w-5" />
                                </div>
                                <h2 className="text-xl font-bold tracking-tight">Active Events</h2>
                            </div>
                            <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
                                <Link href="/dashboard/events-browser">All Events</Link>
                            </Button>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {activePublicEvents?.map((event: any) => {
                                const status = appMap.get(event.id)
                                return (
                                    <div key={event.id} className="group flex flex-col rounded-2xl border border-black/10 bg-gradient-to-b from-background/90 to-background/50 hover:bg-background/70 transition-colors p-5 shadow-md shadow-black/5 dark:border-white/10 dark:shadow-black/40">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="space-y-1">
                                                <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/20 hover:bg-primary/10">
                                                    {event.event_type}
                                                </Badge>
                                            </div>
                                            {status && (
                                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-background border border-border text-[10px] font-medium shadow-sm">
                                                    {getStatusIcon(status)}
                                                    <span>{getStatusText(status)}</span>
                                                </div>
                                            )}
                                        </div>

                                        <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-primary transition-colors">{event.title}</h3>

                                        <div className="space-y-2 mb-6 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3.5 w-3.5" />
                                                <span>{new Date(event.start_date).toLocaleDateString()}</span>
                                            </div>
                                            {event.location && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                    <span className="truncate max-w-[200px]">{event.location}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-auto pt-4 flex gap-3">
                                            <Link href={`/dashboard/events/${event.id}`} className="flex-1">
                                                <Button variant="outline" className="w-full rounded-xl border-black/10 bg-white/5 hover:bg-white/10 hover:text-foreground dark:border-white/10">
                                                    Details
                                                </Button>
                                            </Link>
                                            <ApplyButton
                                                eventId={event.id}
                                                status={status}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                            {(!activePublicEvents || activePublicEvents.length === 0) && (
                                <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed border-black/10 rounded-2xl bg-white/5 dark:border-white/10">
                                    No active events found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
