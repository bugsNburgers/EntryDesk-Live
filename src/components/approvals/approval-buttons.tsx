'use client'

import { Button } from "@/components/ui/button"
import { updateApplicationStatus } from "@/app/dashboard/approvals/actions"
import { useState } from "react"
import { Loader2, Check, X } from "lucide-react"

interface ApprovalButtonsProps {
    applicationId: string
}

export function ApprovalButtons({ applicationId }: ApprovalButtonsProps) {
    const [loading, setLoading] = useState<'approved' | 'rejected' | null>(null)

    const handleUpdate = async (status: 'approved' | 'rejected') => {
        setLoading(status)
        try {
            await updateApplicationStatus(applicationId, status)
        } catch(e) {
            alert('Failed to update')
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="flex gap-2">
            <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleUpdate('approved')} disabled={!!loading}>
                {loading === 'approved' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
                Approve
            </Button>
            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleUpdate('rejected')} disabled={!!loading}>
                 {loading === 'rejected' ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-1" />}
                Reject
            </Button>
        </div>
    )
}
