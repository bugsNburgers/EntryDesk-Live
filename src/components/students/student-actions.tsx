'use client'

import { MoreHorizontal, Pencil, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { deleteStudent } from "@/app/dashboard/students/actions"
import { StudentDialog } from "./student-dialog"

interface Student {
    id: string
    name: string
    gender: string
    rank: string | null
    weight: number | null
    dojo_id: string
    date_of_birth: string | null
    [key: string]: any
}

interface StudentActionsProps {
    student: Student
    dojos: any[] // passed for the edit dialog
}

export function StudentActions({ student, dojos }: StudentActionsProps) {
    const [isEditOpen, setIsEditOpen] = useState(false)

    const handleDelete = async () => {
        if (confirm(`Are you sure you want to delete ${student.name}?`)) {
            await deleteStudent(student.id)
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
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                <Trash className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
        </DropdownMenuContent>
        </DropdownMenu>

        <StudentDialog 
            dojos={dojos} 
            student={student} 
            open={isEditOpen} 
            onOpenChange={setIsEditOpen} 
        />
    </>
  )
}
