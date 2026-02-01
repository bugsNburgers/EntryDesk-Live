import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { AppNavLink } from '@/components/app/nav-link'
import { Badge } from '@/components/ui/badge'
import { ThemeSwitch } from '@/components/app/theme-toggle'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch public events
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('is_public', true)
    .order('start_date', { ascending: true })

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/20">
      {/* Background Decor */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]" />
        <div className="absolute right-0 bottom-0 -z-10 h-[400px] w-[400px] rounded-full bg-primary/10 opacity-20 blur-[100px]" />
      </div>

      {/* Public Navbar - Glassmorphic */}
      <header className="sticky top-0 z-50 glass border-b-0">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <span className="text-sm font-bold">ED</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold tracking-tight">EntryDesk</div>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            <ThemeSwitch className="mr-2" />
            <Link
              href="#features"
              className="hidden rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:inline-flex"
            >
              Features
            </Link>
            <Link
              href="#events"
              className="hidden rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:inline-flex"
            >
              Events
            </Link>

            {user ? (
              <AppNavLink href="/dashboard">
                <Button className="rounded-full shadow-lg shadow-primary/20">Dashboard</Button>
              </AppNavLink>
            ) : (
              <>
                <AppNavLink href="/login">
                  <Button variant="ghost" className="rounded-full">Login</Button>
                </AppNavLink>
                <AppNavLink href="/login">
                  <Button className="rounded-full shadow-lg shadow-primary/20">Get Started</Button>
                </AppNavLink>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-20 pb-32">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col justify-center">
            <Badge variant="outline" className="w-fit rounded-full border-primary/20 bg-primary/5 text-primary px-3 py-1">
              v2.0 Now Live
            </Badge>
            <h1 className="mt-6 text-5xl font-bold tracking-tight sm:text-6xl text-foreground">
              Run tournaments <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
                without the chaos.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
              The all-in-one platform for martial arts events. sophisticated registrations, automated brackets, and instant approvals.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              {user ? (
                <AppNavLink href="/dashboard">
                  <Button size="lg" className="rounded-full h-12 px-8 text-base shadow-xl shadow-primary/25">
                    Go to Dashboard
                  </Button>
                </AppNavLink>
              ) : (
                <AppNavLink href="/login">
                  <Button size="lg" className="rounded-full h-12 px-8 text-base shadow-xl shadow-primary/25">
                    Start Free Trial
                  </Button>
                </AppNavLink>
              )}
              <Button variant="ghost" size="lg" className="rounded-full h-12 px-8 text-base text-muted-foreground">
                View Demo
              </Button>
            </div>

            <div className="mt-12 flex gap-8 border-t border-border/50 pt-8">
              <div>
                <div className="text-2xl font-bold text-foreground">500+</div>
                <div className="text-sm text-muted-foreground">Active Dojos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">50k+</div>
                <div className="text-sm text-muted-foreground">Entries Processed</div>
              </div>
            </div>
          </div>

          {/* Glassmorphic Product Preview - Left: Organizer, Right: Coach (More minimal) */}
          <div className="relative perspective-1000 mt-12 lg:mt-0">
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 to-emerald-400/30 rounded-[2rem] opacity-40 blur-3xl" />

            <div className="relative">
              {/* Main Card (Organizer View style) */}
              <div className="glass rounded-2xl overflow-hidden shadow-2xl border-white/10 dark:border-white/5 transform transition-transform duration-500 hover:scale-[1.01] hover:-translate-y-2 z-20 relative">
                <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
                  </div>
                  <div className="h-2 w-20 rounded-full bg-white/10" />
                </div>

                <div className="p-5 bg-background/40 space-y-5">
                  {/* Header line */}
                  <div className="flex justify-between items-center">
                    <div className="h-8 w-8 rounded-lg bg-primary/20" />
                    <div className="flex gap-2">
                      <div className="h-8 w-20 rounded-lg bg-white/5" />
                      <div className="h-8 w-8 rounded-full bg-white/10" />
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="glass rounded-lg p-3 border-white/5 bg-background/30">
                        <div className="h-3 w-16 rounded bg-white/10 mb-2" />
                        <div className="h-6 w-10 rounded bg-white/20" />
                      </div>
                    ))}
                  </div>

                  {/* Table abstraction */}
                  <div className="glass rounded-xl border-white/5 bg-background/30 overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/5 flex justify-between">
                      <div className="h-3 w-24 rounded bg-white/10" />
                      <div className="h-3 w-12 rounded bg-white/10" />
                    </div>
                    <div className="space-y-[1px]">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="px-4 py-3 flex items-center justify-between bg-white/[0.02]">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-white/10" />
                            <div className="space-y-1">
                              <div className="h-3 w-24 rounded bg-white/10" />
                              <div className="h-2 w-16 rounded bg-white/5" />
                            </div>
                          </div>
                          <div className="h-6 w-16 rounded-full bg-emerald-500/20" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary Card (Coach/Mobile style) - Absolute positioned behind/offset */}
              <div className="absolute -right-12 -bottom-12 w-[80%] glass rounded-2xl overflow-hidden shadow-2xl border-white/10 dark:border-white/5 z-10 opacity-80 scale-90 rotate-3 transform backdrop-blur-sm grayscale-[0.2]">
                <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3">
                  <div className="h-2 w-12 rounded-full bg-white/10" />
                </div>
                <div className="p-4 bg-background/40 space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-indigo-500/20" />
                    <div>
                      <div className="h-4 w-32 rounded bg-white/15 mb-1" />
                      <div className="h-3 w-20 rounded bg-white/10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[1, 2].map(i => (
                      <div key={i} className="h-16 rounded-xl bg-white/5 w-full" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section id="features" className="py-24 relative">
        <div className="absolute inset-0 -z-10 bg-secondary/30 skew-y-3 transform origin-top-left h-full" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 md:text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Everything is connected.</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              A unified system where data flows seamlessly between organizers, coaches, and athletes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 grid-rows-1 gap-4 h-auto lg:h-[300px]">
            {/* Feature 1: Large Block */}
            <div className="glass rounded-[2rem] p-8 md:col-span-2 border border-white/10 shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-foreground"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
              </div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-6">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Centralized Management</h3>
                  <p className="mt-2 text-muted-foreground">One dashboard to control every aspect of your tournament. From initial setup to final podium results.</p>
                </div>
              </div>
            </div>

            {/* Feature 2: Tall Block (Now just wide block since we removed bottom row) */}
            <div className="glass rounded-[2rem] p-6 md:col-span-2 border border-white/10 shadow-lg flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-500 mb-4">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-foreground">Coach Portal</h3>
                <p className="mt-2 text-sm text-muted-foreground">Dedicated access for dojo heads to manage their own rosters.</p>
              </div>

              <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-4">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-background"></div>
                  <div className="w-8 h-8 rounded-full bg-indigo-500 border-2 border-background"></div>
                  <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-background"></div>
                </div>
                <div className="text-xs text-muted-foreground">Used by 500+ Dojos</div>
              </div>
            </div>

            {/* Removed Exports and Live Results as requested */}
          </div>
        </div>
      </section>

      {/* Event Listing Section - Refined */}
      <section id="events" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Upcoming Events</h2>
          </div>

          {events && events.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <div key={event.id} className="group relative rounded-[2rem] border bg-card text-card-foreground shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 z-10">
                    <Badge className="glass bg-white/20 hover:bg-white/30 text-foreground border-white/20 backdrop-blur-md">
                      {event.event_type}
                    </Badge>
                  </div>
                  <div className="h-32 bg-gradient-to-br from-primary/20 to-purple-500/20" />
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mb-4">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {new Date(event.start_date).toLocaleDateString()}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-6">
                      {event.description || "No description provided."}
                    </p>
                    <AppNavLink href={`/login?next=/events/${event.id}`}>
                      <Button className="w-full rounded-xl shadow-lg shadow-primary/10">View Details</Button>
                    </AppNavLink>
                  </div>
                </div>
              ))}
            </div>
          ) : (

            <div className="mt-6 text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/10">
              <p>No public events currently scheduled.</p>
              <p className="text-sm">Check back later or login to manage your events.</p>
            </div>
          )}
        </div>
      </section>

    </div>
  )
}
