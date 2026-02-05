import { requireRole } from '@/lib/auth/require-role'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExportEntries } from '@/components/events/export-entries'
import { EntriesTable } from '@/components/events/entries-table'
import { EntryFilters } from '@/components/events/entry-filters'
import { PaginationControls } from '@/components/ui/pagination-controls'

export default async function EventEntriesPage({
    params,
    searchParams
}: {
    params: { id: string },
    searchParams: { q?: string, status?: string, coach?: string, day?: string, page?: string }
}) {
    const { id } = await params
    const { supabase } = await requireRole(['organizer', 'admin'], { redirectTo: '/dashboard' })
    const p = await searchParams

    const page = Number(p.page) || 1
    const limit = 50
    const offset = (page - 1) * limit

    // Base query on the View
    let query = supabase
        .from('organizer_entries_view')
        .select('*', { count: 'exact' })
        .eq('event_id', id)
        .neq('status', 'draft')

    // Apply filters
    if (p.q) {
        query = query.ilike('student_name', `%${p.q}%`)
    }
    if (p.status && p.status !== 'all') {
        query = query.eq('status', p.status)
    }
    if (p.coach && p.coach !== 'all') {
        query = query.eq('coach_id', p.coach)
    }
    if (p.day && p.day !== 'all') {
        query = query.eq('event_day_id', p.day)
    }

    // Execute query with pagination
    const { data: viewEntries, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

    const totalPages = count ? Math.ceil(count / limit) : 0

    // Map View Flat Data to Nested Structure for Table
    const entries = viewEntries?.map(e => ({
        id: e.entry_id, // Map entry_id (view) to id (table expectation)
        event_id: e.event_id,
        status: e.status,
        participation_type: e.participation_type,
        students: {
            name: e.student_name,
            rank: e.student_rank,
            weight: e.student_weight,
            dojos: { name: e.dojo_name }
        },
        categories: e.category_name ? { name: e.category_name } : null,
        event_days: e.event_day_name ? { name: e.event_day_name } : null,
        profiles: {
            full_name: e.coach_name,
            email: e.coach_email
        }
    })) || []

    // Fetch filter data from the View efficiently
    // Coaches
    const { data: coachData } = await supabase
        .from('organizer_entries_view')
        .select('coach_id, coach_name')
        .eq('event_id', id)

    // Dedup coaches
    const coachesMap = new Map()
    coachData?.forEach((c: any) => {
        if (!coachesMap.has(c.coach_id)) {
            coachesMap.set(c.coach_id, { id: c.coach_id, name: c.coach_name })
        }
    })
    const coaches = Array.from(coachesMap.values())

    // Event Days (Can still fetch from table or view, view is fine)
    const { data: dayData } = await supabase
        .from('organizer_entries_view')
        .select('event_day_id, event_day_name')
        .eq('event_id', id)
        .not('event_day_id', 'is', null)

    const daysMap = new Map()
    dayData?.forEach((d: any) => {
        if (!daysMap.has(d.event_day_id)) {
            daysMap.set(d.event_day_id, { id: d.event_day_id, name: d.event_day_name })
        }
    })
    const formattedDays = Array.from(daysMap.values())


    const exportData = entries?.map(e => ({
        Student: e.students?.name,
        Dojo: e.students?.dojos?.name,
        Category: e.categories?.name,
        Day: e.event_days?.name,
        Type: e.participation_type,
        Status: e.status,
        Coach: e.profiles?.full_name,
        Email: e.profiles?.email
    })) || []

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="gap-3">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <CardTitle>Entries</CardTitle>
                            <p className="text-sm text-muted-foreground">{count ?? 0} records</p>
                        </div>
                        <ExportEntries data={exportData} />
                    </div>
                    <EntryFilters coaches={coaches} eventDays={formattedDays} />
                </CardHeader>
                <CardContent className="p-0">
                    <EntriesTable entries={entries} />
                </CardContent>
            </Card>

            <PaginationControls page={page} totalPages={totalPages} />
        </div>
    )
}

