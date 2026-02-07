'use client'

import * as React from 'react'

import { DashboardNavLink } from '@/components/dashboard/nav-link'
import { SignOutForm } from '@/components/dashboard/signout-form'
import { Badge } from '@/components/ui/badge'
import { ThemeSwitch } from '@/components/app/theme-toggle'
import { MobileNav } from '@/components/dashboard/mobile-nav'
import { HistoryBackIconButton } from '@/components/app/history-back'
import { Button } from '@/components/ui/button'
import {
    LayoutDashboard,
    Calendar,
    CheckCircle2,
    Building2,
    Users,
    FileText,
    Trophy,
    Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type DashboardShellProps = {
    children: React.ReactNode
    role: string
    roleLabel: string
    profileFullName: string | null
    userEmail: string
}

export function DashboardShell({
    children,
    role,
    roleLabel,
    profileFullName,
    userEmail,
}: DashboardShellProps) {
    const [sidebarOpen, setSidebarOpen] = React.useState(true)

    return (
        <div className="min-h-screen w-full relative">
            {/* Background Decor */}
            <div className="fixed inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
                <div className="absolute left-0 bottom-0 -z-10 h-[300px] w-[300px] rounded-full bg-primary/5 blur-[100px]" />
            </div>

            <div className="flex min-h-screen w-full">
                {/* Sidebar (desktop) */}
                <aside
                    className={cn(
                        'hidden md:flex flex-col border-r bg-background/50 backdrop-blur-xl px-4 py-5 sticky top-0 h-screen',
                        sidebarOpen ? 'w-72' : 'w-0 px-0 py-0 border-r-0 overflow-hidden',
                    )}
                >
                    {sidebarOpen ? (
                        <>
                            <div className="mb-4 flex items-center gap-1 px-2">
                                <HistoryBackIconButton
                                    fallbackHref="/dashboard"
                                    size="icon"
                                    variant="ghost"
                                    className="-ml-2"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Toggle sidebar"
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <Menu className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="flex items-center justify-between gap-3 mb-6">
                                <DashboardNavLink href="/dashboard" className="px-2 py-1 w-full hover:bg-transparent">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-600 shadow-lg shadow-primary/20 text-primary-foreground">
                                            <Trophy className="h-5 w-5" />
                                        </div>
                                        <div className="leading-tight">
                                            <div className="text-sm font-bold tracking-tight">EntryDesk</div>
                                            <div className="text-xs text-muted-foreground font-medium">{roleLabel}</div>
                                        </div>
                                    </div>
                                </DashboardNavLink>
                            </div>

                            <div className="flex flex-1 flex-col gap-1">
                                <div className="px-3 py-2">
                                    <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                                        Overview
                                    </h3>
                                    <div className="space-y-1">
                                        <DashboardNavLink href="/dashboard">
                                            <LayoutDashboard className="h-4 w-4" />
                                            Home
                                        </DashboardNavLink>
                                    </div>
                                </div>

                                <div className="px-3 py-2">
                                    <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                                        {role === 'organizer' ? 'Management' : 'Dojo Management'}
                                    </h3>
                                    <div className="space-y-1">
                                        {role === 'organizer' ? (
                                            <>
                                                <DashboardNavLink href="/dashboard/events">
                                                    <Calendar className="h-4 w-4" />
                                                    Events
                                                </DashboardNavLink>
                                                <DashboardNavLink href="/dashboard/approvals">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    Approvals
                                                </DashboardNavLink>
                                            </>
                                        ) : (
                                            <>
                                                <DashboardNavLink href="/dashboard/events-browser">
                                                    <Calendar className="h-4 w-4" />
                                                    Events
                                                </DashboardNavLink>
                                                <DashboardNavLink href="/dashboard/dojos">
                                                    <Building2 className="h-4 w-4" />
                                                    My Dojos
                                                </DashboardNavLink>
                                                <DashboardNavLink href="/dashboard/students">
                                                    <Users className="h-4 w-4" />
                                                    Students
                                                </DashboardNavLink>
                                                <DashboardNavLink href="/dashboard/entries">
                                                    <FileText className="h-4 w-4" />
                                                    My Entries
                                                </DashboardNavLink>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto">
                                <div className="border-t border-black/10 pt-4 px-2 dark:border-white/10">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant={role === 'organizer' ? 'success' : 'secondary'}
                                                className="capitalize border-primary/20 bg-primary/10 text-primary pointer-events-none text-[10px] px-2 py-0.5 h-5"
                                            >
                                                {role}
                                            </Badge>
                                        </div>
                                        <ThemeSwitch className="scale-[0.8]" />
                                    </div>

                                    <div className="flex items-center gap-3 mb-3 px-1">
                                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium border border-black/10 dark:border-white/10">
                                            {profileFullName?.[0] || userEmail?.[0]?.toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium truncate">{profileFullName || 'User'}</div>
                                            <div className="text-xs text-muted-foreground truncate">{userEmail}</div>
                                        </div>
                                    </div>

                                    <SignOutForm />
                                </div>
                            </div>
                        </>
                    ) : null}
                </aside>

                {/* Main */}
                <div className="flex min-w-0 flex-1 flex-col">
                    {/* Mobile top bar */}
                    <div className="sticky top-0 z-10 border-b bg-background/60 backdrop-blur-xl md:hidden">
                        <div className="flex h-14 items-center justify-between px-4">
                            <div className="flex items-center gap-2">
                                <MobileNav role={role} profile={{ full_name: profileFullName }} userEmail={userEmail} />
                                <DashboardNavLink href="/dashboard" className="px-0 py-0">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                                            <span className="text-xs font-bold">ED</span>
                                        </div>
                                        <span className="text-sm font-bold tracking-tight">EntryDesk</span>
                                    </div>
                                </DashboardNavLink>
                            </div>
                            <div className="flex items-center gap-2">
                                <ThemeSwitch className="scale-[0.85]" />
                                <Badge
                                    variant={role === 'organizer' ? 'success' : 'secondary'}
                                    className="capitalize border-primary/20 bg-primary/10 text-primary"
                                >
                                    {role}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
                        {/* Desktop controls when sidebar is collapsed */}
                        {!sidebarOpen ? (
                            <div className="hidden md:flex items-center gap-1 mb-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Toggle sidebar"
                                    onClick={() => setSidebarOpen(true)}
                                >
                                    <Menu className="h-4 w-4" />
                                </Button>
                                <HistoryBackIconButton fallbackHref="/dashboard" size="icon" variant="ghost" />
                            </div>
                        ) : null}

                        <div
                            className={cn(
                                'w-full relative',
                                sidebarOpen ? 'max-w-6xl' : 'max-w-none',
                            )}
                        >
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}
