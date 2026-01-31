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
import { createCategory, updateCategory } from '@/app/dashboard/events/[id]/categories/actions'

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
}

interface CategoryDialogProps {
    eventId: string
    category?: Category
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function CategoryDialog({ eventId, category, open, onOpenChange }: CategoryDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const show = open !== undefined ? open : internalOpen
    const setShow = onOpenChange || setInternalOpen

    const isEditing = !!category

    // Simple state defaults if editing
    const [gender, setGender] = useState(category?.gender || '')
    const [minRank, setMinRank] = useState(category?.min_rank || '')
    const [maxRank, setMaxRank] = useState(category?.max_rank || '')

    const handleSubmit = async (formData: FormData) => {
        formData.append('gender', gender)
        if (minRank) formData.append('min_rank', minRank)
        if (maxRank) formData.append('max_rank', maxRank)

        try {
            setIsSubmitting(true)
            if (isEditing) {
                await updateCategory(category.id, eventId, formData)
            } else {
                await createCategory(eventId, formData)
            }
            setShow(false)
            if (!isEditing) {
                setGender('')
                setMinRank('')
                setMaxRank('')
            }
        } catch (error) {
            alert('Failed to save category')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={show} onOpenChange={setShow}>
            {!isEditing && (
                <DialogTrigger asChild>
                    <Button>Add Category</Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Category' : 'Add Category'}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Modify category details.' : 'Define a competition category.'}
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" name="name" defaultValue={category?.name} className="col-span-3" placeholder="e.g. Boys 10-12yrs White Belt" required />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="gender" className="text-right">Gender</Label>
                            <div className="col-span-3">
                                <Select value={gender} onValueChange={setGender} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="mixed">Mixed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Age Range</Label>
                            <div className="col-span-3 flex gap-2">
                                <Input name="min_age" type="number" placeholder="Min" defaultValue={category?.min_age || ''} />
                                <span className="py-2">-</span>
                                <Input name="max_age" type="number" placeholder="Max" defaultValue={category?.max_age || ''} />
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Weight (kg)</Label>
                            <div className="col-span-3 flex gap-2">
                                <Input name="min_weight" type="number" placeholder="Min" defaultValue={category?.min_weight || ''} />
                                <span className="py-2">-</span>
                                <Input name="max_weight" type="number" placeholder="Max" defaultValue={category?.max_weight || ''} />
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Rank</Label>
                            <div className="col-span-3 flex gap-2">
                                <Select value={minRank} onValueChange={setMinRank}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Min Belt" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="white">White</SelectItem>
                                        <SelectItem value="yellow">Yellow</SelectItem>
                                        <SelectItem value="green">Green</SelectItem>
                                        <SelectItem value="brown">Brown</SelectItem>
                                        <SelectItem value="black">Black</SelectItem>
                                    </SelectContent>
                                </Select>
                                <span className="py-2">-</span>
                                <Select value={maxRank} onValueChange={setMaxRank}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Max Belt" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="white">White</SelectItem>
                                        <SelectItem value="yellow">Yellow</SelectItem>
                                        <SelectItem value="green">Green</SelectItem>
                                        <SelectItem value="brown">Brown</SelectItem>
                                        <SelectItem value="black">Black</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
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
                                'Save Category'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
