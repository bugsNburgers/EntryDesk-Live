import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'

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
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{event.title}</h1>
                    <div className="flex text-sm text-muted-foreground gap-4">
                        <span>{new Date(event.start_date).toLocaleDateString()}</span>
                        <span className="capitalize">{event.event_type}</span>
                    </div>
                </div>
            </div>

            {children}
        </div>
    )
}
