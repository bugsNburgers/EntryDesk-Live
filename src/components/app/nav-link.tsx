'use client'

import Link, { type LinkProps } from 'next/link'
import React, { type MouseEvent } from 'react'
import { usePathname } from 'next/navigation'
import { useAppNavigation } from '@/components/app/navigation-provider'

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

export function AppNavLink({ children, className, ...props }: Props) {
    const { beginNavigation } = useAppNavigation()
    const pathname = usePathname()

    const hrefString = typeof props.href === 'string' ? props.href : undefined
    const hrefPath = hrefString ? hrefString.split('?')[0]?.split('#')[0] : undefined

    return (
        <Link
            {...props}
            className={className}
            onClick={(e) => {
                props.onClick?.(e)
                if (e.defaultPrevented) return
                if (isModifiedEvent(e)) return

                if (hrefPath && hrefPath === pathname) {
                    e.preventDefault()
                    return
                }

                beginNavigation()
            }}
        >
            {children}
        </Link>
    )
}
