'use client'

import { useState } from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { upsertEntry, deleteEntry } from "@/app/dashboard/entries/actions"
import { Loader2, Save, Trash2, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface EntryRowProps {
    student: any
    entry: any
    categories: any[]
    eventDays: any[]
    eventId: string
}

export function EntryRow({ student, entry, categories, eventDays, eventId }: EntryRowProps) {
    const [categoryId, setCategoryId] = useState<string>(entry?.category_id || '')
    const [dayId, setDayId] = useState<string>(entry?.event_day_id || '')
    const [type, setType] = useState<string>(entry?.participation_type || '')
    const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

    // Helper to auto-save or explicit save
    // For now, let's use explicit save button on the row or auto-save on change?
    // Auto-save on change is better UX for "spreadsheet" feel but requires careful state management.
    // Let's do explicit "Add/Update" button for clarity in the MVP.

    const isEntered = !!entry

    const handleSave = async () => {
        if (!categoryId) return // validation

        setStatus('saving')
        const formData = new FormData()
        formData.append('event_id', eventId)
        formData.append('student_id', student.id)
        formData.append('category_id', categoryId)
        if (dayId) formData.append('event_day_id', dayId)
        if (type) formData.append('participation_type', type)

        try {
            await upsertEntry(formData)
            setStatus('saved')
            setTimeout(() => setStatus('idle'), 2000)
        } catch {
            setStatus('error')
        }
    }

    const handleDelete = async () => {
        if (confirm('Remove entry?')) {
            setStatus('saving')
            try {
                await deleteEntry(entry.id)
                setCategoryId('')
                setDayId('')
                setType('')
                setStatus('idle')
            } catch {
                setStatus('error')
            }
        }
    }

    // Filter categories based on student age/gender/rank if we wanted to be fancy.
    // For now, list all.

    return (
        <tr className={cn("border-b transition-colors hover:bg-muted/50", isEntered ? "bg-emerald-50/50" : "")}>
            <td className="p-4 align-middle font-medium">
                <div>{student.name}</div>
                <div className="text-xs text-muted-foreground">{student.rank} • {student.weight}kg • {new Date().getFullYear() - new Date(student.date_of_birth).getFullYear()}yrs</div>
            </td>
            <td className="p-4 align-middle">
                <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger className="w-full min-w-[180px]">
                        <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map(c => (
                            <SelectItem key={c.id} value={c.id}>
                                {c.name} ({c.gender}, {c.min_weight}-{c.max_weight}kg)
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </td>
            <td className="p-4 align-middle">
                <Select value={dayId} onValueChange={setDayId}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Day" />
                    </SelectTrigger>
                    <SelectContent>
                        {eventDays.map(d => (
                            <SelectItem key={d.id} value={d.id}>{d.name || d.date}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </td>
            <td className="p-4 align-middle">
                <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="kata">Kata</SelectItem>
                        <SelectItem value="kumite">Kumite</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                </Select>
            </td>
            <td className="p-4 align-middle text-center">
                {entry?.status === 'submitted' ? (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Submitted</span>
                ) : entry?.status === 'draft' ? (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Draft</span>
                ) : (
                    <span className="text-muted-foreground text-xs">-</span>
                )}
            </td>
            <td className="p-4 align-middle text-right">
                <div className="flex justify-end gap-2">
                    {isEntered ? (
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={handleDelete}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    ) : null}

                    <Button size="sm" variant={isEntered ? "secondary" : "default"} onClick={handleSave} disabled={status === 'saving' || !categoryId}>
                        {status === 'saving' ? <Loader2 className="h-4 w-4 animate-spin" /> :
                            status === 'saved' ? <CheckCircle className="h-4 w-4 text-emerald-600" /> :
                                status === 'error' ? <AlertCircle className="h-4 w-4 text-red-600" /> :
                                    isEntered ? "Update" : "Add"}
                    </Button>
                </div>
            </td>
        </tr>
    )
}
