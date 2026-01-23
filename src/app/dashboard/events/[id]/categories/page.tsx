import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CategoryDialog } from '@/components/categories/category-dialog'
import { CategoryActions } from '@/components/categories/category-actions'

// This component is async because it's a Server Component
export default async function CategoriesPage({ params }: { params: { id: string } }) {
  // Await the params to extract the 'id'
  const { id } = await params
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('event_id', id)
    .order('name')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-xl font-bold tracking-tight">Categories</h2>
            <p className="text-muted-foreground">Define age, weight, and belt divisions.</p>
        </div>
        <CategoryDialog eventId={id} />
      </div>

      <Card>
        <CardContent className="p-0">
             {categories && categories.length > 0 ? (
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Name</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Gender</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Age</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Weight</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Rank</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {categories.map((cat) => (
                                <tr key={cat.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <td className="p-4 align-middle font-medium">{cat.name}</td>
                                    <td className="p-4 align-middle capitalize">{cat.gender}</td>
                                    <td className="p-4 align-middle">
                                        {cat.min_age && cat.max_age ? `${cat.min_age}-${cat.max_age} yrs` : 'Open'}
                                    </td>
                                    <td className="p-4 align-middle">
                                        {cat.min_weight && cat.max_weight ? `${cat.min_weight}-${cat.max_weight} kg` : 'Open'}
                                    </td>
                                    <td className="p-4 align-middle capitalize">
                                        {cat.min_rank && cat.max_rank ? `${cat.min_rank} - ${cat.max_rank}` : 'All Belts'}
                                    </td>
                                    <td className="p-4 align-middle text-right">
                                        <CategoryActions category={cat} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             ) : (
                <div className="text-center py-8 text-muted-foreground">
                    No categories defined.
                </div>
             )}
        </CardContent>
      </Card>
    </div>
  )
}
