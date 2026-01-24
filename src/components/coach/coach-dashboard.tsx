'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CoachOverview } from "./coach-overview"
import { CoachEntriesList } from "./coach-entries-list"
import { CoachStudentRegister } from "./coach-student-register"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface CoachDashboardProps {
    event: any
    stats: any
    entries: any[]
    students: any[]
    eventDays: any[]
    dojos: any[]
}

export function CoachDashboard({ event, stats, entries, students, eventDays, dojos }: CoachDashboardProps) {
    const existingStudentIds = new Set(entries.map(e => e.student_id))

    return (
        <div className="space-y-6 h-[calc(100vh-4rem)] flex flex-col">
            <div className="flex flex-col gap-4 flex-none">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Link href="/dashboard/entries" className="hover:text-foreground flex items-center gap-1">
                        <ArrowLeft className="h-3 w-3" /> Back to All Events
                    </Link>
                </div>
                <div>
                     <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
                     <p className="text-muted-foreground">Manage your team's participation.</p>
                </div>
            </div>

            <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between border-b pb-2 mb-4">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="entries">
                            Entries 
                            <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
                                {entries.length}
                            </span>
                        </TabsTrigger>
                        <TabsTrigger value="register">
                            Register Athletes
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex-1 overflow-auto">
                    <TabsContent value="overview" className="h-full m-0">
                        <CoachOverview stats={stats} />
                    </TabsContent>
                    
                    <TabsContent value="entries" className="h-full m-0 space-y-4">
                         <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium">Active Entries</h3>
                            <p className="text-sm text-muted-foreground">Manage existing entries.</p>
                        </div>
                        <CoachEntriesList entries={entries} eventDays={eventDays} dojos={dojos} />
                    </TabsContent>
                    
                    <TabsContent value="register" className="h-full m-0 space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium">Student Registry</h3>
                            <p className="text-sm text-muted-foreground">Select students to add to this event.</p>
                        </div>
                        <CoachStudentRegister 
                            students={students} 
                            existingStudentIds={existingStudentIds} 
                            eventId={event.id}
                            eventDays={eventDays}
                            dojos={dojos}
                        />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}
