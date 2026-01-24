import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

export default async function EventLayout({
    children,
    params,
  }: {
    children: React.ReactNode
    params: Promise<{ id: string }>
  }) {
    // Await params before using its properties
    const { id } = await params
    const supabase = await createClient()

    const { data: event } = await supabase
        .from('events')
         .select('*')
         .eq('id', id)
         .single()
    
    if (!event) notFound()

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/events">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                     <h1 className="text-2xl font-bold tracking-tight">{event.title}</h1>
                     <div className="flex text-sm text-muted-foreground gap-4">
                        <span>{new Date(event.start_date).toLocaleDateString()}</span>
                        <span className="capitalize">{event.event_type}</span>
                     </div>
                </div>
            </div>
            
            <div className="border-b flex gap-6 text-sm font-medium">
                <Link href={`/dashboard/events/${id}`} className="pb-2 border-b-2 border-transparent hover:border-primary">Overview</Link>
                {event.event_type === 'tournament' && (
                     <Link href={`/dashboard/events/${id}/categories`} className="pb-2 border-b-2 border-transparent hover:border-primary">Categories</Link>
                )}
                <Link href={`/dashboard/events/${id}/entries`} className="pb-2 border-b-2 border-transparent hover:border-primary">Entries</Link>
                <Link href={`/dashboard/events/${id}/approvals`} className="pb-2 border-b-2 border-transparent hover:border-primary">Approvals</Link>
            </div>

            {children}
        </div>
    )
}
