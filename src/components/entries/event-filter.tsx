'use client'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useRouter, useSearchParams } from "next/navigation"
import { useAppNavigation } from "@/components/app/navigation-provider"

interface EventFilterProps {
    events: { id: string, title: string }[]
}

export function EventFilter({ events }: EventFilterProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { beginNavigation } = useAppNavigation()
    const currentEvent = searchParams.get('event') || ''

    const handleValueChange = (val: string) => {
        const params = new URLSearchParams(searchParams)
        if (val && val !== 'all') {
            params.set('event', val)
        } else {
            params.delete('event')
        }
        beginNavigation()
        router.push(`/dashboard/entries?${params.toString()}`)
    }

    return (
        <Select value={currentEvent} onValueChange={handleValueChange}>
            <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select Event to Manage" />
            </SelectTrigger>
            <SelectContent>
                {events.map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
