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
import * as XLSX from 'xlsx'
import { createStudent } from '@/app/dashboard/students/actions'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, FileDown, Loader2, AlertCircle } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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
}

export function StudentBulkUpload({ dojos }: StudentBulkUploadProps) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedStudent[]>([])
  const [selectedDojo, setSelectedDojo] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const [step, setStep] = useState<'upload' | 'review'>('upload')

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

                const mapped: ParsedStudent[] = rows.map((row, i) => ({
                    id: i,
                    name: row[nameIdx] || '',
                    gender: (row[genderIdx] || '').toLowerCase(),
                    rank:   (row[rankIdx] || '').toLowerCase(),
                    weight: row[weightIdx] || '',
                    dob:    row[dobIdx] || '',
                    status: 'pending' as const
                })).filter(s => s.name); // Filter out empty rows

                setParsedData(mapped);
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
      newData[index] = { ...newData[index], [field]: value };
      setParsedData(newData);
  }

  const handleImport = async () => {
      if (!selectedDojo) {
          alert("Please select a target Dojo.");
          return;
      }
      
      setIsUploading(true);
      const newData = [...parsedData];
      let successCount = 0;

      // Process strictly in serial to avoid overwhelming DB/Server
      for (let i = 0; i < newData.length; i++) {
          const student = newData[i];
          try {
              const formData = new FormData();
              formData.append('dojo_id', selectedDojo);
              formData.append('name', student.name);
              formData.append('gender', student.gender);
              formData.append('rank', student.rank);
              if (student.weight) formData.append('weight', String(student.weight));
              if (student.dob) formData.append('dob', String(student.dob));

              await createStudent(formData);
              // if (res?.error) throw new Error(res.error); // createStudent throws on error

              newData[i].status = 'success';
              successCount++;
          } catch (e: any) {
              newData[i].status = 'error';
              newData[i].message = e.message || 'Failed';
          }
           // Update UI progress occasionally if needed, but react state batching might hide it in loop
      }

      setParsedData(newData);
      setIsUploading(false);

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
      setStep('upload');
      setFile(null);
      setParsedData([]);
  }

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if(!val) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" /> Bulk Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Bulk Upload Students</DialogTitle>
          <DialogDescription>
            {step === 'upload' ? 'Upload an Excel file to add students.' : 'Review and edit data before importing.'}
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
                     <div className="rounded-md border">
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
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {parsedData.map((student, idx) => (
                                    <TableRow key={idx} className={student.status === 'error' ? 'bg-destructive/10' : student.status === 'success' ? 'bg-green-50' : ''}>
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
                                        <TableCell>
                                            <Input value={student.rank} onChange={(e) => handleUpdateField(idx, 'rank', e.target.value)} className="h-8 w-[120px]" />
                                        </TableCell>
                                        <TableCell>
                                            <Input value={student.weight} onChange={(e) => handleUpdateField(idx, 'weight', e.target.value)} className="h-8 w-[80px]" type="number" />
                                        </TableCell>
                                        <TableCell>
                                            <Input value={student.dob} onChange={(e) => handleUpdateField(idx, 'dob', e.target.value)} className="h-8 w-[130px]" placeholder="YYYY-MM-DD" />
                                        </TableCell>
                                        <TableCell>
                                            {student.status === 'error' && <span className="text-xs text-destructive font-medium" title={student.message}>Failed</span>}
                                            {student.status === 'success' && <span className="text-xs text-green-600 font-medium">Done</span>}
                                            {student.status === 'pending' && <span className="text-xs text-muted-foreground">-</span>}
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
                <Button onClick={handleImport} disabled={isUploading || !selectedDojo}>
                    {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isUploading ? 'Importing...' : 'Confirm Import'}
                </Button>
            )}
            <Button variant="ghost" onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
