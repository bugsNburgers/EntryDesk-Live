'use client'

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Trash2, Send, Filter, ChevronLeft, ChevronRight, AlertTriangle, Pencil } from "lucide-react"
import { bulkSubmitEntries, bulkDeleteEntries } from "@/app/dashboard/entries/actions"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { StudentDialog } from "@/components/students/student-dialog"

interface CoachEntriesListProps {
    entries: any[]
    eventDays: any[]
    dojos: any[]
}

const ITEMS_PER_PAGE = 50

export function CoachEntriesList({ entries, eventDays, dojos }: CoachEntriesListProps) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [editingStudent, setEditingStudent] = useState<any>(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    
    // Filters & Pagination
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [dayFilter, setDayFilter] = useState('all')
    const [page, setPage] = useState(1)

    // Filter Logic
    const filteredEntries = entries.filter(e => {
        const matchesSearch = e.students?.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === 'all' || e.status === statusFilter
        const matchesDay = dayFilter === 'all' || e.event_day_id === dayFilter
        return matchesSearch && matchesStatus && matchesDay
    })

    // Pagination Logic
    const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE)
    const safePage = Math.min(Math.max(1, page), Math.max(1, totalPages))
    const startIndex = (safePage - 1) * ITEMS_PER_PAGE
    const paginatedEntries = filteredEntries.slice(startIndex, startIndex + ITEMS_PER_PAGE)

    // Selection Logic
    const isAllSelected = filteredEntries.length > 0 && filteredEntries.every(e => selectedIds.has(e.id))
    const isIndeterminate = selectedIds.size > 0 && !isAllSelected

    const handleSelectAll = (checked: boolean) => {
        const next = new Set(selectedIds)
        if (checked) {
            filteredEntries.forEach(e => next.add(e.id))
        } else {
            filteredEntries.forEach(e => next.delete(e.id))
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

    const handleSubmit = async () => {
        if (!confirm(`Submit ${selectedIds.size} entries?`)) return
        setIsSubmitting(true)
        try {
            await bulkSubmitEntries(Array.from(selectedIds))
            setSelectedIds(new Set())
        } catch (e) {
            alert('Failed to submit')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm(`Delete ${selectedIds.size} entries? This cannot be undone.`)) return
        setIsDeleting(true)
        try {
            await bulkDeleteEntries(Array.from(selectedIds))
            setSelectedIds(new Set())
        } catch (e) {
            alert('Failed to delete')
        } finally {
            setIsDeleting(false)
        }
    }

    const getMissingFields = (student: any) => {
        const missing = []
        if (!student.weight) missing.push('Weight')
        if (!student.rank) missing.push('Rank')
        if (!student.date_of_birth) missing.push('DOB')
        if (!student.gender) missing.push('Gender')
        return missing
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

            <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between bg-muted/30 p-3 rounded-md border border-dashed">
                <div className="flex flex-wrap gap-2 items-center flex-1">
                    <Filter className="h-4 w-4 text-muted-foreground mr-1" />
                    <Input 
                        placeholder="Search student..." 
                        className="h-8 w-[150px] lg:w-[200px]" 
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                    />
                    <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                        <SelectTrigger className="h-8 w-[130px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="submitted">Submitted</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                    {eventDays && eventDays.length > 0 && (
                        <Select value={dayFilter} onValueChange={(v) => { setDayFilter(v); setPage(1); }}>
                            <SelectTrigger className="h-8 w-[150px]">
                                <SelectValue placeholder="Filter Day" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Days</SelectItem>
                                {eventDays.map(d => (
                                    <SelectItem key={d.id} value={d.id}>{d.name || d.date}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>

                {selectedIds.size > 0 && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium mr-2 hidden md:inline">{selectedIds.size} selected</span>
                        <Button size="sm" onClick={handleSubmit} disabled={isSubmitting || isDeleting}>
                             {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                            Submit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={handleDelete} disabled={isSubmitting || isDeleting}>
                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                            Delete
                        </Button>
                    </div>
                )}
            </div>

            <div className="relative w-full overflow-auto border rounded-md min-h-[300px]">
                <table className="w-full caption-bottom text-sm text-left">
                    <thead className="[&_tr]:border-b bg-muted/40 sticky top-0 z-10 backdrop-blur-sm">
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                            <th className="h-12 px-4 align-middle w-[50px]">
                                <Checkbox 
                                    checked={isAllSelected} 
                                    onCheckedChange={(c) => handleSelectAll(!!c)} 
                                    ref={input => {
                                        if (input) {
                                            // @ts-ignore
                                            input.indeterminate = isIndeterminate
                                        }
                                    }}
                                />
                            </th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Student</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Day</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Type</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                        </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                        {paginatedEntries.length === 0 ? (
                             <tr>
                                <td colSpan={5} className="h-24 text-center text-muted-foreground">
                                    {filteredEntries.length === 0 
                                        ? "No entries match your filters." 
                                        : "No active entries. Go to 'Register' tab to add students."}
                                </td>
                            </tr>
                        ) : paginatedEntries.map((entry) => {
                            const missing = getMissingFields(entry.students)
                            return (
                                <tr key={entry.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <td className="p-4 align-middle">
                                        <Checkbox 
                                            checked={selectedIds.has(entry.id)}
                                            onCheckedChange={(c) => handleSelectOne(entry.id, !!c)}
                                        />
                                    </td>
                                    {/* @ts-ignore */}
                                    <td className="p-4 align-middle font-medium">
                                        <div className="flex items-center gap-2">
                                            {missing.length > 0 && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                             <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Missing: {missing.join(', ')}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                            <span>{entry.students?.name}</span>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-6 w-6 ml-1 text-muted-foreground hover:text-foreground"
                                                onClick={() => startEdit(entry.students)}
                                            >
                                                <Pencil className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </td>
                                    {/* @ts-ignore */}
                                    <td className="p-4 align-middle ">{entry.event_days?.name || '-'}</td>
                                    <td className="p-4 align-middle capitalize">{entry.participation_type}</td>
                                    <td className="p-4 align-middle">
                                        <span className={cn(
                                            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent",
                                            entry.status === 'approved' ? "bg-green-100 text-green-800" :
                                            entry.status === 'rejected' ? "bg-red-100 text-red-800" :
                                            entry.status === 'submitted' ? "bg-blue-100 text-blue-800" : 
                                            "text-foreground bg-yellow-100 text-yellow-800"
                                        )}>
                                            {entry.status}
                                        </span>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-2">
                    <div className="text-sm text-muted-foreground">
                        Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredEntries.length)} of {filteredEntries.length}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={safePage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>
                        <div className="text-sm font-medium">
                            Page {safePage} of {totalPages}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={safePage === totalPages}
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
