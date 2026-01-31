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
import { StudentDataTable } from '@/components/students/student-data-table'
import { DashboardPageHeader } from '@/components/dashboard/page-header'

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // URL Params
  const resolvedSearchParams = await searchParams
  const page = Number(resolvedSearchParams['page']) || 1
  const query = resolvedSearchParams['q'] as string || ''
  const limit = 50
  const from = (page - 1) * limit
  const to = from + limit - 1

  // Fetch Dojos for filter dropdown (add filter later if needed) and for Dialogs
  const { data: dojos } = await supabase
    .from('dojos')
    .select('id, name')
    .eq('coach_id', user.id)

  /* Fetch ALL students for the coach to enable client-side fuse.js search */
  const { data: students } = await supabase
    .from('students')
    .select('*, dojos(name)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Students"
        description="Manage your athletes across all dojos."
        actions={
          <>
            <StudentBulkUpload dojos={dojos || []} />
            <StudentDialog dojos={dojos || []} />
          </>
        }
      />

      <Card>
        <CardContent className="p-6">
          <StudentDataTable data={students || []} dojos={dojos || []} />
        </CardContent>
      </Card>
    </div>
  )
}
