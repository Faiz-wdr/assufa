import React, { useState, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Upload, 
  Download, 
  AlertCircle, 
  FileSpreadsheet, 
  ChevronDown, 
  Check, 
  Users 
} from 'lucide-react';
import { supabase } from '@/supabase/supabase';
import { useAuth } from '@/features/auth/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { 
  Button, 
  Card, 
  SearchBar, 
  Skeleton, 
  EmptyState, 
  ErrorState 
} from '@/components/ui/CoreUI';
import { Input } from '@/components/ui/FormComponents';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Dialog } from '@/components/ui/Dialog';

// Types matching database schema
interface Student {
  id: string;
  organization_id: string;
  name: string;
  place: string | null;
  phone: string | null;
  created_at: string;
}

interface ParsedRecord {
  name: string;
  place: string;
  phone: string;
  isValid: boolean;
  error?: string;
}

export const Students: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const orgId = profile?.organization_id;

  // Search & Expandable Card states
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Add Student states
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addPlace, setAddPlace] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addErrors, setAddErrors] = useState<{ name?: string; place?: string; phone?: string }>({});

  // Edit Student states
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editStudentId, setEditStudentId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPlace, setEditPlace] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editErrors, setEditErrors] = useState<{ name?: string; place?: string; phone?: string }>({});

  // Delete Student states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Import Modal states
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importedFile, setImportedFile] = useState<File | null>(null);
  const [parsedRecords, setParsedRecords] = useState<ParsedRecord[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [importErrors, setImportErrors] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ==========================================
  // 1. QUERIES & MUTATIONS
  // ==========================================

  // Query: Get students for current organization
  const { 
    data: students, 
    isLoading: isStudentsLoading, 
    error: studentsError,
    refetch: refetchStudents
  } = useQuery<Student[]>({
    queryKey: ['students', orgId],
    queryFn: async () => {
      if (!orgId) return [] as Student[];
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('organization_id', orgId);
      if (error) throw error;
      return (data || []) as Student[];
    },
    enabled: !!orgId,
  });

  // Query: Get overall attendance data to calculate percentages
  const { 
    data: attendanceData,
    isLoading: isAttendanceLoading 
  } = useQuery<Array<{ student_id: string; status: 'present' | 'absent' | 'excused' }>>({
    queryKey: ['attendance_stats', orgId],
    queryFn: async () => {
      if (!orgId) return [] as Array<{ student_id: string; status: 'present' | 'absent' | 'excused' }>;
      const { data, error } = await supabase
        .from('attendance')
        .select('student_id, status')
        .eq('organization_id', orgId);
      if (error) throw error;
      return (data || []) as Array<{ student_id: string; status: 'present' | 'absent' | 'excused' }>;
    },
    enabled: !!orgId,
  });

  // Mutation: Add Single Student
  const addStudentMutation = useMutation({
    mutationFn: async (newStudent: { name: string; place: string; phone: string }) => {
      if (!orgId) throw new Error('No active organization session found. Please log out and log back in.');
      const { data, error } = await supabase
        .from('students')
        .insert({
          organization_id: orgId,
          name: newStudent.name.trim(),
          place: newStudent.place.trim(),
          phone: newStudent.phone.trim(),
        } as any)
        .select();
      if (error) throw error;
      return data as any;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', orgId] });
      toast('Student saved successfully!', 'success');
      setIsAddSheetOpen(false);
      // Reset form
      setAddName('');
      setAddPlace('');
      setAddPhone('');
      setAddErrors({});
    },
    onError: (err: any) => {
      toast(`Failed to add student: ${err.message}`, 'error');
    }
  });

  // Mutation: Update Student
  const updateStudentMutation = useMutation({
    mutationFn: async (updatedStudent: { id: string; name: string; place: string; phone: string }) => {
      if (!orgId) throw new Error('No active organization session found. Please log out and log back in.');
      const { data, error } = await (supabase.from('students') as any)
        .update({
          name: updatedStudent.name.trim(),
          place: updatedStudent.place.trim(),
          phone: updatedStudent.phone.trim(),
        })
        .eq('id', updatedStudent.id)
        .select();
      if (error) throw error;
      return data as any;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', orgId] });
      toast('Student updated successfully!', 'success');
      setIsEditSheetOpen(false);
      // Reset edit state
      setEditStudentId(null);
      setEditName('');
      setEditPlace('');
      setEditPhone('');
      setEditErrors({});
    },
    onError: (err: any) => {
      toast(`Failed to update student: ${err.message}`, 'error');
    }
  });

  // Mutation: Delete Student
  const deleteStudentMutation = useMutation({
    mutationFn: async (studentId: string) => {
      if (!orgId) throw new Error('No active organization session found. Please log out and log back in.');
      
      // 1. Delete associated attendance logs first to prevent foreign key errors (though CASCADE exists, let's make it robust)
      await supabase
        .from('attendance')
        .delete()
        .eq('student_id', studentId);

      // 2. Delete the student
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', orgId] });
      queryClient.invalidateQueries({ queryKey: ['attendance_stats', orgId] });
      toast('Student deleted successfully.', 'success');
      setExpandedId(null);
    },
    onError: (err: any) => {
      toast(`Failed to delete student: ${err.message}`, 'error');
    }
  });

  // Mutation: Bulk Insert Students
  const importStudentsMutation = useMutation({
    mutationFn: async (validStudents: Array<{ name: string; place: string; phone: string }>) => {
      if (!orgId) throw new Error('No active organization session found. Please log out and log back in.');
      const { data, error } = await supabase
        .from('students')
        .insert(
          validStudents.map(s => ({
            organization_id: orgId,
            name: s.name,
            place: s.place,
            phone: s.phone,
          })) as any
        )
        .select();
      if (error) throw error;
      return data as any[];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['students', orgId] });
      toast(`Successfully imported ${data?.length || 0} students!`, 'success');
      closeImportModal();
    },
    onError: (err: any) => {
      toast(`Failed to import students: ${err.message}`, 'error');
    }
  });

  // ==========================================
  // 2. DATA PROCESSING & VALIDATIONS
  // ==========================================

  // Map attendance logs to stats per student
  const attendanceStats = useMemo(() => {
    const stats: Record<string, { present: number; total: number }> = {};
    if (!attendanceData) return stats;
    
    for (const record of attendanceData) {
      const sId = record.student_id;
      if (!stats[sId]) {
        stats[sId] = { present: 0, total: 0 };
      }
      stats[sId].total += 1;
      if (record.status === 'present') {
        stats[sId].present += 1;
      }
    }
    return stats;
  }, [attendanceData]);

  // Search & Sorting filter logic
  const filteredStudents = useMemo(() => {
    if (!students) return [];
    let list = [...students];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(s => 
        s.name.toLowerCase().includes(q) ||
        (s.place && s.place.toLowerCase().includes(q)) ||
        (s.phone && s.phone.includes(q))
      );
    }

    // Alphabetical sort (A-Z) by name
    list.sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }, [students, searchQuery]);

  // ==========================================
  // 3. EVENT HANDLERS
  // ==========================================

  const handleCardTap = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  // Validation helper for Single Student Add Form
  const validateSingleStudent = (): boolean => {
    const errors: { name?: string; place?: string; phone?: string } = {};
    const trimmedName = addName.trim();
    const trimmedPhone = addPhone.trim();

    if (!trimmedName) {
      errors.name = "Student Name is required";
    } else if (
      students && 
      students.some(s => s.name.trim().toLowerCase() === trimmedName.toLowerCase())
    ) {
      errors.name = "Student name already exists in this class";
    }

    if (trimmedPhone && !/^\d+$/.test(trimmedPhone)) {
      errors.phone = "Phone number must contain numbers only";
    }

    setAddErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSingleStudent()) return;
    addStudentMutation.mutate({
      name: addName,
      place: addPlace,
      phone: addPhone,
    });
  };

  // Validation helper for Single Student Edit Form
  const validateEditStudent = (): boolean => {
    const errors: { name?: string; place?: string; phone?: string } = {};
    const trimmedName = editName.trim();
    const trimmedPhone = editPhone.trim();

    if (!trimmedName) {
      errors.name = "Student Name is required";
    } else if (
      students && 
      students.some(s => s.id !== editStudentId && s.name.trim().toLowerCase() === trimmedName.toLowerCase())
    ) {
      errors.name = "Student name already exists in this class";
    }

    if (trimmedPhone && !/^\d+$/.test(trimmedPhone)) {
      errors.phone = "Phone number must contain numbers only";
    }

    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveEditStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStudentId || !validateEditStudent()) return;
    updateStudentMutation.mutate({
      id: editStudentId,
      name: editName,
      place: editPlace,
      phone: editPhone,
    });
  };

  const handleStartEdit = (student: Student) => {
    setEditStudentId(student.id);
    setEditName(student.name);
    setEditPlace(student.place || '');
    setEditPhone(student.phone || '');
    setEditErrors({});
    setIsEditSheetOpen(true);
  };

  const handleStartDelete = (student: Student) => {
    setStudentToDelete(student);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!studentToDelete) return;
    deleteStudentMutation.mutate(studentToDelete.id);
  };

  // ==========================================
  // 4. CSV & EXCEL PARSING AND DOWNLOAD
  // ==========================================

  const downloadSampleCSV = () => {
    const headers = "Name,Place,Phone Number\n";
    const sample1 = "Ahmed,Kottakkal,9876543210\n";
    const sample2 = "Rashid,Edarikode,9876543211\n";
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + sample1 + sample2);
    
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", "assufa_dars_students_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCSV = (text: string): ParsedRecord[] => {
    const lines = text.split(/\r?\n/);
    const results: ParsedRecord[] = [];
    if (lines.length === 0) return results;

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const nameIdx = headers.findIndex(h => h.includes('name'));
    const placeIdx = headers.findIndex(h => h.includes('place'));
    const phoneIdx = headers.findIndex(h => h.includes('phone') || h.includes('number'));

    const finalNameIdx = nameIdx !== -1 ? nameIdx : 0;
    const finalPlaceIdx = placeIdx !== -1 ? placeIdx : 1;
    const finalPhoneIdx = phoneIdx !== -1 ? phoneIdx : 2;

    const fileNamesSeen = new Set<string>();

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cells = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim());
      const name = cells[finalNameIdx] || '';
      const place = cells[finalPlaceIdx] || '';
      const phone = cells[finalPhoneIdx] || '';

      const record = validateImportRecord(name, place, phone, fileNamesSeen);
      results.push(record);
      if (record.isValid) {
        fileNamesSeen.add(name.toLowerCase());
      }
    }
    return results;
  };

  const parseXLSX = async (file: File): Promise<ParsedRecord[]> => {
    const XLSX = await import('xlsx');
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });
    const results: ParsedRecord[] = [];
    if (rows.length === 0) return results;

    const headers = (rows[0] as string[]).map(h => String(h || '').trim().toLowerCase());
    const nameIdx = headers.findIndex(h => h.includes('name'));
    const placeIdx = headers.findIndex(h => h.includes('place'));
    const phoneIdx = headers.findIndex(h => h.includes('phone') || h.includes('number'));

    const finalNameIdx = nameIdx !== -1 ? nameIdx : 0;
    const finalPlaceIdx = placeIdx !== -1 ? placeIdx : 1;
    const finalPhoneIdx = phoneIdx !== -1 ? phoneIdx : 2;

    const fileNamesSeen = new Set<string>();

    for (let i = 1; i < rows.length; i++) {
      const cells = rows[i] as any[];
      if (!cells || cells.length === 0) continue;

      const name = String(cells[finalNameIdx] || '').trim();
      const place = String(cells[finalPlaceIdx] || '').trim();
      const phone = String(cells[finalPhoneIdx] || '').trim();

      if (!name && !place && !phone) continue;

      const record = validateImportRecord(name, place, phone, fileNamesSeen);
      results.push(record);
      if (record.isValid) {
        fileNamesSeen.add(name.toLowerCase());
      }
    }
    return results;
  };

  const validateImportRecord = (
    name: string, 
    place: string, 
    phone: string, 
    fileNamesSeen: Set<string>
  ): ParsedRecord => {
    if (!name) {
      return { name, place, phone, isValid: false, error: 'Name is required' };
    }
    if (phone && !/^\d+$/.test(phone)) {
      return { name, place, phone, isValid: false, error: 'Phone number must contain numbers only' };
    }
    // Duplicate check within uploaded file
    if (fileNamesSeen.has(name.toLowerCase())) {
      return { name, place, phone, isValid: false, error: 'Duplicate student name in import file' };
    }
    // Duplicate check in database
    if (students && students.some(s => s.name.trim().toLowerCase() === name.toLowerCase())) {
      return { name, place, phone, isValid: false, error: 'Student already exists in database' };
    }

    return { name, place, phone, isValid: true };
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportErrors(null);
    setIsParsing(true);
    setImportedFile(file);

    const ext = file.name.split('.').pop()?.toLowerCase();
    try {
      let records: ParsedRecord[] = [];
      if (ext === 'csv') {
        const text = await file.text();
        records = parseCSV(text);
      } else if (ext === 'xlsx') {
        records = await parseXLSX(file);
      } else {
        throw new Error('Unsupported file format. Please upload a CSV or XLSX file.');
      }
      setParsedRecords(records);
    } catch (err: any) {
      setImportErrors(err.message || 'Failed to parse file.');
      setImportedFile(null);
      setParsedRecords([]);
    } finally {
      setIsParsing(false);
    }
  };

  const closeImportModal = () => {
    setIsImportModalOpen(false);
    setImportedFile(null);
    setParsedRecords([]);
    setImportErrors(null);
    setIsParsing(false);
  };

  const handleConfirmImport = () => {
    const validOnes = parsedRecords.filter(r => r.isValid);
    if (validOnes.length === 0) return;
    importStudentsMutation.mutate(validOnes);
  };

  // Calculations for preview stats
  const importSummary = useMemo(() => {
    const total = parsedRecords.length;
    const valid = parsedRecords.filter(r => r.isValid).length;
    const errors = total - valid;
    return { total, valid, errors };
  }, [parsedRecords]);

  // ==========================================
  // 5. RENDER METHODS
  // ==========================================

  // Super Admin view guard
  if (profile && profile.role === 'super_admin') {
    return (
      <div className="space-y-6 text-left">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-textPrimary">Class Students</h1>
          <p className="text-sm text-neutral-textSecondary">Roster list for teachers.</p>
        </div>
        <Card className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-neutral-800 border border-neutral-border dark:border-neutral-700">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft dark:bg-primary/20 text-primary mb-4">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-body-lg font-bold text-neutral-textPrimary dark:text-white">Super Admin Mode</h3>
          <p className="mt-2 text-small text-neutral-textSecondary dark:text-neutral-400 max-w-xs">
            Super Admins manage tenant organizations globally. To add or view students, please log in or switch context to an organization Class Admin.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-left">
      {/* Top Title & Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-textPrimary">Students</h1>
        <p className="text-caption text-neutral-textSecondary">Manage registrations and check percentages.</p>
      </div>

      {/* Top Sticky-look Action Row */}
      <div className="flex space-x-3 w-full">
        <Button 
          variant="primary" 
          onClick={() => setIsAddSheetOpen(true)} 
          className="flex-1"
          icon={Plus}
        >
          Add Student
        </Button>
        <Button 
          variant="secondary" 
          onClick={() => setIsImportModalOpen(true)} 
          className="flex-1"
          icon={Upload}
        >
          Import
        </Button>
      </div>

      {/* Dynamic Search Box */}
      <SearchBar 
        value={searchQuery}
        onChange={(val) => {
          setSearchQuery(val);
          setExpandedId(null); // Close expanded rows when searching
        }}
        placeholder="Search students..."
      />

      {/* Loading Skeletons */}
      {(isStudentsLoading || isAttendanceLoading) && (
        <div className="space-y-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      )}

      {/* Database Fetch Error */}
      {studentsError && (
        <ErrorState 
          description="Failed to load students list. Please check database connection."
          onRetry={refetchStudents}
        />
      )}

      {/* List content */}
      {!isStudentsLoading && !isAttendanceLoading && !studentsError && (
        <>
          {/* Case A: No Students Exist at All in organization */}
          {students?.length === 0 && (
            <EmptyState 
              title="No students added yet" 
              description="Click below to add your first student or import records in bulk."
              icon={Users}
              actionLabel="Add First Student"
              onAction={() => setIsAddSheetOpen(true)}
            />
          )}

          {/* Case B: Students exist but search returns nothing */}
          {students && students.length > 0 && filteredStudents.length === 0 && (
            <EmptyState 
              title="No students match search" 
              description="Try adjusting your text query or search by place/phone."
              onAction={() => setSearchQuery('')}
              actionLabel="Clear Search"
            />
          )}

          {/* Case C: Render Student Cards */}
          {filteredStudents.length > 0 && (
            <div className="space-y-2.5">
              <AnimatePresence initial={false}>
                {filteredStudents.map((student) => {
                  const isExpanded = expandedId === student.id;
                  const stats = attendanceStats[student.id] || { present: 0, total: 0 };
                  const percentage = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

                  return (
                    <motion.div
                      key={student.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="rounded-card border border-neutral-border dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden shadow-soft"
                    >
                      {/* Tappable Card Header */}
                      <div 
                        onClick={() => handleCardTap(student.id)}
                        className="flex items-center justify-between p-4 cursor-pointer select-none"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft dark:bg-primary/20 text-primary font-bold text-xs">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-body text-neutral-textPrimary dark:text-white">
                            {student.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`text-caption font-bold px-2 py-0.5 rounded-badge ${
                            percentage >= 85 ? 'bg-emerald-50 text-success' :
                            percentage >= 75 ? 'bg-amber-50 text-warning' : 'bg-red-50 text-danger'
                          }`}>
                            {percentage}%
                          </span>
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-neutral-textSecondary"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </motion.div>
                        </div>
                      </div>

                      {/* Card Expanded Segment */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-neutral-border dark:border-neutral-700 bg-neutral-bg/40 dark:bg-neutral-900/40 px-4 py-3 text-left overflow-hidden text-small"
                          >
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-textSecondary dark:text-neutral-400 block">Place</span>
                                <span className="font-semibold text-neutral-textPrimary dark:text-white">{student.place || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-textSecondary dark:text-neutral-400 block">Phone</span>
                                <span className="font-semibold text-neutral-textPrimary dark:text-white">{student.phone || 'N/A'}</span>
                              </div>
                            </div>

                            <div className="flex space-x-2 mt-4 pt-3 border-t border-neutral-border/50">
                              <Button 
                                variant="secondary" 
                                size="sm"
                                className="flex-1 py-1.5 text-xs text-primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartEdit(student);
                                }}
                              >
                                Edit Details
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="flex-1 py-1.5 text-xs text-danger hover:bg-red-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartDelete(student);
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      {/* ==========================================
          5.1 ADD STUDENT BOTTOM SHEET
      ========================================== */}
      <BottomSheet
        isOpen={isAddSheetOpen}
        onClose={() => {
          setIsAddSheetOpen(false);
          setAddErrors({});
        }}
        title="Add New Student"
      >
        <form onSubmit={handleSaveStudent} className="space-y-4 pt-2 pb-safe-bottom">
          <p className="text-caption text-neutral-textSecondary">
            Register a student details to automatically enroll in class logs.
          </p>

          <Input 
            label="Student Name *" 
            value={addName}
            onChange={(e) => setAddName(e.target.value)}
            placeholder="e.g. Ahmad Khan"
            error={addErrors.name}
            disabled={addStudentMutation.isPending}
          />

          <Input 
            label="Place / Location" 
            value={addPlace}
            onChange={(e) => setAddPlace(e.target.value)}
            placeholder="e.g. Kottakkal"
            disabled={addStudentMutation.isPending}
          />

          <Input 
            label="Phone Number" 
            value={addPhone}
            onChange={(e) => setAddPhone(e.target.value)}
            placeholder="e.g. 9876543210"
            error={addErrors.phone}
            disabled={addStudentMutation.isPending}
          />

          <div className="flex space-x-2 pt-2">
            <Button 
              type="button"
              variant="secondary" 
              className="flex-1" 
              disabled={addStudentMutation.isPending}
              onClick={() => {
                setIsAddSheetOpen(false);
                setAddErrors({});
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              variant="primary" 
              className="flex-1"
              loading={addStudentMutation.isPending}
            >
              Save Student
            </Button>
          </div>
        </form>
      </BottomSheet>

      {/* ==========================================
          5.1.1 EDIT STUDENT BOTTOM SHEET
      ========================================== */}
      <BottomSheet
        isOpen={isEditSheetOpen}
        onClose={() => {
          setIsEditSheetOpen(false);
          setEditErrors({});
        }}
        title="Edit Student Details"
      >
        <form onSubmit={handleSaveEditStudent} className="space-y-4 pt-2 pb-safe-bottom">
          <p className="text-caption text-neutral-textSecondary">
            Update this student's registered roster name, place, or contact number.
          </p>

          <Input 
            label="Student Name *" 
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="e.g. Ahmad Khan"
            error={editErrors.name}
            disabled={updateStudentMutation.isPending}
          />

          <Input 
            label="Place / Location" 
            value={editPlace}
            onChange={(e) => setEditPlace(e.target.value)}
            placeholder="e.g. Kottakkal"
            disabled={updateStudentMutation.isPending}
          />

          <Input 
            label="Phone Number" 
            value={editPhone}
            onChange={(e) => setEditPhone(e.target.value)}
            placeholder="e.g. 9876543210"
            error={editErrors.phone}
            disabled={updateStudentMutation.isPending}
          />

          <div className="flex space-x-2 pt-2">
            <Button 
              type="button"
              variant="secondary" 
              className="flex-1" 
              disabled={updateStudentMutation.isPending}
              onClick={() => {
                setIsEditSheetOpen(false);
                setEditErrors({});
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              variant="primary" 
              className="flex-1"
              loading={updateStudentMutation.isPending}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </BottomSheet>

      {/* ==========================================
          5.1.2 DELETE STUDENT CONFIRMATION DIALOG
      ========================================== */}
      <Dialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setStudentToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Student"
        description={studentToDelete ? `Are you sure you want to delete ${studentToDelete.name}? All of their past attendance history will be permanently deleted too. This action cannot be undone.` : ''}
        confirmLabel="Delete"
        cancelLabel="Keep Student"
        variant="danger"
      />

      {/* ==========================================
          5.2 IMPORT STUDENTS MODAL (CUSTOM DETAILED OVERLAY)
      ========================================== */}
      <AnimatePresence>
        {isImportModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={closeImportModal}
              className="fixed inset-0 z-40 bg-black"
            />

            {/* Modal Dialog */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="w-full max-w-md rounded-card bg-white dark:bg-neutral-800 p-5 shadow-lifted border border-neutral-border dark:border-neutral-700 pointer-events-auto flex flex-col text-left space-y-4 overflow-hidden"
              >
                {/* Modal Title */}
                <div>
                  <h3 className="text-body-lg font-bold text-neutral-textPrimary dark:text-white tracking-tight flex items-center space-x-2">
                    <FileSpreadsheet className="h-5 w-5 text-primary" />
                    <span>Import Students</span>
                  </h3>
                  <p className="text-caption text-neutral-textSecondary dark:text-neutral-400 mt-0.5">
                    Upload a CSV or Excel (.xlsx) file using the following column order.
                  </p>
                </div>

                {/* Case 1: Initial upload prompt with template description */}
                {!importedFile && (
                  <div className="space-y-4">
                    {/* Sample Table */}
                    <div className="rounded-input border border-neutral-border dark:border-neutral-700 bg-neutral-bg/60 dark:bg-neutral-900/60 p-3">
                      <span className="text-[10px] uppercase font-bold text-neutral-textSecondary dark:text-neutral-400 tracking-wide block mb-1">Columns Structure</span>
                      <table className="w-full text-[11px] text-left text-neutral-textPrimary dark:text-white border-collapse">
                        <thead>
                          <tr className="border-b border-neutral-border dark:border-neutral-700 font-bold">
                            <th className="py-1">Name *</th>
                            <th className="py-1">Place</th>
                            <th className="py-1">Phone Number</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="text-neutral-textSecondary">
                            <td className="py-1">Ahmed</td>
                            <td className="py-1">Kottakkal</td>
                            <td className="py-1">9876543210</td>
                          </tr>
                          <tr className="text-neutral-textSecondary">
                            <td className="py-1">Rashid</td>
                            <td className="py-1">Edarikode</td>
                            <td className="py-1">9876543211</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Format Alert error */}
                    {importErrors && (
                      <div className="rounded-input border border-red-100 bg-red-50 p-3 flex items-start space-x-2">
                        <AlertCircle className="h-4 w-4 text-danger mt-0.5 flex-shrink-0" />
                        <span className="text-caption text-danger font-semibold leading-tight">{importErrors}</span>
                      </div>
                    )}

                    {/* Trigger File input */}
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-neutral-border dark:border-neutral-700 rounded-input p-6 text-center hover:border-primary/50 cursor-pointer transition-colors bg-neutral-bg/20 dark:bg-neutral-900/20"
                    >
                      <Upload className="h-8 w-8 text-neutral-textSecondary dark:text-neutral-400 mx-auto mb-2" />
                      <span className="text-small font-bold text-primary block">Select CSV or Excel file</span>
                      <span className="text-caption text-neutral-textSecondary dark:text-neutral-400 mt-0.5 block">Drag & drop or browse from storage</span>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange}
                        accept=".csv,.xlsx" 
                        className="hidden" 
                      />
                    </div>

                    {/* Modal footer options */}
                    <div className="flex space-x-2 pt-2">
                      <Button 
                        variant="secondary" 
                        className="flex-1" 
                        onClick={closeImportModal}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="flex-1 text-primary" 
                        onClick={downloadSampleCSV}
                        icon={Download}
                      >
                        Download CSV
                      </Button>
                    </div>
                  </div>
                )}

                {/* Case 2: Parsing loading */}
                {isParsing && (
                  <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-small text-neutral-textSecondary font-medium">Validating file records...</p>
                  </div>
                )}

                {/* Case 3: Summary Preview & Confirm imports */}
                {!isParsing && importedFile && parsedRecords.length > 0 && (
                  <div className="space-y-4">
                    {/* Summary Row */}
                    <div className="grid grid-cols-3 gap-2 bg-neutral-bg/60 dark:bg-neutral-900/60 border border-neutral-border dark:border-neutral-700 rounded-input p-3 text-center">
                      <div>
                        <span className="text-[10px] font-bold text-neutral-textSecondary dark:text-neutral-400 block">Parsed</span>
                        <span className="text-body-lg font-bold text-neutral-textPrimary dark:text-white">{importSummary.total}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-neutral-textSecondary dark:text-neutral-400 block">Valid</span>
                        <span className="text-body-lg font-bold text-success">{importSummary.valid}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-neutral-textSecondary dark:text-neutral-400 block">Errors</span>
                        <span className="text-body-lg font-bold text-danger">{importSummary.errors}</span>
                      </div>
                    </div>

                    {/* Preview Roster Scroll List */}
                    <div className="border border-neutral-border dark:border-neutral-700 rounded-input max-h-48 overflow-y-auto divide-y divide-neutral-border dark:divide-neutral-700 bg-white dark:bg-neutral-900">
                      {parsedRecords.map((rec, index) => (
                        <div key={index} className="p-3 text-left text-small flex justify-between items-center bg-neutral-bg/10">
                          <div>
                            <span className="font-bold text-neutral-textPrimary block">{rec.name || 'Empty Name'}</span>
                            <span className="text-caption text-neutral-textSecondary">{rec.place || 'No Place'} • {rec.phone || 'No Phone'}</span>
                          </div>
                          <div>
                            {rec.isValid ? (
                              <span className="inline-flex items-center text-[10px] font-bold text-success bg-emerald-50 px-2 py-0.5 rounded-badge">
                                <Check className="h-3 w-3 mr-1" /> Valid
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-[10px] font-bold text-danger bg-red-50 px-2 py-0.5 rounded-badge max-w-[120px] truncate" title={rec.error}>
                                {rec.error}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Action confirm */}
                    <div className="flex space-x-2 pt-2">
                      <Button 
                        variant="secondary" 
                        className="flex-1" 
                        onClick={() => {
                          setImportedFile(null);
                          setParsedRecords([]);
                        }}
                        disabled={importStudentsMutation.isPending}
                      >
                        Back
                      </Button>
                      <Button 
                        variant="primary" 
                        className="flex-1"
                        onClick={handleConfirmImport}
                        disabled={importSummary.valid === 0}
                        loading={importStudentsMutation.isPending}
                      >
                        Import ({importSummary.valid})
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
