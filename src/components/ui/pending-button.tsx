'use client'

import * as React from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'

type PendingButtonProps = React.ComponentProps<typeof Button> & {
    pendingText?: string
}

export function PendingButton({
    children,
    pendingText = 'Working... ',
    disabled,
    ...props
}: PendingButtonProps) {
    const { pending } = useFormStatus()

    return (
        <Button disabled={pending || disabled} {...props}>
            {pending ? (
                <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {pendingText}
                </span>
            ) : (
                children
            )}
        </Button>
    )
}
