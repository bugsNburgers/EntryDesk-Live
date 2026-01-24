'use client'

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { EntryApprovalButtons } from "@/components/events/entry-approval-buttons"
import { bulkUpdateEntryStatus } from "@/app/dashboard/events/[id]/entries/actions"
import { Loader2 } from "lucide-react"
import { toast } from "sonner" // Assuming we have sonner or use alert for now

interface EntriesTableProps {
    entries: any[]
}

export function EntriesTable({ entries }: EntriesTableProps) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [isBulkUpdating, setIsBulkUpdating] = useState(false)

    // Derived state
    const allSelected = entries.length > 0 && selectedIds.size === entries.length
    const isIndeterminate = selectedIds.size > 0 && selectedIds.size < entries.length

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(new Set(entries.map(e => e.id)))
        } else {
            setSelectedIds(new Set())
        }
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

    const handleBulkUpdate = async (status: 'approved' | 'rejected') => {
        if (!confirm(`Are you sure you want to ${status} ${selectedIds.size} entries?`)) return

        setIsBulkUpdating(true)
        try {
            await bulkUpdateEntryStatus(Array.from(selectedIds), status)
            setSelectedIds(new Set()) // Clear selection on success
            // toast.success(`Entries ${status}`)
        } catch (e) {
            console.error(e)
            alert('Failed to update entries')
        } finally {
            setIsBulkUpdating(false)
        }
    }

    return (
        <div className="space-y-4">
             {selectedIds.size > 0 && (
                <div className="bg-muted/50 p-2 rounded-lg flex items-center gap-4 border border-blue-100 bg-blue-50/50">
                    <span className="text-sm font-medium pl-2">{selectedIds.size} selected</span>
                    <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleBulkUpdate('approved')} disabled={isBulkUpdating} className="bg-green-600 hover:bg-green-700">
                             {isBulkUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Approve Selected
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleBulkUpdate('rejected')} disabled={isBulkUpdating}>
                            {isBulkUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Reject Selected
                        </Button>
                    </div>
                </div>
            )}

            <div className="relative w-full overflow-auto border rounded-md">
                <table className="w-full caption-bottom text-sm text-left">
                    <thead className="[&_tr]:border-b bg-muted/40">
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                            <th className="h-12 px-4 align-middle w-[50px]">
                                <Checkbox 
                                    checked={allSelected} 
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
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Dojo</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Category</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Type</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                        {entries.length === 0 ? (
                             <tr>
                                <td colSpan={7} className="h-24 text-center text-muted-foreground">
                                    No entries found.
                                </td>
                            </tr>
                        ) : entries.map((entry) => (
                            <tr key={entry.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <td className="p-4 align-middle">
                                    <Checkbox 
                                        checked={selectedIds.has(entry.id)}
                                        onCheckedChange={(c) => handleSelectOne(entry.id, !!c)}
                                    />
                                </td>
                                {/* @ts-ignore */}
                                <td className="p-4 align-middle font-medium">
                                    {entry.students?.name}
                                    <div className="text-xs text-muted-foreground">{entry.profiles?.full_name} (Coach)</div>
                                </td>
                                {/* @ts-ignore */}
                                <td className="p-4 align-middle">{entry.students?.dojos?.name}</td>
                                {/* @ts-ignore */}
                                <td className="p-4 align-middle">
                                    {entry.categories?.name ? (
                                        <div className="flex flex-col">
                                            <span>{entry.categories.name}</span>
                                            <span className="text-xs text-muted-foreground">{entry.event_days?.name}</span>
                                        </div>
                                    ) : '-'}
                                </td>
                                <td className="p-4 align-middle capitalize">{entry.participation_type}</td>
                                <td className="p-4 align-middle">
                                        <span className={
                                            entry.status === 'approved' ? "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-100 text-green-800" :
                                            entry.status === 'rejected' ? "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-red-100 text-red-800" :
                                            entry.status === 'submitted' ? "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-blue-100 text-blue-800" : 
                                            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent text-foreground"
                                        }>
                                        {entry.status}
                                        </span>
                                </td>
                                <td className="p-4 align-middle text-right">
                                    <EntryApprovalButtons entryId={entry.id} currentStatus={entry.status} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
