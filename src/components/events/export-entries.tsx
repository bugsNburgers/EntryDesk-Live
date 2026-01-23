'use client'

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import * as XLSX from 'xlsx'

interface ExportEntriesProps {
    data: any[]
}

export function ExportEntries({ data }: ExportEntriesProps) {
    const handleExport = () => {
        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Entries")
        XLSX.writeFile(wb, "entries_export.xlsx")
    }

    return (
        <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export CSV/Excel
        </Button>
    )
}
