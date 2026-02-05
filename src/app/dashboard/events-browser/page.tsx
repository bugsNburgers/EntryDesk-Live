import { requireRole } from '@/lib/auth/require-role'
import { ApplyButton } from '@/components/events/apply-button'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DashboardPageHeader } from '@/components/dashboard/page-header'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, ArrowRight, FolderOpen, CheckCircle2, Clock, XCircle } from 'lucide-react'

export default async function EventBrowserPage() {
    const { supabase, user } = await requireRole('coach', { redirectTo: '/dashboard' })

    const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('is_public', true)
        .order('start_date', { ascending: true })

    const { data: applications } = await supabase
        .from('event_applications')
        .select('event_id, status')
        .eq('coach_id', user.id)

    const appMap = new Map()
    applications?.forEach(app => {
        appMap.set(app.event_id, app.status)
    })

    const today = new Date().toISOString().slice(0, 10)
    const upcomingEvents = (events ?? []).filter((event) => event.end_date >= today)
    const pastEvents = (events ?? []).filter((event) => event.end_date < today)

    const approvedUpcomingEvents = upcomingEvents.filter((event) => appMap.get(event.id) === 'approved')
    const activeUpcomingEvents = upcomingEvents.filter((event) => appMap.get(event.id) !== 'approved')

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
        <div className="space-y-4">
            <DashboardPageHeader
                title="Events"
                description="View active, approved, and past events."
            />

            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-sm font-semibold">Approved Events</h2>
                </div>
                <div className="rounded-2xl border border-black/5 bg-gradient-to-b from-background/95 to-background/70 shadow-[0_12px_30px_-22px_rgba(0,0,0,0.25)] dark:border-white/10 dark:bg-background/40 dark:from-background/60 dark:to-background/30 dark:shadow-black/40">
                    {approvedUpcomingEvents.length > 0 ? (
                        <div className="divide-y divide-border">
                            {approvedUpcomingEvents.map((event) => {
                                const status = appMap.get(event.id)
                                return (
                                    <div
                                        key={event.id}
                                        className="flex items-center justify-between gap-4 p-3"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-100 dark:bg-emerald-950">
                                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-500" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium truncate">{event.title}</span>
                                                    <Badge className="capitalize text-[10px] px-1.5 py-0" variant="secondary">{event.event_type}</Badge>
                                                    {status && (
                                                        <span className="flex items-center gap-0.5 text-[10px] font-medium">
                                                            {getStatusIcon(status)}
                                                            <span className="text-emerald-600 dark:text-emerald-500">
                                                                {getStatusText(status)}
                                                            </span>
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                                    <span>{new Date(event.start_date).toLocaleDateString()} – {new Date(event.end_date).toLocaleDateString()}</span>
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
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Link href={`/dashboard/entries/${event.id}`}>
                                                <Button size="sm" className="h-7 text-xs">
                                                    Entries
                                                    <ArrowRight className="ml-1 h-3 w-3" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="py-6 text-center">
                            <p className="text-sm font-medium">No approved events</p>
                            <p className="mt-1 text-xs text-muted-foreground">When you’re approved, events show up here.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-sm font-semibold">Active Events</h2>
                </div>
                <div className="rounded-2xl border border-black/5 bg-gradient-to-b from-background/95 to-background/70 shadow-[0_12px_30px_-22px_rgba(0,0,0,0.25)] dark:border-white/10 dark:bg-background/40 dark:from-background/60 dark:to-background/30 dark:shadow-black/40">
                    {activeUpcomingEvents.length > 0 ? (
                        <div className="divide-y divide-border">
                            {activeUpcomingEvents.map((event) => {
                                const status = appMap.get(event.id)
                                return (
                                    <div
                                        key={event.id}
                                        className="flex items-center justify-between gap-4 p-3"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium truncate">{event.title}</span>
                                                    <Badge className="capitalize text-[10px] px-1.5 py-0" variant="secondary">{event.event_type}</Badge>
                                                    {status && (
                                                        <span className="flex items-center gap-0.5 text-[10px] font-medium">
                                                            {getStatusIcon(status)}
                                                            <span className={
                                                                status === 'pending' ? 'text-amber-600 dark:text-amber-500' :
                                                                    status === 'rejected' ? 'text-red-600 dark:text-red-500' :
                                                                        'text-muted-foreground'
                                                            }>
                                                                {getStatusText(status)}
                                                            </span>
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                                    <span>{new Date(event.start_date).toLocaleDateString()} – {new Date(event.end_date).toLocaleDateString()}</span>
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
                                        <div className="flex items-center gap-2 shrink-0">
                                            <ApplyButton eventId={event.id} status={status} />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="py-6 text-center">
                            <p className="text-sm font-medium">No active events</p>
                            <p className="mt-1 text-xs text-muted-foreground">Check back later for new events.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-sm font-semibold">Past Events</h2>
                </div>
                <div className="rounded-2xl border border-black/5 bg-gradient-to-b from-background/95 to-background/70 shadow-[0_12px_30px_-22px_rgba(0,0,0,0.25)] dark:border-white/10 dark:bg-background/40 dark:from-background/60 dark:to-background/30 dark:shadow-black/40">
                    {pastEvents.length > 0 ? (
                        <div className="divide-y divide-border">
                            {pastEvents
                                .slice()
                                .sort((a, b) => (a.end_date < b.end_date ? 1 : -1))
                                .map((event) => {
                                    const status = appMap.get(event.id)
                                    return (
                                        <div
                                            key={event.id}
                                            className="flex items-center justify-between gap-4 p-3"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                                                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium truncate">{event.title}</span>
                                                        <Badge className="capitalize text-[10px] px-1.5 py-0" variant="secondary">{event.event_type}</Badge>
                                                        {status && (
                                                            <span className="flex items-center gap-0.5 text-[10px] font-medium">
                                                                {getStatusIcon(status)}
                                                                <span className={
                                                                    status === 'approved' ? 'text-emerald-600 dark:text-emerald-500' :
                                                                        status === 'pending' ? 'text-amber-600 dark:text-amber-500' :
                                                                            'text-red-600 dark:text-red-500'
                                                                }>
                                                                    {getStatusText(status)}
                                                                </span>
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                                        <span>{new Date(event.start_date).toLocaleDateString()} – {new Date(event.end_date).toLocaleDateString()}</span>
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
                                            <div className="flex items-center gap-2 shrink-0">
                                                {status === 'approved' && (
                                                    <Link href={`/dashboard/entries/${event.id}`}>
                                                        <Button variant="outline" size="sm" className="h-7 text-xs">
                                                            Entries
                                                            <ArrowRight className="ml-1 h-3 w-3" />
                                                        </Button>
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                        </div>
                    ) : (
                        <div className="py-6 text-center">
                            <p className="text-sm font-medium">No past events</p>
                            <p className="mt-1 text-xs text-muted-foreground">Completed events show up here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
