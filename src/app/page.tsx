import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { AppNavLink } from '@/components/app/nav-link'

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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Public Navbar */}
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="text-xl font-bold text-primary flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-white text-sm">ED</div>
            EntryDesk
          </div>
          <nav className="flex gap-4">
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

      {/* Hero Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
            Martial Arts Event Management
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            The professional platform for Tournaments, Seminars, and Black Belt Tests.
            Streamlined for Organizers and Coaches.
          </p>
          <div className="flex justify-center gap-4">
            {user ? (
              <AppNavLink href="/dashboard">
                <Button size="lg">Go to Dashboard</Button>
              </AppNavLink>
            ) : (
              <AppNavLink href="/login">
                <Button size="lg">Get Started</Button>
              </AppNavLink>
            )}
          </div>
        </div>
      </section>

      {/* Event Listing Section */}
      <section className="py-12 flex-1">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Upcoming Events</h2>

          {events && events.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                      <span className="text-xs px-2 py-1 bg-secondary rounded-full capitalize">{event.event_type}</span>
                    </div>
                    <CardDescription>{new Date(event.start_date).toLocaleDateString()}</CardDescription>
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
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
              <p>No public events currently scheduled.</p>
              <p className="text-sm">Check back later or login to manage your events.</p>
            </div>
          )}
        </div>
      </section>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} EntryDesk. All rights reserved.
      </footer>
    </div>
  )
}
