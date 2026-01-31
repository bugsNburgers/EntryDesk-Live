'use client'

import Link, { type LinkProps } from 'next/link'
import React, { type MouseEvent } from 'react'
import { usePathname } from 'next/navigation'
import { useDashboardNavigation } from '@/components/dashboard/navigation-provider'
import { cn } from '@/lib/utils'

type Props = LinkProps & {
    className?: string
    children: React.ReactNode
}

function isModifiedEvent(event: MouseEvent) {
    const target = event.currentTarget as HTMLAnchorElement
    return (
        event.metaKey ||
        event.altKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.button !== 0 ||
        (target && target.target && target.target !== '_self')
    )
}

export function DashboardNavLink({ children, className, ...props }: Props) {
    const { beginNavigation } = useDashboardNavigation()
    const pathname = usePathname()

    const hrefString = typeof props.href === 'string' ? props.href : undefined
    const hrefPath = hrefString ? hrefString.split('?')[0]?.split('#')[0] : undefined

    const isActive = !!hrefPath && hrefPath === pathname

    const baseClasses =
        'group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors'
    const stateClasses = isActive
        ? 'bg-accent text-foreground'
        : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'

    return (
        <Link
            {...props}
            className={cn(baseClasses, stateClasses, className)}
            onClick={(e) => {
                props.onClick?.(e)
                if (e.defaultPrevented) return
                if (isModifiedEvent(e)) return

                if (hrefPath && hrefPath === pathname) {
                    e.preventDefault()
                    return
                }

                beginNavigation(hrefString)
            }}
        >
            {children}
        </Link>
    )
}
