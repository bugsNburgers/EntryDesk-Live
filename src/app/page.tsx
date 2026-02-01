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
    <div className="min-h-screen bg-background">
      {/* Public Navbar */}
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-sm font-semibold">ED</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">EntryDesk</div>
              <div className="text-xs text-muted-foreground">Event operations made simple</div>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            <ThemeSwitch className="mr-1" />
            <Link
              href="#features"
              className="hidden rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground sm:inline-flex"
            >
              Features
            </Link>
            <Link
              href="#events"
              className="hidden rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground sm:inline-flex"
            >
              Events
            </Link>

            {user ? (
              <AppNavLink href="/dashboard">
                <Button>Dashboard</Button>
              </AppNavLink>
            ) : (
              <>
                <AppNavLink href="/login">
                  <Button variant="ghost">Login</Button>
                </AppNavLink>
                <AppNavLink href="/login">
                  <Button>Get Started</Button>
                </AppNavLink>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-background to-muted/30">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20">
          <div className="flex flex-col justify-center">
            <Badge variant="secondary" className="w-fit">
              Built for organizers and coaches
            </Badge>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Run tournaments and seminars without chaos.
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
              Create events, manage registrations, approve coaches, and export entries — with a clean dashboard your team
              actually enjoys using.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              {user ? (
                <AppNavLink href="/dashboard">
                  <Button size="lg">Go to Dashboard</Button>
                </AppNavLink>
              ) : (
                <AppNavLink href="/login">
                  <Button size="lg">Get Started</Button>
                </AppNavLink>
              )}
              <Link href="#events" className="text-sm text-muted-foreground hover:text-foreground">
                Browse upcoming events →
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border bg-background p-4">
                <div className="text-sm font-medium">Fast setup</div>
                <div className="mt-1 text-xs text-muted-foreground">Events, categories, approvals</div>
              </div>
              <div className="rounded-xl border bg-background p-4">
                <div className="text-sm font-medium">Coach-ready</div>
                <div className="mt-1 text-xs text-muted-foreground">Students, entries, status</div>
              </div>
              <div className="rounded-xl border bg-background p-4">
                <div className="text-sm font-medium">Exportable</div>
                <div className="mt-1 text-xs text-muted-foreground">Print, export, share</div>
              </div>
            </div>
          </div>

          {/* Product preview */}
          <div className="relative">
            <div className="absolute -inset-6 rounded-3xl bg-gradient-to-tr from-primary/10 via-transparent to-primary/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-2xl border bg-background shadow-sm">
              <div className="border-b px-5 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Organizer dashboard</div>
                  <Badge variant="success">Live</Badge>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">Approvals • Events • Exports</div>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border bg-muted/30 p-4">
                    <div className="text-xs text-muted-foreground">Active events</div>
                    <div className="mt-2 h-6 w-10 rounded bg-foreground/10" />
                  </div>
                  <div className="rounded-xl border bg-muted/30 p-4">
                    <div className="text-xs text-muted-foreground">Pending approvals</div>
                    <div className="mt-2 h-6 w-10 rounded bg-foreground/10" />
                  </div>
                  <div className="rounded-xl border bg-muted/30 p-4">
                    <div className="text-xs text-muted-foreground">Entries</div>
                    <div className="mt-2 h-6 w-10 rounded bg-foreground/10" />
                  </div>
                </div>

                <div className="mt-6 overflow-hidden rounded-xl border">
                  <div className="grid grid-cols-12 gap-2 border-b bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
                    <div className="col-span-6">Event</div>
                    <div className="col-span-3">Type</div>
                    <div className="col-span-3 text-right">Status</div>
                  </div>
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 px-4 py-3">
                      <div className="col-span-6 h-3 w-4/5 rounded bg-foreground/10" />
                      <div className="col-span-3 h-3 w-2/3 rounded bg-foreground/10" />
                      <div className="col-span-3 ml-auto h-3 w-1/2 rounded bg-foreground/10" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">Everything you need</h2>
            <p className="text-sm text-muted-foreground">Clean workflows for both organizers and coaches.</p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Event setup</CardTitle>
                <CardDescription>Dates, location, categories, public visibility.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Create once, reuse patterns, and keep everything in one place.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Coach workflow</CardTitle>
                <CardDescription>Dojos, students, entries, submissions.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Add students fast, submit entries confidently, track status instantly.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Approvals + exports</CardTitle>
                <CardDescription>Review applications, export rosters and ID cards.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Keep approvals organized and export-ready for day-of operations.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Event Listing Section */}
      <section id="events" className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">Upcoming Events</h2>
            <span className="text-sm text-muted-foreground">Public events you can browse</span>
          </div>

          {events && events.length > 0 ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <Card key={event.id} className="group hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="line-clamp-2 text-base">{event.title}</CardTitle>
                      <Badge className="capitalize" variant="secondary">
                        {event.event_type}
                      </Badge>
                    </div>
                    <CardDescription>
                      {new Date(event.start_date).toLocaleDateString()} – {new Date(event.end_date).toLocaleDateString()}
                      {event.location ? ` • ${event.location}` : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {event.description || "No description provided."}
                    </p>
                    <AppNavLink href={`/login?next=/events/${event.id}`}>
                      <Button className="w-full" variant="outline">View Details</Button>
                    </AppNavLink>
                  </CardContent>
                </Card>
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
