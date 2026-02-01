'use client'

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"
import { useAppNavigation } from "@/components/app/navigation-provider"

interface EntryFiltersProps {
  coaches: { id: string, name: string }[]
  eventDays: { id: string, name: string }[]
}

export function EntryFilters({ coaches, eventDays }: EntryFiltersProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const { beginNavigation } = useAppNavigation()

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set('q', term)
    } else {
      params.delete('q')
    }
    params.set('page', '1') // Reset to page 1 on search
    beginNavigation()
    router.replace(`${pathname}?${params.toString()}`)
  }, 300)

  const handleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.set('page', '1') // Reset to page 1 on filter
    beginNavigation()
    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center py-4">
      <div className="flex-1">
        <Input
          placeholder="Search student name..."
          onChange={(e) => handleSearch(e.target.value)}
          defaultValue={searchParams.get('q')?.toString()}
          className="max-w-sm"
        />
      </div>
      <div className="flex gap-2">
        <Select
          defaultValue={searchParams.get('status')?.toString() || 'all'}
          onValueChange={(val) => handleFilter('status', val)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>

        <Select
          defaultValue={searchParams.get('day')?.toString() || 'all'}
          onValueChange={(val) => handleFilter('day', val)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Days" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Days</SelectItem>
            {eventDays.map(day => (
              <SelectItem key={day.id} value={day.id}>{day.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          defaultValue={searchParams.get('coach')?.toString() || 'all'}
          onValueChange={(val) => handleFilter('coach', val)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Coaches" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Coaches</SelectItem>
            {coaches.map(coach => (
              <SelectItem key={coach.id} value={coach.id}>{coach.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
