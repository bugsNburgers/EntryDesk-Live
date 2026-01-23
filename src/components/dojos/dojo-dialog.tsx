'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createDojo, updateDojo } from '@/app/dashboard/dojos/actions'
import { useRouter } from 'next/navigation'

interface DojoDialogProps {
  dojo?: {
    id: string
    name: string
  }
  children?: React.ReactNode // For the trigger button
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function DojoDialog({ dojo, children, open, onOpenChange }: DojoDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const isEditing = !!dojo
  
  // Handle both controlled and uncontrolled state
  const show = open !== undefined ? open : isOpen
  const setShow = onOpenChange || setIsOpen
  
  const handleSubmit = async (formData: FormData) => {
    try {
        if (isEditing) {
            await updateDojo(dojo.id, formData)
        } else {
            await createDojo(formData)
        }
        setShow(false)
    } catch (error) {
        console.error(error)
        alert('Failed to save dojo')
    }
  }

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogTrigger asChild>
        {children || <Button>Add Dojo</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Dojo' : 'Add New Dojo'}</DialogTitle>
          <DialogDescription>
            {isEditing 
                ? "Make changes to your dojo here. Click save when you're done." 
                : "Add a new dojo to manage your students."}
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
            <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                Name
                </Label>
                <Input
                id="name"
                name="name"
                defaultValue={dojo?.name}
                className="col-span-3"
                required
                />
            </div>
            </div>
            <DialogFooter>
            <Button type="submit">Save changes</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
