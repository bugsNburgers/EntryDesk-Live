import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardNavLink } from '@/components/dashboard/nav-link'
import { SignOutForm } from '@/components/dashboard/signout-form'
import { Badge } from '@/components/ui/badge'
import { DashboardBackGate } from '@/components/dashboard/dashboard-back-gate'
import { ThemeSwitch } from '@/components/app/theme-toggle'
import { MobileNav } from '@/components/dashboard/mobile-nav'
import {
  LayoutDashboard,
  Calendar,
  CheckCircle2,
  Building2,
  Users,
  FileText,
  Search,
  Settings,
  Trophy
} from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  // Fetch Profile to get role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  // If no profile exists (e.g. first login), we should probably guide them to setup
  // For now, let's assume profile is created on signup trigger or similar

  const role = profile?.role || 'coach'

  return (
    <div className="min-h-screen w-full relative">
      {/* Background Decor */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="absolute left-0 bottom-0 -z-10 h-[300px] w-[300px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <div className="mx-auto flex min-h-screen w-full max-w-7xl">
        {/* Sidebar (desktop) */}
        <aside className="hidden w-72 flex-col border-r bg-background/50 backdrop-blur-xl px-4 py-5 md:flex sticky top-0 h-screen">
          <DashboardBackGate />
          <div className="flex items-center justify-between gap-3 mb-6">
            <DashboardNavLink href="/dashboard" className="px-2 py-1 w-full hover:bg-transparent">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-600 shadow-lg shadow-primary/20 text-primary-foreground">
                  <Trophy className="h-5 w-5" />
                </div>
                <div className="leading-tight">
                  <div className="text-sm font-bold tracking-tight">EntryDesk</div>
                  <div className="text-xs text-muted-foreground font-medium">Organiser</div>
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
            {/* Settings removed. */}

            <div className="border-t border-black/10 pt-4 px-2 dark:border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Badge variant={role === 'organizer' ? 'success' : 'secondary'} className="capitalize border-primary/20 bg-primary/10 text-primary pointer-events-none text-[10px] px-2 py-0.5 h-5">
                    {role}
                  </Badge>
                </div>
                <ThemeSwitch className="scale-[0.8]" />
              </div>

              <div className="flex items-center gap-3 mb-3 px-1">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium border border-black/10 dark:border-white/10">
                  {profile?.full_name?.[0] || user.email?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{profile?.full_name || 'User'}</div>
                  <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                </div>
              </div>
              <SignOutForm />
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile top bar */}
          <div className="sticky top-0 z-10 border-b bg-background/60 backdrop-blur-xl md:hidden">
            <div className="flex h-14 items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <MobileNav role={role} profile={profile} userEmail={user.email || ''} />
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
                <Badge variant={role === 'organizer' ? 'success' : 'secondary'} className="capitalize border-primary/20 bg-primary/10 text-primary">
                  {role}
                </Badge>
              </div>
            </div>
          </div>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-6xl relative">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
