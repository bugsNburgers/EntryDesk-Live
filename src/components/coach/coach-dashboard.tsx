'use client'

import { CoachOverview } from "./coach-overview"
import { CoachEntriesList } from "./coach-entries-list"
import { CoachStudentRegister } from "./coach-student-register"
import { useCallback, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface CoachDashboardProps {
    event: any
    stats: any
    entries: any[]
    students: any[]
    eventDays: any[]
    dojos: any[]
}

export function CoachDashboard({ event, stats, entries, students, eventDays, dojos }: CoachDashboardProps) {
    const existingStudentIds = useMemo(() => new Set(entries.map(e => e.student_id)), [entries])

    const [statusPreset, setStatusPreset] = useState<string>('all')
    const [registerOpen, setRegisterOpen] = useState(false)
    const entriesRef = useRef<HTMLDivElement | null>(null)

    const selectStatus = useCallback((nextStatus: string) => {
        setStatusPreset(nextStatus)
        // Jump user straight to the entries table.
        entriesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, [])

    return (
        <div className="space-y-8">
            <div className="space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
                        <p className="text-muted-foreground">Manage your team's participation.</p>
                    </div>
                    <Button onClick={() => setRegisterOpen(true)}>Register athletes</Button>
                </div>
            </div>

            <CoachOverview stats={stats} entries={entries} onSelectStatus={selectStatus} />

            <div ref={entriesRef} className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h3 className="text-lg font-medium">Entries</h3>
                        <p className="text-sm text-muted-foreground">Filter, submit, and manage your entries.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => selectStatus('all')}>All</Button>
                        <Button variant="outline" onClick={() => selectStatus('draft')}>Drafts</Button>
                        <Button variant="outline" onClick={() => selectStatus('submitted')}>Submitted</Button>
                        <Button variant="outline" onClick={() => selectStatus('approved')}>Approved</Button>
                    </div>
                </div>
                <CoachEntriesList entries={entries} eventDays={eventDays} dojos={dojos} statusPreset={statusPreset} />
            </div>

            <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Register athletes</DialogTitle>
                        <DialogDescription>
                            Pick students from your roster and add them to this event.
                        </DialogDescription>
                    </DialogHeader>

                    <CoachStudentRegister
                        students={students}
                        existingStudentIds={existingStudentIds}
                        eventId={event.id}
                        eventDays={eventDays}
                        dojos={dojos}
                    />
                </DialogContent>
            </Dialog>
        </div>
    )
}
