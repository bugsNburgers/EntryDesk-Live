'use client'

import { useState, useMemo } from 'react'
import { 
  ColumnDef, 
  flexRender, 
  getCoreRowModel, 
  getPaginationRowModel, 
  getSortedRowModel, 
  getFilteredRowModel, 
  useReactTable, 
  SortingState,
  ColumnFiltersState,
  VisibilityState
} from '@tanstack/react-table'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  DropdownMenu, 
  DropdownMenuCheckboxItem, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StudentActions } from './student-actions'
import { Search, SlidersHorizontal, ChevronDown, ArrowUpDown } from 'lucide-react'
import Fuse from 'fuse.js'

interface Student {
    id: string
    name: string
    gender: string
    rank: string | null
    weight: number | null
    date_of_birth: string | null
    dojo_id: string
    dojos?: { name: string } | null
    // Add other fields as needed
}

interface StudentDataTableProps {
    data: Student[]
    dojos: { id: string, name: string }[]
}

export function StudentDataTable({ data, dojos }: StudentDataTableProps) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})
    const [globalFilter, setGlobalFilter] = useState('')

    // Fuse.js instance for fuzzy search
    const fuse = useMemo(() => new Fuse(data, {
        keys: ['name', 'dojos.name', 'rank'],
        threshold: 0.3, // Adjust for fuzziness (0.0 = exact, 1.0 = match anything)
        distance: 100,
    }), [data]);

    // Filtered Data based on Global Search (Fuse.js)
    const filteredData = useMemo(() => {
        if (!globalFilter) return data;
        return fuse.search(globalFilter).map(result => result.item);
    }, [data, globalFilter, fuse]);

    // Table Columns definition
    const columns: ColumnDef<Student>[] = [
        {
            accessorKey: "name",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => <div className="font-medium pl-4">{row.getValue("name")}</div>,
        },
        {
            accessorKey: "dojoName", // Virtual column for filtering
            id: "dojo",
            accessorFn: (row) => row.dojos?.name || "Unknown",
            header: "Dojo",
            cell: ({ row }) => <div>{row.original.dojos?.name}</div>,
            filterFn: (row, id, value) => {
                return value === "all" || row.getValue(id) === value
            },
        },
        {
            accessorKey: "gender",
            header: "Gender",
            cell: ({ row }) => <div className="capitalize">{row.getValue("gender")}</div>,
            filterFn: (row, id, value) => {
                return value === "all" || row.getValue(id) === value
            },
        },
        {
            accessorKey: "rank",
            header: "Rank",
            cell: ({ row }) => <div className="capitalize">{row.getValue("rank") || "-"}</div>,
        },
        {
            accessorKey: "weight",
            header: "Weight",
            cell: ({ row }) => {
                const w = row.getValue("weight")
                return <div>{w ? `${w} kg` : '-'}</div>
            },
        },
        {
            accessorKey: "date_of_birth",
            header: "DOB",
            cell: ({ row }) => <div>{row.getValue("date_of_birth") || '-'}</div>,
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const student = row.original
                return <StudentActions student={student} dojos={dojos} />
            },
        },
    ]

    const table = useReactTable({
        data: filteredData,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    // Filter Handlers
    const setFilter = (columnId: string, value: string) => {
        table.getColumn(columnId)?.setFilterValue(value === "all" ? "" : value)
    }

    return (
        <div className="w-full space-y-4">
            {/* Search and Filters Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
                {/* Search */}
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search students (fuzzy)..."
                        value={globalFilter}
                        onChange={(event) => setGlobalFilter(event.target.value)}
                        className="pl-8"
                    />
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-2">
                    <Select onValueChange={(val) => setFilter("dojo", val)}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="All Dojos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Dojos</SelectItem>
                            {dojos.map(dojo => (
                                <SelectItem key={dojo.id} value={dojo.name}>{dojo.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select onValueChange={(val) => setFilter("gender", val)}>
                        <SelectTrigger className="w-[110px]">
                            <SelectValue placeholder="Gender" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                    </Select>

                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="ml-auto">
                                Columns <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredRowModel().rows.length} row(s)
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}
