import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StudentDialog } from '@/components/students/student-dialog'
import { StudentActions } from '@/components/students/student-actions'
import { StudentBulkUpload } from '@/components/students/student-bulk-upload'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from 'lucide-react'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function StudentsPage({
    searchParams,
  }: {
    searchParams: { [key: string]: string | string[] | undefined }
  }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // URL Params
  const page = Number(searchParams['page']) || 1
  const query = searchParams['q'] as string || ''
  const limit = 50
  const from = (page - 1) * limit
  const to = from + limit - 1

  // Fetch Dojos for filter dropdown (add filter later if needed) and for Dialogs
  const { data: dojos } = await supabase
    .from('dojos')
    .select('id, name')
    .eq('coach_id', user.id)

  // Build query
  let supabaseQuery = supabase
    .from('students')
    .select('*, dojos(name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (query) {
      supabaseQuery = supabaseQuery.ilike('name', `%${query}%`)
  }

  // RLS handles protecting data to only coach's students (via dojo relationship)
  // However, for explicit text search, strict RLS often works, but sometimes joins need explicit filters.
  // Our RLS: "exists (select 1 from dojos where dojos.id = students.dojo_id and dojos.coach_id = auth.uid())"
  // This applies to all selects, so we are good.

  const { data: students, count } = await supabaseQuery

  const totalPages = count ? Math.ceil(count / limit) : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Students</h1>
            <p className="text-muted-foreground">Manage your athletes across all dojos.</p>
        </div>
        <div className="flex gap-2">
            <StudentBulkUpload dojos={dojos || []} />
            <StudentDialog dojos={dojos || []} />
        </div>
      </div>

      <div className="flex gap-2 items-center">
            {/* simple search form using GET */}
            <form className="flex-1 flex gap-2" action="/dashboard/students">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        name="q"
                        placeholder="Search students..."
                        className="pl-8 w-full"
                        defaultValue={query}
                    />
                </div>
                 <Button type="submit" variant="secondary">Search</Button>
            </form>
      </div>

      <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                     <CardTitle>All Students</CardTitle>
                    <CardDescription>
                        {count} registered athletes. Showing {students?.length || 0}.
                    </CardDescription>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1}
                        asChild
                    >
                        <Link href={`/dashboard/students?page=${page - 1}&q=${query}`}>Previous</Link>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages}
                        asChild
                    >
                         <Link href={`/dashboard/students?page=${page + 1}&q=${query}`}>Next</Link>
                    </Button>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-0">
             {students && students.length > 0 ? (
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Name</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Dojo</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Rank</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Gender</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Weight</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {students.map((student) => (
                                <tr key={student.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <td className="p-4 align-middle font-medium">{student.name}</td>
                                    {/* @ts-ignore */}
                                    <td className="p-4 align-middle">{student.dojos?.name}</td>
                                    <td className="p-4 align-middle capitalize">{student.rank}</td>
                                    <td className="p-4 align-middle capitalize">{student.gender}</td>
                                    <td className="p-4 align-middle">{student.weight ? `${student.weight} kg` : '-'}</td>
                                    <td className="p-4 align-middle text-right">
                                        <StudentActions student={student} dojos={dojos || []} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             ) : (
                <div className="text-center py-12 text-muted-foreground">
                    <p>No students found.</p>
                </div>
             )}
        </CardContent>
      </Card>
    </div>
  )
}
