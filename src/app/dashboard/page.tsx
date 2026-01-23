import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const role = profile?.role || 'coach'
  const name = profile?.full_name || user.email

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Welcome back, {name}</h1>
      
      {role === 'organizer' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader>
                    <CardTitle>Total Events</CardTitle>
                    <CardDescription>Active and upcoming</CardDescription>
                </CardHeader>
                <CardContent className="text-3xl font-bold text-primary">0</CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Pending Approvals</CardTitle>
                    <CardDescription>Coach requests</CardDescription>
                </CardHeader>
                <CardContent className="text-3xl font-bold text-yellow-600">0</CardContent>
            </Card>
        </div>
      ) : (
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             <Card>
                <CardHeader>
                    <CardTitle>My Dojos</CardTitle>
                    <CardDescription>Managed locations</CardDescription>
                </CardHeader>
                <CardContent className="text-3xl font-bold text-primary">0</CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Total Students</CardTitle>
                    <CardDescription>Registered athletes</CardDescription>
                </CardHeader>
                <CardContent className="text-3xl font-bold text-primary">0</CardContent>
            </Card>
         </div>
      )}
    </div>
  )
}
