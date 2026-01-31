import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardNavigationProvider } from '@/components/dashboard/navigation-provider'
import { DashboardNavLink } from '@/components/dashboard/nav-link'
import { SignOutForm } from '@/components/dashboard/signout-form'
import { Badge } from '@/components/ui/badge'
import { HistoryBackIconButton } from '@/components/app/history-back'

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
    <DashboardNavigationProvider>
      <div className="min-h-screen bg-muted/30">
        <div className="mx-auto flex min-h-screen w-full max-w-7xl">
          {/* Sidebar (desktop) */}
          <aside className="hidden w-72 flex-col border-r bg-background px-4 py-5 md:flex">
            <div className="flex items-center justify-between">
              <DashboardNavLink href="/dashboard" className="px-2 py-1">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <span className="text-sm font-semibold">ED</span>
                  </div>
                  <div className="leading-tight">
                    <div className="text-sm font-semibold">EntryDesk</div>
                    <div className="text-xs text-muted-foreground">Dashboard</div>
                  </div>
                </div>
              </DashboardNavLink>
              <Badge variant={role === 'organizer' ? 'success' : 'secondary'} className="capitalize">
                {role}
              </Badge>
            </div>

            <div className="mt-6 flex flex-1 flex-col gap-1">
              <p className="px-2 pb-1 text-xs font-medium text-muted-foreground">Overview</p>
              <DashboardNavLink href="/dashboard">Home</DashboardNavLink>

              {role === 'organizer' ? (
                <>
                  <p className="mt-5 px-2 pb-1 text-xs font-medium text-muted-foreground">Organizer</p>
                  <DashboardNavLink href="/dashboard/events">Events</DashboardNavLink>
                  <DashboardNavLink href="/dashboard/approvals">Approvals</DashboardNavLink>
                </>
              ) : (
                <>
                  <p className="mt-5 px-2 pb-1 text-xs font-medium text-muted-foreground">Coach</p>
                  <DashboardNavLink href="/dashboard/dojos">Dojos</DashboardNavLink>
                  <DashboardNavLink href="/dashboard/students">Students</DashboardNavLink>
                  <DashboardNavLink href="/dashboard/entries">Entries</DashboardNavLink>
                  <DashboardNavLink href="/dashboard/events-browser">Browse Events</DashboardNavLink>
                </>
              )}
            </div>

            <div className="mt-6 border-t pt-4">
              <div className="px-2">
                <div className="text-sm font-medium">{profile?.full_name || user.email}</div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
              </div>
              <div className="mt-3 px-2">
                <SignOutForm />
              </div>
            </div>
          </aside>

          {/* Main */}
          <div className="flex min-w-0 flex-1 flex-col">
            {/* Mobile top bar */}
            <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur md:hidden">
              <div className="flex h-14 items-center justify-between px-4">
                <DashboardNavLink href="/dashboard" className="px-0 py-0">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <span className="text-xs font-semibold">ED</span>
                    </div>
                    <span className="text-sm font-semibold">EntryDesk</span>
                  </div>
                </DashboardNavLink>
                <Badge variant={role === 'organizer' ? 'success' : 'secondary'} className="capitalize">
                  {role}
                </Badge>
              </div>
            </div>

            <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
              <div className="mx-auto w-full max-w-6xl">
                <div className="mb-4 flex items-center gap-2">
                  <HistoryBackIconButton fallbackHref="/dashboard" />
                </div>
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </DashboardNavigationProvider>
  )
}
