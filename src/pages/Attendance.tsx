import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, Users } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/supabase/supabase';
import { useAuth } from '@/features/auth/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Dialog } from '@/components/ui/Dialog';
import { 
  Button, 
  Card, 
  Skeleton, 
  EmptyState, 
  ErrorState 
} from '@/components/ui/CoreUI';
import { DatePicker } from '@/components/ui/FormComponents';

// Types matching database schema
interface Student {
  id: string;
  organization_id: string;
  name: string;
  place: string | null;
  phone: string | null;
  created_at: string;
}

export const Attendance: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const orgId = profile?.organization_id;

  // Timezone-neutral local today date string (YYYY-MM-DD)
  const getTodayLocalDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [searchParams] = useSearchParams();
  const initialDate = searchParams.get('date') || getTodayLocalDateString();

  // State Hooks
  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  const [loadedDate, setLoadedDate] = useState<string | null>(searchParams.get('date'));
  const [statuses, setStatuses] = useState<Record<string, 'present' | 'absent'>>({});
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false);

  // ==========================================
  // 1. DATABASE QUERIES & MUTATIONS
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

  // We fetch existing attendance for the loadedDate if we are editing, otherwise for selectedDate
  const fetchDate = loadedDate || selectedDate;

  // Query: Get existing attendance for selected date
  const { 
    data: existingAttendance, 
    isLoading: isAttendanceLoading,
    error: attendanceError,
    refetch: refetchAttendance
  } = useQuery<any[]>({
    queryKey: ['attendance_for_date', orgId, fetchDate],
    queryFn: async () => {
      if (!orgId || !fetchDate) return [];
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('organization_id', orgId)
        .eq('attendance_date', fetchDate);
      if (error) throw error;
      return data || [];
    },
    enabled: !!orgId && !!fetchDate,
  });

  // Sync effect: Bind database loaded logs or initialize Present-by-default states
  useEffect(() => {
    if (students) {
      const initialStatuses: Record<string, 'present' | 'absent'> = {};
      
      // Default all roster students to Absent
      students.forEach(s => {
        initialStatuses[s.id] = 'absent';
      });

      // Overwrite with loaded database logs if they exist
      if (existingAttendance && existingAttendance.length > 0) {
        existingAttendance.forEach(a => {
          if (initialStatuses[a.student_id] !== undefined) {
            initialStatuses[a.student_id] = a.status as 'present' | 'absent';
          }
        });
        setIsEditMode(true);
        // Sync loadedDate with the date that was actually retrieved
        if (loadedDate !== selectedDate) {
          setLoadedDate(selectedDate);
        }
      } else {
        setIsEditMode(false);
      }
      setStatuses(initialStatuses);
    }
  }, [students, existingAttendance]);

  // Mutation: Save / Update Attendance
  const saveAttendanceMutation = useMutation({
    mutationFn: async () => {
      if (!orgId) throw new Error('No active organization session found. Please log out and log back in.');
      if (!students || students.length === 0) throw new Error('No students found to save attendance.');

      // 1. If date was changed during editing, delete old logs first
      if (isEditMode && loadedDate && loadedDate !== selectedDate) {
        const { error: deleteError } = await supabase
          .from('attendance')
          .delete()
          .eq('organization_id', orgId)
          .eq('attendance_date', loadedDate);
        if (deleteError) throw deleteError;
      }

      const payload = students.map(s => ({
        organization_id: orgId,
        student_id: s.id,
        attendance_date: selectedDate,
        status: statuses[s.id] || 'absent',
      }));

      // 2. Perform upsert matching on the unique constraint (organization_id, student_id, attendance_date)
      const { data, error } = await (supabase.from('attendance') as any)
        .upsert(payload, { onConflict: 'organization_id,student_id,attendance_date' })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance_for_date', orgId, selectedDate] });
      if (loadedDate && loadedDate !== selectedDate) {
        queryClient.invalidateQueries({ queryKey: ['attendance_for_date', orgId, loadedDate] });
      }
      queryClient.invalidateQueries({ queryKey: ['attendance_history', orgId] });
      queryClient.invalidateQueries({ queryKey: ['attendance_stats', orgId] });
      
      toast(isEditMode ? 'Attendance updated successfully!' : 'Attendance saved successfully!', 'success');
      
      // Update loadedDate to the new saved date
      setLoadedDate(selectedDate);
      setIsEditMode(true);
    },
    onError: (err: any) => {
      toast(`Failed to save attendance: ${err.message}`, 'error');
    }
  });

  // ==========================================
  // 2. DATA PROCESSING & EVENT HANDLERS
  // ==========================================

  // Timezone-safe local date formatter
  const formatDisplayDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Toggle present / absent selection state
  const handleToggle = (studentId: string) => {
    setStatuses(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'absent' ? 'present' : 'absent'
    }));
  };

  // Live memoized stats calculations
  const summaryCounts = useMemo(() => {
    if (!students || students.length === 0) {
      return { present: 0, absent: 0, total: 0 };
    }
    
    let present = 0;
    let absent = 0;
    
    students.forEach(s => {
      if (statuses[s.id] === 'absent') {
        absent++;
      } else {
        present++;
      }
    });

    return {
      present,
      absent,
      total: students.length
    };
  }, [students, statuses]);

  // Memoize sorted students alphabetically by name
  const sortedStudents = useMemo(() => {
    if (!students) return [];
    return [...students].sort((a, b) => a.name.localeCompare(b.name));
  }, [students]);

  const handleSaveClick = () => {
    if (isEditMode) {
      setIsConfirmDialogOpen(true);
    } else {
      saveAttendanceMutation.mutate();
    }
  };

  const handleConfirmUpdate = () => {
    saveAttendanceMutation.mutate();
  };

  // ==========================================
  // 3. RENDER METHODS
  // ==========================================

  // Super Admin View Guard
  if (profile && profile.role === 'super_admin') {
    return (
      <div className="space-y-6 text-left">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-textPrimary">Attendance</h1>
          <p className="text-sm text-neutral-textSecondary">Manage class logs.</p>
        </div>
        <Card className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-neutral-800 border border-neutral-border dark:border-neutral-700">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft dark:bg-primary/20 text-primary mb-4">
            <Calendar className="h-6 w-6" />
          </div>
          <h3 className="text-body-lg font-bold text-neutral-textPrimary dark:text-white">Super Admin Mode</h3>
          <p className="mt-2 text-small text-neutral-textSecondary dark:text-neutral-400 max-w-xs">
            Super Admins manage tenant organizations globally. To record or view attendance logs, please log in or switch context to an organization Class Admin.
          </p>
        </Card>
      </div>
    );
  }

  const isLoading = isStudentsLoading || isAttendanceLoading;
  const isError = studentsError || attendanceError;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: "easeInOut" }}
      className="space-y-4 text-left pb-32"
    >
      {/* Title & Subtext */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-textPrimary dark:text-white">Attendance</h1>
        <p className="text-caption text-neutral-textSecondary dark:text-neutral-400">Take roster log sheets weekly.</p>
      </div>

      {/* Date Selector Card */}
      <Card className="p-4 bg-white dark:bg-neutral-800 shadow-soft border border-neutral-border dark:border-neutral-700 space-y-3">
        <div className="flex justify-between items-center">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-neutral-textSecondary dark:text-neutral-400 tracking-wider">Log Sheet Date</span>
            <h2 className="text-body font-bold text-neutral-textPrimary dark:text-white">{formatDisplayDate(selectedDate)}</h2>
          </div>
          <div className="w-1/2 max-w-[150px]">
            <DatePicker
              value={selectedDate}
              onChange={(val) => {
                setSelectedDate(val);
              }}
              disabled={saveAttendanceMutation.isPending}
            />
          </div>
        </div>
      </Card>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-3 pt-2">
          <Skeleton className="h-16 w-full" />
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          <Skeleton className="h-[60px] w-full" />
          <Skeleton className="h-[60px] w-full" />
          <Skeleton className="h-[60px] w-full" />
        </div>
      )}

      {/* Database Error State */}
      {!isLoading && isError && (
        <div className="pt-2">
          <ErrorState 
            description="Failed to load attendance logs or student roster. Please check database connection."
            onRetry={() => {
              refetchStudents();
              refetchAttendance();
            }}
          />
        </div>
      )}

      {/* Roster & Controls */}
      {!isLoading && !isError && students && (
        <>
          {/* Case A: Roster is Empty (0 students) */}
          {students.length === 0 && (
            <div className="pt-6">
              <EmptyState 
                title="No students added yet" 
                description="You need to register students in this class before taking attendance logs."
                icon={Users}
                actionLabel="Go to Students"
                onAction={() => navigate('/students')}
              />
            </div>
          )}

          {/* Case B: Render Attendance Interface */}
          {students.length > 0 && (
            <div className="space-y-4 pt-2">
              {/* Summary Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-card bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-3 text-center shadow-sm">
                  <span className="text-[10px] font-bold text-success uppercase block tracking-wider">Present</span>
                  <span className="text-body-lg font-black text-success mt-0.5 block">{summaryCounts.present}</span>
                </div>
                <div className="rounded-card bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 p-3 text-center shadow-sm">
                  <span className="text-[10px] font-bold text-danger uppercase block tracking-wider">Absent</span>
                  <span className="text-body-lg font-black text-danger mt-0.5 block">{summaryCounts.absent}</span>
                </div>
                <div className="rounded-card bg-neutral-bg dark:bg-neutral-800 border border-neutral-border dark:border-neutral-700 p-3 text-center shadow-sm">
                  <span className="text-[10px] font-bold text-neutral-textSecondary dark:text-neutral-400 uppercase block tracking-wider">Total</span>
                  <span className="text-body-lg font-black text-neutral-textPrimary dark:text-white mt-0.5 block">{summaryCounts.total}</span>
                </div>
              </div>

              {/* Students Selection List */}
              <div className="space-y-2.5">
                {sortedStudents.map((student) => {
                  const status = statuses[student.id] || 'present';
                  const isAbsent = status === 'absent';
                  
                  return (
                    <motion.div
                      key={student.id}
                      onClick={() => handleToggle(student.id)}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center justify-between p-4 bg-white dark:bg-neutral-800 border border-neutral-border dark:border-neutral-700 rounded-card shadow-soft cursor-pointer hover:border-neutral-border/80 dark:hover:border-neutral-700/80 transition-colors select-none h-[64px]"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-bg dark:bg-neutral-900 text-neutral-textSecondary dark:text-neutral-400 font-bold text-xs">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-body text-neutral-textPrimary dark:text-white">{student.name}</span>
                      </div>
                      
                      <motion.span
                        animate={{ scale: isAbsent ? [1, 1.05, 1] : 1 }}
                        transition={{ duration: 0.15 }}
                        className={`text-caption font-bold px-3 py-1 rounded-badge border transition-colors ${
                          isAbsent 
                            ? 'bg-red-50 text-danger border-red-100' 
                            : 'bg-emerald-50 text-success border-emerald-100'
                        }`}
                      >
                        {isAbsent ? 'Absent' : 'Present'}
                      </motion.span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Sticky bottom Action button Drawer */}
              <div className="fixed bottom-[72px] left-0 right-0 p-4 bg-white dark:bg-neutral-800 border-t border-neutral-border dark:border-neutral-700 flex justify-center max-w-md mx-auto z-10 shadow-lifted">
                <Button 
                  variant="primary" 
                  onClick={handleSaveClick}
                  className="w-full"
                  loading={saveAttendanceMutation.isPending}
                >
                  {isEditMode ? 'Update Attendance' : 'Save Attendance'}
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Confirmation Overwrite Dialog */}
      <Dialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={handleConfirmUpdate}
        title="Update Attendance Logs"
        description={`Attendance sheets for ${formatDisplayDate(selectedDate)} have already been recorded. Are you sure you want to overwrite previous logs?`}
        confirmLabel="Update"
        cancelLabel="Cancel"
        variant="primary"
      />
    </motion.div>
  );
};
