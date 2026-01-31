'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, FileEdit, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface CoachOverviewProps {
    stats: {
        total: number
        draft: number
        submitted: number
        approved: number
    }

    entries: any[]
    onSelectStatus: (status: 'all' | 'draft' | 'submitted' | 'approved' | 'rejected') => void
}

function StatusPreview({
    title,
    status,
    entries,
    onSelect,
}: {
    title: string
    status: 'draft' | 'submitted' | 'approved' | 'rejected'
    entries: any[]
    onSelect: () => void
}) {
    const top = entries.slice(0, 4)

    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-sm font-medium">{title}</CardTitle>
                    <button
                        type="button"
                        onClick={onSelect}
                        className="text-xs font-medium text-primary hover:underline"
                    >
                        View
                    </button>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                {top.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No {status} entries.</p>
                ) : (
                    <ul className="space-y-2">
                        {top.map((e) => (
                            <li key={e.id} className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="truncate text-sm font-medium">{e.students?.name || '—'}</div>
                                    <div className="truncate text-xs text-muted-foreground">
                                        {(e.event_days?.name || 'No day') + ' • ' + (e.participation_type || '—')}
                                    </div>
                                </div>
                                <span className={cn(
                                    "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                                    status === 'approved' ? "bg-emerald-100 text-emerald-800" :
                                        status === 'submitted' ? "bg-blue-100 text-blue-800" :
                                            status === 'rejected' ? "bg-red-100 text-red-800" :
                                                "bg-yellow-100 text-yellow-800"
                                )}>
                                    {status}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    )
}

export function CoachOverview({ stats, entries, onSelectStatus }: CoachOverviewProps) {
    const drafts = entries.filter(e => e.status === 'draft')
    const submitted = entries.filter(e => e.status === 'submitted')
    const approved = entries.filter(e => e.status === 'approved')
    const rejected = entries.filter(e => e.status === 'rejected')

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <button type="button" onClick={() => onSelectStatus('all')} className="text-left">
                    <Card className="cursor-pointer transition-shadow hover:shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Entries</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground">Total records</p>
                        </CardContent>
                    </Card>
                </button>

                <button type="button" onClick={() => onSelectStatus('draft')} className="text-left">
                    <Card className="cursor-pointer transition-shadow hover:shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
                            <FileEdit className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats.draft}</div>
                            <p className="text-xs text-muted-foreground">Require submission</p>
                        </CardContent>
                    </Card>
                </button>

                <button type="button" onClick={() => onSelectStatus('submitted')} className="text-left">
                    <Card className="cursor-pointer transition-shadow hover:shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Submitted</CardTitle>
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.submitted}</div>
                            <p className="text-xs text-muted-foreground">Waiting for approval</p>
                        </CardContent>
                    </Card>
                </button>

                <button type="button" onClick={() => onSelectStatus('approved')} className="text-left">
                    <Card className="cursor-pointer transition-shadow hover:shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Approved</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                            <p className="text-xs text-muted-foreground">Ready for event</p>
                        </CardContent>
                    </Card>
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatusPreview title="Draft entries" status="draft" entries={drafts} onSelect={() => onSelectStatus('draft')} />
                <StatusPreview title="Submitted entries" status="submitted" entries={submitted} onSelect={() => onSelectStatus('submitted')} />
                <StatusPreview title="Approved entries" status="approved" entries={approved} onSelect={() => onSelectStatus('approved')} />
                <StatusPreview title="Rejected entries" status="rejected" entries={rejected} onSelect={() => onSelectStatus('rejected')} />
            </div>
        </div>
    )
}
