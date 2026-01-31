import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardNavigationProvider } from '@/components/dashboard/navigation-provider'
import { DashboardNavLink } from '@/components/dashboard/nav-link'
import { SignOutForm } from '@/components/dashboard/signout-form'

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
      <div className="flex min-h-screen flex-col md:flex-row">
        {/* Sidebar for Desktop / Navbar for Mobile - Simplified for now */}
        <aside className="w-full md:w-64 bg-secondary border-r p-4 hidden md:flex flex-col gap-4">
          <DashboardNavLink href="/dashboard" className="text-xl font-bold text-primary mb-4">
            EntryDesk
          </DashboardNavLink>
          <div className="flex flex-col gap-2 flex-1">
            <DashboardNavLink href="/dashboard" className="px-4 py-2 hover:bg-white/50 rounded-md">Dashboard</DashboardNavLink>
            {role === 'organizer' ? (
              <>
                <DashboardNavLink href="/dashboard/events" className="px-4 py-2 hover:bg-white/50 rounded-md">Events</DashboardNavLink>
                <DashboardNavLink href="/dashboard/approvals" className="px-4 py-2 hover:bg-white/50 rounded-md">Approvals</DashboardNavLink>
              </>
            ) : (
              <>
                <DashboardNavLink href="/dashboard/dojos" className="px-4 py-2 hover:bg-white/50 rounded-md">My Dojos</DashboardNavLink>
                <DashboardNavLink href="/dashboard/students" className="px-4 py-2 hover:bg-white/50 rounded-md">Students</DashboardNavLink>
                <DashboardNavLink href="/dashboard/entries" className="px-4 py-2 hover:bg-white/50 rounded-md">My Entries</DashboardNavLink>
                <DashboardNavLink href="/dashboard/events-browser" className="px-4 py-2 hover:bg-white/50 rounded-md">Browse Events</DashboardNavLink>
              </>
            )}
          </div>
          <div className="mt-auto pt-4 border-t">
            <div className="text-sm font-medium mb-2">{profile?.full_name || user.email}</div>
            <div className="text-xs text-muted-foreground mb-2 capitalize">{role}</div>
            <SignOutForm />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 bg-background">
          <div className="md:hidden mb-6 flex justify-between items-center">
            <DashboardNavLink href="/dashboard" className="text-xl font-bold text-primary">EntryDesk</DashboardNavLink>
            {/* Mobile Menu Trigger would go here */}
          </div>
          {children}
        </main>
      </div>
    </DashboardNavigationProvider>
  )
}
