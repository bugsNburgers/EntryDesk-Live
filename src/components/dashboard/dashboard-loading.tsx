'use client'

import { useEffect, useRef, useState } from 'react'
import { KarateLoader } from '@/components/ui/karate-loader'

const TICK_MS = 120

export function DashboardLoading() {
    const [progress, setProgress] = useState(5)
    const startedAtRef = useRef<number>(Date.now())

    useEffect(() => {
        const id = window.setInterval(() => {
            setProgress((current) => {
                // Ease-out towards 95% so it keeps moving,
                // but never “finishes” until the route is actually ready.
                if (current >= 95) return current
                const remaining = 95 - current
                const step = Math.max(0.6, remaining * 0.08)
                return Math.min(95, current + step)
            })
        }, TICK_MS)

        return () => {
            window.clearInterval(id)
        }
    }, [])

    const elapsedMs = Date.now() - startedAtRef.current
    const subtitle = elapsedMs > 1200 ? 'Still loading…' : 'Preparing your dashboard'

    return <KarateLoader title="Loading dashboard..." subtitle={subtitle} progress={progress} />
}
