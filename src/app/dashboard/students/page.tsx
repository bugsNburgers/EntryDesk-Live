import { requireRole } from '@/lib/auth/require-role'
import { StudentDialog } from '@/components/students/student-dialog'
import { StudentBulkUpload } from '@/components/students/student-bulk-upload'
import { StudentDataTable } from '@/components/students/student-data-table'
import { DashboardPageHeader } from '@/components/dashboard/page-header'

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { supabase, user } = await requireRole('coach', { redirectTo: '/dashboard' })

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
    <div className="space-y-4">
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

      <div className="rounded-2xl border border-black/5 bg-gradient-to-b from-background/95 to-background/70 shadow-[0_12px_30px_-22px_rgba(0,0,0,0.25)] dark:border-white/10 dark:bg-background/40 dark:from-background/60 dark:to-background/30 dark:shadow-black/40">
        <StudentDataTable data={students || []} dojos={dojos || []} />
      </div>
    </div>
  )
}
