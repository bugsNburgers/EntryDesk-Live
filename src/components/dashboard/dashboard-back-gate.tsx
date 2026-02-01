'use client'

import { usePathname } from 'next/navigation'
import { HistoryBackIconButton } from '@/components/app/history-back'

export function DashboardBackGate() {
    const pathname = usePathname()

    // User requested "same functionality" so we keep it everywhere if that's what they mean,
    // but logically strictly on root dashboard it might be redundant. 
    // However, forcing it visible everywhere ensures we meet the "I need it" demand.
    // We'll just style it to not take space.

    return (
        <div className="mb-4 px-2">
            <HistoryBackIconButton fallbackHref="/dashboard" size="icon" variant="ghost" className="-ml-2" />
        </div>
    )
}
