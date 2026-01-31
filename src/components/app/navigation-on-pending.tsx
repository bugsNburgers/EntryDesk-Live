'use client'

import { useEffect, useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { useAppNavigation } from '@/components/app/navigation-provider'

export function NavigationOnPending({
    title = 'Please wait while we log you in',
    subtitle,
}: {
    title?: string
    subtitle?: string
}) {
    const { pending } = useFormStatus()
    const { beginNavigation } = useAppNavigation()
    const startedRef = useRef(false)

    useEffect(() => {
        if (pending && !startedRef.current) {
            startedRef.current = true
            beginNavigation({ title, subtitle })
            return
        }

        if (!pending) {
            startedRef.current = false
        }
    }, [pending, beginNavigation, title, subtitle])

    return null
}
