
'use client'

import { useRef, useState } from 'react'
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
import * as XLSX from 'xlsx'
import { createStudent } from '@/app/dashboard/students/actions'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, FileDown, Loader2, AlertTriangle } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Checkbox } from '@/components/ui/checkbox'
import { normalizeDobToIso } from '@/lib/date'

interface Dojo {
    id: string
    name: string
}

interface StudentBulkUploadProps {
    dojos: Dojo[]
}

interface ParsedStudent {
    id: number // temp id for key
    name: string
    gender: string
    rank: string
    weight: string
    dob: string
    status: 'pending' | 'success' | 'error'
    message?: string
    warnings: { [key: string]: string }
}

const VALID_RANKS = ['white', 'yellow', 'orange', 'green', 'blue', 'purple', 'brown', 'black', 'shodan', 'nidan', 'sandan'];

export function StudentBulkUpload({ dojos }: StudentBulkUploadProps) {
    const [open, setOpen] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [parsedData, setParsedData] = useState<ParsedStudent[]>([])
    const [selectedRowIds, setSelectedRowIds] = useState<Set<number>>(new Set())
    const [selectedDojo, setSelectedDojo] = useState<string>('')
    const [isUploading, setIsUploading] = useState(false)
    const [cancelRequestedUi, setCancelRequestedUi] = useState(false)
    const [step, setStep] = useState<'upload' | 'review'>('upload')

    const cancelRequestedRef = useRef(false)

    const handleDownloadTemplate = () => {
        const headers = ['Name', 'Gender', 'Rank', 'Weight', 'Date of Birth'];
        const ws = XLSX.utils.aoa_to_sheet([headers]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "student_import_template.xlsx");
    }

    const findHeaderIndex = (headers: any[], keywords: string[]) => {
        return headers.findIndex(h => {
            const lower = String(h).toLowerCase();
            return keywords.some(k => lower.includes(k));
        });
    }

    const validateStudent = (student: ParsedStudent): ParsedStudent => {
        const warnings: { [key: string]: string } = {};

        // Rank validation (Soft)
        if (student.rank) {
            const r = student.rank.toLowerCase();
            if (!VALID_RANKS.some(vr => r.includes(vr))) {
                warnings.rank = `Unknown rank format. valid: ${VALID_RANKS.slice(0, 3).join(', ')}...`;
            }
        }

        // Weight validation
        if (student.weight) {
            if (isNaN(parseFloat(student.weight))) {
                warnings.weight = "Invalid weight format (must be a number)";
            }
        }

        // DOB validation
        if (student.dob) {
            const iso = normalizeDobToIso(student.dob)
            if (!iso) warnings.dob = "Invalid date format (use YYYY-MM-DD)"
        }

        return { ...student, warnings };
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onload = (evt) => {
                try {
                    const bstr = evt.target?.result;
                    const wb = XLSX.read(bstr, { type: 'binary' });
                    const wsname = wb.SheetNames[0];
                    const ws = wb.Sheets[wsname];
                    const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

                    if (data.length < 2) {
                        alert('File appears empty or missing headers.');
                        return;
                    }

                    const headers = data[0];
                    const rows = data.slice(1).filter(r => r.length > 0);

                    // Fuzzy Match Headers
                    const nameIdx = findHeaderIndex(headers, ['name', 'student', 'athlete']);
                    const genderIdx = findHeaderIndex(headers, ['gender', 'sex']);
                    const rankIdx = findHeaderIndex(headers, ['rank', 'belt', 'grade']);
                    const weightIdx = findHeaderIndex(headers, ['weight', 'kg']);
                    const dobIdx = findHeaderIndex(headers, ['dob', 'birth', 'date']);

                    const normalizeGender = (val: any) => {
                        const s = String(val || '').toLowerCase().trim();
                        if (['m', 'male', 'man', 'boy'].includes(s)) return 'male';
                        if (['f', 'female', 'woman', 'girl'].includes(s)) return 'female';
                        return s;
                    };

                    const mapped: ParsedStudent[] = rows.map((row, i) => {
                        const rawDobCell = dobIdx >= 0 ? row[dobIdx] : ''
                        const normalizedDob = normalizeDobToIso(rawDobCell)
                        const raw: ParsedStudent = {
                            id: i,
                            name: row[nameIdx] || '',
                            gender: normalizeGender(row[genderIdx]),
                            rank: (row[rankIdx] || '').toString(),
                            weight: row[weightIdx] || '',
                            dob: normalizedDob ?? (rawDobCell != null ? String(rawDobCell).trim() : ''),
                            status: 'pending' as const,
                            warnings: {}
                        };
                        return validateStudent(raw);
                    }).filter(s => s.name); // Filter out empty rows

                    setParsedData(mapped);
                    setSelectedRowIds(new Set())
                    setStep('review')
                } catch (err) {
                    console.error(err)
                    alert("Failed to parse file.");
                }
            };
            reader.readAsBinaryString(selectedFile);
        }
    }

    const handleUpdateField = (index: number, field: keyof ParsedStudent, value: string) => {
        const newData = [...parsedData];
        const nextValue = field === 'dob' ? (normalizeDobToIso(value) ?? value) : value
        newData[index] = { ...newData[index], [field]: nextValue };
        // Re-validate
        newData[index] = validateStudent(newData[index]);
        setParsedData(newData);
    }

    const handleImport = async () => {
        if (!selectedDojo) {
            alert("Please select a target Dojo.");
            return;
        }

        cancelRequestedRef.current = false
        setCancelRequestedUi(false)

        setIsUploading(true);
        const newData = [...parsedData];
        let successCount = 0;

        for (let i = 0; i < newData.length; i++) {
            if (cancelRequestedRef.current) break

            const student = newData[i];
            try {
                const formData = new FormData();
                formData.append('dojo_id', selectedDojo);
                formData.append('name', student.name);
                formData.append('gender', student.gender);

                // Only append optional fields if they have NO warnings
                if (student.rank && !student.warnings.rank) {
                    formData.append('rank', student.rank);
                }
                if (student.weight && !student.warnings.weight) {
                    formData.append('weight', String(student.weight));
                }
                if (student.dob && !student.warnings.dob) {
                    formData.append('dob', String(student.dob));
                }

                await createStudent(formData);

                newData[i].status = 'success';
                successCount++;
            } catch (e: any) {
                newData[i].status = 'error';
                newData[i].message = e.message || 'Failed';
            }
        }

        setParsedData(newData);
        setIsUploading(false);

        if (cancelRequestedRef.current) {
            setCancelRequestedUi(false)
            alert(`Import cancelled. Imported ${successCount} of ${newData.length}.`)
            return
        }

        if (successCount === newData.length) {
            alert(`Successfully imported all ${successCount} students!`);
            setOpen(false);
            setStep('upload');
            setFile(null);
        } else {
            alert(`Imported ${successCount} students. Some failed (highlighted in red). Please fix and retry.`);
        }
    }

    const reset = () => {
        cancelRequestedRef.current = false
        setCancelRequestedUi(false)
        setStep('upload');
        setFile(null);
        setParsedData([]);
        setSelectedRowIds(new Set())
    }

    const requestCancelImport = () => {
        cancelRequestedRef.current = true
        setCancelRequestedUi(true)
    }

    const isAllRowsSelected = parsedData.length > 0 && selectedRowIds.size === parsedData.length
    const isSomeRowsSelected = selectedRowIds.size > 0 && selectedRowIds.size < parsedData.length

    const toggleAllRows = () => {
        if (isUploading) return

        setSelectedRowIds((prev) => {
            if (parsedData.length === 0) return prev
            if (prev.size === parsedData.length) return new Set()
            return new Set(parsedData.map((s) => s.id))
        })
    }

    const toggleRow = (rowId: number) => {
        if (isUploading) return

        setSelectedRowIds((prev) => {
            const next = new Set(prev)
            if (next.has(rowId)) next.delete(rowId)
            else next.add(rowId)
            return next
        })
    }

    const deleteSelectedRows = () => {
        if (isUploading) return
        if (selectedRowIds.size === 0) return

        setParsedData((prev) => prev.filter((s) => !selectedRowIds.has(s.id)))
        setSelectedRowIds(new Set())
    }

    const WarningIcon = ({ msg }: { msg?: string }) => {
        if (!msg) return null;
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <AlertTriangle className="h-4 w-4 text-amber-500 absolute right-2 top-2.5 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{msg}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(val) => {
                // If an import is running, require explicit cancel.
                if (!val && isUploading) return
                setOpen(val)
                if (!val) reset()
            }}
        >
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" /> Bulk Upload
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Bulk Upload Students</DialogTitle>
                    <DialogDescription>
                        {step === 'upload' ? 'Upload an Excel file to add students.' : 'Review data. Fields with warnings will be ignored during import.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-auto py-4">
                    {step === 'upload' ? (
                        <div className="grid gap-6">
                            <div className="flex text-sm text-muted-foreground bg-muted p-4 rounded border">
                                <div className="flex-1 space-y-1">
                                    <p><strong>Instructions:</strong></p>
                                    <ol className="list-decimal list-inside space-y-1">
                                        <li>Download the template.</li>
                                        <li>Fill in the details. You can be approximate (e.g., "Male" or "M", "White Belt").</li>
                                        <li>Partial import is allowed: Name and Gender are required, others can be filled later.</li>
                                        <li>Upload here. We'll try to match columns automatically.</li>
                                    </ol>
                                </div>
                                <Button size="sm" variant="outline" onClick={handleDownloadTemplate}>
                                    <FileDown className="mr-2 h-4 w-4" /> Template
                                </Button>
                            </div>

                            <div className="grid gap-2">
                                <Label>Target Dojo</Label>
                                <Select value={selectedDojo} onValueChange={setSelectedDojo}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Dojo..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {dojos.map(dojo => (
                                            <SelectItem key={dojo.id} value={dojo.id}>{dojo.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label>Upload File</Label>
                                <div className="border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors">
                                    <Upload className="h-10 w-10 mb-2" />
                                    <p className="mb-2">Drag and drop or click to browse</p>
                                    <Input type="file" className="w-full max-w-xs" accept=".xlsx, .xls, .csv" onChange={handleFileChange} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium">Review Data ({parsedData.length} students)</h3>
                                <Button variant="ghost" size="sm" onClick={reset}>Upload Different File</Button>
                            </div>

                            <div className="grid gap-2">
                                <Label>Target Dojo</Label>
                                <Select value={selectedDojo} onValueChange={setSelectedDojo}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Dojo..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {dojos.map(dojo => (
                                            <SelectItem key={dojo.id} value={dojo.id}>{dojo.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="rounded-md border">
                                <div className="flex items-center justify-end gap-2 border-b bg-muted/30 px-3 py-2">
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={deleteSelectedRows}
                                        disabled={isUploading || selectedRowIds.size === 0}
                                    >
                                        Delete selected
                                    </Button>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[30px]">#</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Gender</TableHead>
                                            <TableHead>Rank</TableHead>
                                            <TableHead>Weight</TableHead>
                                            <TableHead>DOB</TableHead>
                                            <TableHead className="w-[100px]">Status</TableHead>
                                            <TableHead className="w-[60px] text-right">
                                                <div className="flex justify-end">
                                                    <Checkbox
                                                        checked={isAllRowsSelected ? true : isSomeRowsSelected ? 'indeterminate' : false}
                                                        onCheckedChange={toggleAllRows}
                                                        disabled={isUploading || parsedData.length === 0}
                                                        aria-label="Select all rows"
                                                    />
                                                </div>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {parsedData.map((student, idx) => (
                                            <TableRow key={student.id} className={student.status === 'error' ? 'bg-destructive/10' : student.status === 'success' ? 'bg-emerald-50' : ''}>
                                                <TableCell>{idx + 1}</TableCell>
                                                <TableCell>
                                                    <Input value={student.name} onChange={(e) => handleUpdateField(idx, 'name', e.target.value)} className="h-8" />
                                                </TableCell>
                                                <TableCell>
                                                    <Select value={student.gender} onValueChange={(val) => handleUpdateField(idx, 'gender', val)}>
                                                        <SelectTrigger className="h-8 w-[100px]">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="male">Male</SelectItem>
                                                            <SelectItem value="female">Female</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell className="relative group">
                                                    <Input value={student.rank} onChange={(e) => handleUpdateField(idx, 'rank', e.target.value)} className={`h-8 w-[120px] ${student.warnings.rank ? 'border-amber-500 pr-8' : ''}`} />
                                                    <WarningIcon msg={student.warnings.rank} />
                                                </TableCell>
                                                <TableCell className="relative group">
                                                    <Input value={student.weight} onChange={(e) => handleUpdateField(idx, 'weight', e.target.value)} className={`h-8 w-[80px] ${student.warnings.weight ? 'border-amber-500 pr-8' : ''}`} type="text" />
                                                    <WarningIcon msg={student.warnings.weight} />
                                                </TableCell>
                                                <TableCell className="relative group">
                                                    <Input value={student.dob} onChange={(e) => handleUpdateField(idx, 'dob', e.target.value)} className={`h-8 w-[130px] ${student.warnings.dob ? 'border-amber-500 pr-8' : ''}`} placeholder="YYYY-MM-DD" />
                                                    <WarningIcon msg={student.warnings.dob} />
                                                </TableCell>
                                                <TableCell>
                                                    {student.status === 'error' && <span className="text-xs text-destructive font-medium" title={student.message}>Failed</span>}
                                                    {student.status === 'success' && <span className="text-xs text-emerald-600 font-medium">Done</span>}
                                                    {student.status === 'pending' && <span className="text-xs text-muted-foreground">-</span>}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end">
                                                        <Checkbox
                                                            checked={selectedRowIds.has(student.id)}
                                                            onCheckedChange={() => toggleRow(student.id)}
                                                            disabled={isUploading}
                                                            aria-label={`Select row ${idx + 1}`}
                                                        />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    {step === 'review' && (
                        <>
                            <Button
                                onClick={handleImport}
                                disabled={isUploading || !selectedDojo || parsedData.length === 0}
                            >
                                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isUploading ? 'Importing...' : 'Confirm Import'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    if (isUploading) requestCancelImport()
                                    else setOpen(false)
                                }}
                                disabled={isUploading && cancelRequestedUi}
                            >
                                {isUploading ? (cancelRequestedUi ? 'Cancelling...' : 'Cancel Import') : 'Cancel'}
                            </Button>
                        </>
                    )}
                    {step === 'upload' && (
                        <Button variant="ghost" onClick={() => setOpen(false)}>Close</Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
