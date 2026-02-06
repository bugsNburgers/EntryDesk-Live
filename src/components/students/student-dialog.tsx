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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createStudent, updateStudent } from '@/app/dashboard/students/actions'
import { normalizeDobToIso } from '@/lib/date'

interface Dojo {
    id: string
    name: string
}

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

interface StudentDialogProps {
    dojos: Dojo[]
    student?: Student
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function StudentDialog({ dojos, student, open, onOpenChange }: StudentDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Controlled vs Uncontrolled logic
    const show = open !== undefined ? open : internalOpen
    const setShow = onOpenChange || setInternalOpen

    const isEditing = !!student

    const [selectedDojo, setSelectedDojo] = useState<string>(student?.dojo_id || '')
    const [selectedGender, setSelectedGender] = useState<string>(student?.gender || '')
    const [selectedRank, setSelectedRank] = useState<string>(student?.rank || '')

    const handleSubmit = async (formData: FormData) => {
        formData.append('dojo_id', selectedDojo)
        formData.append('gender', selectedGender)
        formData.append('rank', selectedRank)

        setIsSubmitting(true)
        try {
            if (isEditing) {
                await updateStudent(student.id, formData)
            } else {
                await createStudent(formData)
            }
            setShow(false)
            if (!isEditing) {
                // Reset form for create mode
                setSelectedDojo('')
                setSelectedGender('')
                setSelectedRank('')
            }
        } catch (error) {
            alert('Failed to save student')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={show} onOpenChange={setShow}>
            {!isEditing && (
                <DialogTrigger asChild>
                    <Button>Add Student</Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Student' : 'Add New Student'}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Update student details.' : 'Add a new student to your roster.'}
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="dojo" className="text-right">Dojo</Label>
                            <div className="col-span-3">
                                <Select value={selectedDojo} onValueChange={setSelectedDojo} required disabled={isEditing}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a Dojo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {dojos.map(dojo => (
                                            <SelectItem key={dojo.id} value={dojo.id}>{dojo.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" name="name" defaultValue={student?.name} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="gender" className="text-right">Gender</Label>
                            <div className="col-span-3">
                                <Select value={selectedGender} onValueChange={setSelectedGender} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="rank" className="text-right">Rank/Belt</Label>
                            <div className="col-span-3">
                                <Select value={selectedRank} onValueChange={setSelectedRank} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Rank" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="white">White</SelectItem>
                                        <SelectItem value="yellow">Yellow</SelectItem>
                                        <SelectItem value="blue">Blue</SelectItem>
                                        <SelectItem value="purple">Purple</SelectItem>
                                        <SelectItem value="green">Green</SelectItem>
                                        <SelectItem value="brown">Brown</SelectItem>
                                        <SelectItem value="black">Black</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="weight" className="text-right">Weight (kg)</Label>
                            <Input id="weight" name="weight" type="number" step="0.1" defaultValue={student?.weight || ''} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="dob" className="text-right">DOB</Label>
                            <Input
                                id="dob"
                                name="dob"
                                type="date"
                                defaultValue={normalizeDobToIso(student?.date_of_birth) || ''}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <span className="inline-flex items-center gap-2">
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    Saving...
                                </span>
                            ) : (
                                'Save Student'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
