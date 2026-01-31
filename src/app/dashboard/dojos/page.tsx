import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { DojoDialog } from '@/components/dojos/dojo-dialog'
import { DojoActions } from '@/components/dojos/dojo-actions'
import { DashboardPageHeader } from '@/components/dashboard/page-header'
import { Badge } from '@/components/ui/badge'

export default async function DojosPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Fetch coach's dojos with student count
    // Using explicit join for count
    const { data: dojos } = await supabase
        .from('dojos')
        .select('*, students(count)')
        .eq('coach_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <DashboardPageHeader
                title="Dojos"
                description="Manage your schools and locations."
                actions={
                    <DojoDialog>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Dojo
                        </Button>
                    </DojoDialog>
                }
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {dojos && dojos.length > 0 ? (
                    dojos.map((dojo) => (
                        <Card key={dojo.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <CardTitle className="text-base">{dojo.name}</CardTitle>
                                        <CardDescription>Dojo roster & students</CardDescription>
                                    </div>
                                    <DojoActions dojo={dojo} />
                                </div>
                            </CardHeader>
                            <CardContent className="flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    {/* @ts-ignore - Supabase types might imply array but count returns object/number depending on query */}
                                    {dojo.students?.[0]?.count || 0} students
                                </div>
                                <Badge variant="secondary">Coach</Badge>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full rounded-xl border-2 border-dashed bg-muted/10 py-12 text-center text-muted-foreground">
                        <p className="font-medium text-foreground">No dojos yet</p>
                        <p className="text-sm">Create your first dojo to start adding students.</p>
                        <div className="mt-4 inline-flex">
                            <DojoDialog>
                                <Button variant="outline">Create your first dojo</Button>
                            </DojoDialog>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
