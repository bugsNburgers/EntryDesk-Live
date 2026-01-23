export default async function EventOverviewPage({ params }: { params: { id: string } }) {
  const { id } = await params
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
            <h3 className="text-lg font-semibold">Total Entries</h3>
            <p className="text-3xl font-bold mt-2">0</p>
        </div>
         <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
            <h3 className="text-lg font-semibold">Pending Approvals</h3>
            <p className="text-3xl font-bold mt-2 text-yellow-600">0</p>
        </div>
    </div>
  )
}
