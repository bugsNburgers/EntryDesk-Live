'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type HistoryBackCommonProps = {
    fallbackHref?: string
}

export function HistoryBackIconButton({
    fallbackHref,
    className,
    ...props
}: HistoryBackCommonProps & React.ComponentProps<typeof Button>) {
    const router = useRouter()

    const handleBack = React.useCallback(() => {
        if (typeof window === 'undefined') return

        // If the page was opened directly (new tab), history might not have an entry.
        if (window.history.length <= 1) {
            router.push(fallbackHref ?? '/dashboard')
            return
        }

        router.back()
    }, [fallbackHref, router])

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Back"
            onClick={handleBack}
            className={cn(className)}
            {...props}
        >
            <ChevronLeft className="h-4 w-4" />
        </Button>
    )
}

export function HistoryBackTextButton({
    fallbackHref,
    className,
    children,
    ...props
}: HistoryBackCommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
    const router = useRouter()

    const handleBack = React.useCallback(() => {
        if (typeof window === 'undefined') return

        if (window.history.length <= 1) {
            router.push(fallbackHref ?? '/dashboard')
            return
        }

        router.back()
    }, [fallbackHref, router])

    return (
        <button
            type="button"
            onClick={handleBack}
            className={cn(
                'inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground',
                className,
            )}
            {...props}
        >
            {children}
        </button>
    )
}
