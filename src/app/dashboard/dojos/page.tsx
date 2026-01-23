import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { DojoDialog } from '@/components/dojos/dojo-dialog'
import { DojoActions } from '@/components/dojos/dojo-actions'

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
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">My Dojos</h1>
            <p className="text-muted-foreground">Manage your schools and locations.</p>
        </div>
        <DojoDialog>
            <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Dojo
            </Button>
        </DojoDialog>
        
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dojos && dojos.length > 0 ? (
            dojos.map((dojo) => (
                <Card key={dojo.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg font-bold">
                            {dojo.name}
                        </CardTitle>
                        <DojoActions dojo={dojo} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground mt-2">
                            {/* @ts-ignore - Supabase types might imply array but count returns object/number depending on query */}
                            {dojo.students?.[0]?.count || 0} Students
                        </div>
                    </CardContent>
                </Card>
            ))
        ) : (
             <div className="col-span-full flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl space-y-4">
                 <p className="text-muted-foreground">You haven't added any dojos yet.</p>
                  <DojoDialog>
                    <Button variant="outline">Create your first Dojo</Button>
                </DojoDialog>
             </div>
        )}
      </div>
    </div>
  )
}
