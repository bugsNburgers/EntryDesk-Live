'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import {
    Menu,
    LayoutDashboard,
    Calendar,
    CheckCircle2,
    Building2,
    Users,
    FileText,
    Trophy,
} from "lucide-react"
import { DashboardNavLink } from "@/components/dashboard/nav-link"
import { Badge } from "@/components/ui/badge"
import { SignOutForm } from "@/components/dashboard/signout-form"
import { ThemeSwitch } from "@/components/app/theme-toggle"

interface MobileNavProps {
    role: string
    profile: any
    userEmail: string
}

export function MobileNav({ role, profile, userEmail }: MobileNavProps) {
    const [open, setOpen] = useState(false)
    const pathname = usePathname()

    // Close sheet when route changes
    useEffect(() => {
        setOpen(false)
    }, [pathname])

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-full sm:w-[350px] sm:max-w-sm p-0">
                <div className="flex h-[100dvh] flex-col">
                    <div className="flex items-center gap-3 p-6 border-b">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-600 shadow-lg shadow-primary/20 text-primary-foreground">
                            <Trophy className="h-5 w-5" />
                        </div>
                        <div className="leading-tight">
                            <div className="text-sm font-bold tracking-tight">EntryDesk</div>
                            <div className="text-xs text-muted-foreground font-medium">Organiser</div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto py-4">
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

                    <div className="border-t p-4 bg-background/50">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Badge variant={role === 'organizer' ? 'success' : 'secondary'} className="capitalize border-primary/20 bg-primary/10 text-primary pointer-events-none text-[10px] px-2 py-0.5 h-5">
                                    {role}
                                </Badge>
                            </div>
                            <ThemeSwitch className="scale-[0.8]" />
                        </div>

                        <div className="flex items-center gap-3 mb-3 px-1">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium border border-border">
                                {profile?.full_name?.[0] || userEmail?.[0]?.toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{profile?.full_name || 'User'}</div>
                                <div className="text-xs text-muted-foreground truncate">{userEmail}</div>
                            </div>
                        </div>

                        <SignOutForm />
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
