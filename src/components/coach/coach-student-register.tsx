'use client'

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Loader2, PlusCircle, Filter, Pencil } from "lucide-react"
import { bulkCreateEntries } from "@/app/dashboard/entries/actions"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { StudentDialog } from "@/components/students/student-dialog"
import { normalizeDobToIso } from "@/lib/date"

interface CoachStudentRegisterProps {
    students: any[]
    existingStudentIds: Set<string>
    eventId: string
    eventDays: any[]
    dojos: any[]
}

export function CoachStudentRegister({ students, existingStudentIds, eventId, eventDays, dojos }: CoachStudentRegisterProps) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [isAdding, setIsAdding] = useState(false)
    const [participationType, setParticipationType] = useState('both')
    const [selectedDayId, setSelectedDayId] = useState<string>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [editingStudent, setEditingStudent] = useState<any>(null)
    const [dialogOpen, setDialogOpen] = useState(false)

    // Filters
    const [filterDojo, setFilterDojo] = useState('all')
    const [filterGender, setFilterGender] = useState('all')
    const [filterRank, setFilterRank] = useState('all')

    // Derived Filter Options
    const uniqueDojos = Array.from(new Set(students.map(s => s.dojos?.name))).filter(Boolean).sort()
    const uniqueRanks = Array.from(new Set(students.map(s => s.rank))).filter(Boolean).sort()

    // Filter Logic
    const availableStudents = students.filter(s => !existingStudentIds.has(s.id))

    const filteredStudents = availableStudents.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesDojo = filterDojo === 'all' || s.dojos?.name === filterDojo
        const matchesGender = filterGender === 'all' || s.gender === filterGender
        const matchesRank = filterRank === 'all' || s.rank === filterRank

        return matchesSearch && matchesDojo && matchesGender && matchesRank
    })

    const isAllFilteredSelected = filteredStudents.length > 0 && filteredStudents.every(s => selectedIds.has(s.id))
    const isIndeterminate = selectedIds.size > 0 && !isAllFilteredSelected

    const handleSelectAll = (checked: boolean) => {
        const next = new Set(selectedIds)
        if (checked) {
            filteredStudents.forEach(s => next.add(s.id))
        } else {
            filteredStudents.forEach(s => next.delete(s.id))
        }
        setSelectedIds(next)
    }

    const handleSelectOne = (id: string, checked: boolean) => {
        const next = new Set(selectedIds)
        if (checked) {
            next.add(id)
        } else {
            next.delete(id)
        }
        setSelectedIds(next)
    }

    const handleAdd = async () => {
        const count = selectedIds.size
        if (count === 0) return

        // Validate Day Selection if days exist
        if (eventDays.length > 0 && (!selectedDayId || selectedDayId === 'all')) {
            alert("Please select an Event Day before adding students.")
            return
        }

        setIsAdding(true)
        try {
            const entries = Array.from(selectedIds).map(id => ({
                student_id: id,
                participation_type: participationType,
                event_day_id: selectedDayId !== 'all' ? selectedDayId : null
            }))
            await bulkCreateEntries(eventId, entries)
            setSelectedIds(new Set())
        } catch (e) {
            alert('Failed to add entries')
        } finally {
            setIsAdding(false)
        }
    }

    const startEdit = (student: any) => {
        setEditingStudent(student)
        setDialogOpen(true)
    }

    return (
        <div className="space-y-4">
            <StudentDialog
                dojos={dojos}
                student={editingStudent}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
            />

            {/* Filters Bar */}
            <div className="flex flex-wrap gap-2 items-center bg-muted/30 p-3 rounded-md border border-dashed">
                <Filter className="h-4 w-4 text-muted-foreground mr-1" />

                <Input
                    placeholder="Search name..."
                    className="h-8 w-[150px] lg:w-[200px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                <Select value={filterGender} onValueChange={setFilterGender}>
                    <SelectTrigger className="h-8 w-[110px]">
                        <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Genders</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filterRank} onValueChange={setFilterRank}>
                    <SelectTrigger className="h-8 w-[130px]">
                        <SelectValue placeholder="Rank" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Ranks</SelectItem>
                        {uniqueRanks.map(r => (
                            <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={filterDojo} onValueChange={setFilterDojo}>
                    <SelectTrigger className="h-8 w-[140px]">
                        <SelectValue placeholder="Dojo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Dojos</SelectItem>
                        {uniqueDojos.map(d => (
                            <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between border-t border-b py-3 bg-muted/10">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Selection:</span>
                    <span className="text-sm font-bold">{selectedIds.size}</span>
                    <span className="text-sm text-muted-foreground">students</span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Event Day Selector (Conditional) */}
                    {eventDays.length > 0 && (
                        <Select value={selectedDayId} onValueChange={setSelectedDayId}>
                            <SelectTrigger className="w-[180px] border-blue-200 bg-blue-50/50">
                                <SelectValue placeholder="Select Day (Required)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" disabled>Select Day...</SelectItem>
                                {eventDays.map(day => (
                                    <SelectItem key={day.id} value={day.id}>{day.name || day.date}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    <Select value={participationType} onValueChange={setParticipationType}>
                        <SelectTrigger className="w-[130px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="both">Both</SelectItem>
                            <SelectItem value="kata">Kata</SelectItem>
                            <SelectItem value="kumite">Kumite</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button size="sm" onClick={handleAdd} disabled={isAdding || selectedIds.size === 0} className="bg-emerald-600 hover:bg-emerald-700 min-w-[120px]">
                        {isAdding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <PlusCircle className="h-4 w-4 mr-2" />}
                        Add to Event
                    </Button>
                </div>
            </div>

            <div className="relative w-full overflow-auto border rounded-md h-[400px]">
                <table className="w-full caption-bottom text-sm text-left">
                    <thead className="[&_tr]:border-b bg-muted/40 sticky top-0 z-10 backdrop-blur-sm">
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                            <th className="h-12 px-4 align-middle w-[50px]">
                                <Checkbox
                                    checked={isAllFilteredSelected}
                                    onCheckedChange={(c) => handleSelectAll(!!c)}
                                    ref={input => {
                                        if (input) {
                                            // @ts-ignore
                                            input.indeterminate = isIndeterminate
                                        }
                                    }}
                                />
                            </th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Name</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Dojo</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Rank</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Gender / Age</th>
                        </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                        {filteredStudents.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="h-24 text-center text-muted-foreground">
                                    {availableStudents.length === 0 ? "All students are already entered!" : "No students match your search."}
                                </td>
                            </tr>
                        ) : filteredStudents.map((student) => (
                            <tr key={student.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <td className="p-4 align-middle">
                                    <Checkbox
                                        checked={selectedIds.has(student.id)}
                                        onCheckedChange={(c) => handleSelectOne(student.id, !!c)}
                                    />
                                </td>
                                <td className="p-4 align-middle font-medium">
                                    <div className="flex items-center gap-2">
                                        {student.name}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 ml-1 text-muted-foreground hover:text-foreground"
                                            onClick={() => startEdit(student)}
                                        >
                                            <Pencil className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </td>
                                <td className="p-4 align-middle">{student.dojos?.name || '-'}</td>
                                <td className="p-4 align-middle">{student.rank}</td>
                                <td className="p-4 align-middle text-muted-foreground capitalize">
                                    {student.gender}, {(() => {
                                        const iso = normalizeDobToIso(student.date_of_birth)
                                        return iso ? `${new Date().getFullYear() - new Date(iso).getFullYear()}yrs` : 'Age N/A'
                                    })()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="text-xs text-muted-foreground text-right pl-1">
                Showing {filteredStudents.length} of {availableStudents.length} available students.
            </p>
        </div>
    )
}
