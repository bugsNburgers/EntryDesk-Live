'use client'

import { useState, useTransition } from 'react'
import { MoreHorizontal, Pencil, Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { deleteCategory } from '@/app/dashboard/events/[id]/categories/actions'
import { CategoryDialog } from './category-dialog'

interface Category {
    id: string
    name: string
    gender: string
    min_age: number | null
    max_age: number | null
    min_weight: number | null
    max_weight: number | null
    min_rank: string | null
    max_rank: string | null
    event_id: string
}

export function CategoryActions({ category }: { category: Category }) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this category?')) {
      startTransition(async () => {
        try {
          await deleteCategory(category.id, category.event_id)
        } catch (error) {
          alert('Failed to delete category')
        }
      })
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} className="text-destructive">
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CategoryDialog 
        eventId={category.event_id} 
        category={category} 
        open={showEditDialog} 
        onOpenChange={setShowEditDialog} 
      />
    </>
  )
}
