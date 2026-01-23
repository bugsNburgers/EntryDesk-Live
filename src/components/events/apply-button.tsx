'use client'

import { Button } from "@/components/ui/button"
import { applyToEvent } from "@/app/dashboard/events-browser/actions"
import { useState } from "react"
import { Loader2 } from "lucide-react"

interface ApplyButtonProps {
    eventId: string
    status?: string // 'pending', 'approved', 'rejected' or undefined
}

export function ApplyButton({ eventId, status }: ApplyButtonProps) {
    const [isLoading, setIsLoading] = useState(false)

    const handleApply = async () => {
        setIsLoading(true)
        try {
            await applyToEvent(eventId)
        } catch (error) {
            alert('Error applying to event')
        } finally {
            setIsLoading(false)
        }
    }

    if (status === 'approved') {
        return <Button variant="secondary" disabled className="bg-green-100 text-green-800">Approved</Button>
    }

    if (status === 'pending') {
         return <Button variant="outline" disabled>Pending Approval</Button>
    }
    
    if (status === 'rejected') {
          return <Button variant="destructive" disabled>Rejected</Button>
    }

    return (
        <Button onClick={handleApply} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Request to Participate
        </Button>
    )
}
