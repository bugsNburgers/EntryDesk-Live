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
import { Upload, FileDown, Loader2 } from 'lucide-react'

interface Dojo {
    id: string
    name: string
}

interface StudentBulkUploadProps {
  dojos: Dojo[]
}

export function StudentBulkUpload({ dojos }: StudentBulkUploadProps) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<any[]>([])
  const [selectedDojo, setSelectedDojo] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)

  const handleDownloadTemplate = () => {
    const headers = ['Name', 'Gender (Male/Female)', 'Rank (White/Yellow/Green/Purple/Brown/Black)', 'Weight (kg)', 'DOB (YYYY-MM-DD)'];
    const ws = XLSX.utils.aoa_to_sheet([headers]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "student_import_template.xlsx");
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
        setFile(selectedFile);
        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
            // remove header row
            const rows = data.slice(1).filter((r: any) => r[0]); // simple filter for empty rows
            setParsedData(rows);
        };
        reader.readAsBinaryString(selectedFile);
    }
  }

  const handleUpload = async () => {
      if (!selectedDojo) {
          alert("Please select a target Dojo for these students.");
          return;
      }
      if (parsedData.length === 0) return;

      setIsUploading(true);
      
      // Process in chunks or one by one. For 200, one by one is slow but safer for error handling without complex batch logic.
      // Let's do parallel requests in small batches.
      
      try {
          const promises = parsedData.map(async (row: any) => {
             const formData = new FormData();
             formData.append('dojo_id', selectedDojo);
             
             // Map columns based on template index
             // 0: Name, 1: Gender, 2: Rank, 3: Weight, 4: DOB
             formData.append('name', row[0] || '');
             formData.append('gender', (row[1] || '').toLowerCase());
             formData.append('rank', (row[2] || '').toLowerCase());
             if (row[3]) formData.append('weight', row[3]);
             if (row[4]) formData.append('dob', row[4]); // Assuming text format or logic needed for Excel dates

             // We reuse the single create action for simplicity, but a bulk action would be better database-wise.
             // Using client-side loop for now to reuse validation/logic.
             await createStudent(formData);
          });

          await Promise.all(promises);
          
          setOpen(false);
          setFile(null);
          setParsedData([]);
          alert(`Successfully imported ${parsedData.length} students.`);
      } catch (e) {
          console.error(e);
          alert('Some students failed to import. Please check data format.');
      } finally {
          setIsUploading(false);
      }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" /> Bulk Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Bulk Upload Students</DialogTitle>
          <DialogDescription>
            Upload an Excel file to add multiple students at once.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
             <div className="flex justify-between items-center bg-secondary/50 p-4 rounded-md">
                <div className="text-sm text-muted-foreground">
                    <div>1. Download the template</div>
                    <div>2. Fill in student details</div>
                    <div>3. Upload the file below</div>
                </div>
                <Button size="sm" variant="secondary" onClick={handleDownloadTemplate}>
                    <FileDown className="mr-2 h-4 w-4" /> Download Template
                </Button>
             </div>

             <div className="grid gap-2">
                 <Label>Target Dojo</Label>
                 <Select value={selectedDojo} onValueChange={setSelectedDojo}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Dojo for imported students" />
                    </SelectTrigger>
                    <SelectContent>
                        {dojos.map(dojo => (
                            <SelectItem key={dojo.id} value={dojo.id}>{dojo.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
             </div>

             <div className="grid gap-2">
                <Label>Excel File</Label>
                <Input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileChange} />
             </div>

             {parsedData.length > 0 && (
                 <div className="text-sm text-muted-foreground">
                    Ready to import <strong>{parsedData.length}</strong> students.
                 </div>
             )}
        </div>

        <DialogFooter>
            <div className="flex gap-2">
                 <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                 <Button onClick={handleUpload} disabled={!file || parsedData.length === 0 || !selectedDojo || isUploading}>
                    {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Import Students
                 </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
