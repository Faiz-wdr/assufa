import React, { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Calendar,
  Users,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/supabase/supabase';
import { useAuth } from '@/features/auth/AuthContext';
import {
  Button,
  Card,
  Skeleton,
  EmptyState
} from '@/components/ui/CoreUI';

// ==========================================
// TYPES
// ==========================================
interface Student {
  id: string;
}

interface AttendanceRecord {
  attendance_date: string;
  status: 'present' | 'absent' | 'excused';
}

// ==========================================
// HELPER: Timezone-neutral today string
// ==========================================
const getTodayLocalDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ==========================================
// CALENDAR COMPONENT
// ==========================================
interface CalendarProps {
  currentYear: number;
  currentMonth: number; // 0-indexed
  attendanceDates: Set<string>;
  todayStr: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDateTap: (dateStr: string) => void;
}

const MonthlyCalendar: React.FC<CalendarProps> = React.memo(({
  currentYear,
  currentMonth,
  attendanceDates,
  todayStr,
  onPrevMonth,
  onNextMonth,
  onDateTap,
}) => {
  const monthName = new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Determine first day of month and total days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Build grid cells
  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(null); // empty leading cells
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  return (
    <Card className="p-4 bg-white dark:bg-neutral-800 shadow-soft border border-neutral-border dark:border-neutral-700">
      {/* Month Navigation Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onPrevMonth}
          className="flex items-center justify-center h-9 w-9 rounded-full hover:bg-neutral-bg dark:hover:bg-neutral-700 transition-colors text-neutral-textSecondary dark:text-neutral-400"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-body font-bold text-neutral-textPrimary dark:text-white tracking-tight">{monthName}</h2>
        <button
          onClick={onNextMonth}
          className="flex items-center justify-center h-9 w-9 rounded-full hover:bg-neutral-bg dark:hover:bg-neutral-700 transition-colors text-neutral-textSecondary dark:text-neutral-400"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Day-of-week Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayLabels.map(label => (
          <div key={label} className="text-center text-[10px] font-bold text-neutral-textSecondary dark:text-neutral-400 uppercase tracking-wider py-1">
            {label}
          </div>
        ))}
      </div>

      {/* Date Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarCells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="h-10" />;
          }

          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = dateStr === todayStr;
          const hasAttendance = attendanceDates.has(dateStr);

          let cellClass = 'flex items-center justify-center h-10 w-full rounded-[10px] text-small font-semibold transition-all select-none ';

          if (isToday && hasAttendance) {
            // Today WITH attendance: filled primary with ring
            cellClass += 'bg-primary text-white ring-2 ring-primary ring-offset-2 cursor-pointer';
          } else if (isToday) {
            // Today WITHOUT attendance: outlined primary
            cellClass += 'bg-white dark:bg-neutral-800 text-primary border-2 border-primary';
          } else if (hasAttendance) {
            // Past date with attendance: filled primary dot
            cellClass += 'bg-primary text-white cursor-pointer';
          } else {
            // Normal day
            cellClass += 'text-neutral-textPrimary dark:text-white hover:bg-neutral-bg/60 dark:hover:bg-neutral-700/60';
          }

          return (
            <motion.div
              key={dateStr}
              whileTap={hasAttendance ? { scale: 0.92 } : undefined}
              onClick={() => hasAttendance ? onDateTap(dateStr) : undefined}
              className={cellClass}
            >
              {day}
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
});

MonthlyCalendar.displayName = 'MonthlyCalendar';

import { Admin } from './Admin';

// ==========================================
// DASHBOARD PAGE COMPONENT
// ==========================================
export const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const orgId = profile?.organization_id;
  const todayStr = getTodayLocalDateString();

  // Super Admin view redirection to organization controller
  if (profile?.role === 'super_admin') {
    return <Admin />;
  }

  // Calendar month navigation state
  const todayDate = new Date();
  const [viewYear, setViewYear] = useState(todayDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(todayDate.getMonth());

  // ==========================================
  // 1. QUERIES
  // ==========================================

  // Query: Student count
  const {
    data: students,
    isLoading: isStudentsLoading
  } = useQuery<Student[]>({
    queryKey: ['students_count', orgId],
    queryFn: async () => {
      if (!orgId) return [] as Student[];
      const { data, error } = await supabase
        .from('students')
        .select('id')
        .eq('organization_id', orgId);
      if (error) throw error;
      return (data || []) as Student[];
    },
    enabled: !!orgId,
  });

  // Query: All attendance records for stats and calendar
  const {
    data: allAttendance,
    isLoading: isAttendanceLoading
  } = useQuery<AttendanceRecord[]>({
    queryKey: ['attendance_all_dashboard', orgId],
    queryFn: async () => {
      if (!orgId) return [] as AttendanceRecord[];
      const { data, error } = await supabase
        .from('attendance')
        .select('attendance_date, status')
        .eq('organization_id', orgId);
      if (error) throw error;
      return (data || []) as AttendanceRecord[];
    },
    enabled: !!orgId,
  });

  // ==========================================
  // 2. DATA PROCESSING
  // ==========================================

  // Set of dates that have attendance records
  const attendanceDates = useMemo(() => {
    const dates = new Set<string>();
    if (allAttendance) {
      allAttendance.forEach(a => dates.add(a.attendance_date));
    }
    return dates;
  }, [allAttendance]);

  // Overall attendance percentage
  const overallPercentage = useMemo(() => {
    if (!allAttendance || allAttendance.length === 0) return 0;
    const presentCount = allAttendance.filter(a => a.status === 'present').length;
    return Math.round((presentCount / allAttendance.length) * 100);
  }, [allAttendance]);

  // Check if today's attendance exists
  const todayHasAttendance = attendanceDates.has(todayStr);

  const totalStudents = students?.length || 0;

  // ==========================================
  // 3. EVENT HANDLERS
  // ==========================================

  const handlePrevMonth = useCallback(() => {
    setViewMonth(prev => {
      if (prev === 0) {
        setViewYear(y => y - 1);
        return 11;
      }
      return prev - 1;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setViewMonth(prev => {
      if (prev === 11) {
        setViewYear(y => y + 1);
        return 0;
      }
      return prev + 1;
    });
  }, []);

  const handleDateTap = useCallback((_dateStr: string) => {
    // Navigate to Reports page
    navigate('/reports');
  }, [navigate]);

  const handleTakeAttendance = useCallback(() => {
    navigate('/attendance');
  }, [navigate]);

  // ==========================================
  // 4. RENDER
  // ==========================================

  // Super Admin View Guard
  if (profile && (profile.role as string) === 'super_admin') {
    return (
      <div className="space-y-6 text-left">
        <Card className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-neutral-800 border border-neutral-border dark:border-neutral-700">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft dark:bg-primary/20 text-primary mb-4">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-body-lg font-bold text-neutral-textPrimary dark:text-white">Super Admin Mode</h3>
          <p className="mt-2 text-small text-neutral-textSecondary dark:text-neutral-400 max-w-xs">
            Super Admins manage tenant organizations globally. To view the class dashboard, please log in or switch context to an organization Class Admin.
          </p>
        </Card>
      </div>
    );
  }

  const isLoading = isStudentsLoading || isAttendanceLoading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: "easeInOut" }}
      className="space-y-4 text-left"
    >
      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-[340px] w-full" />
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
          <Skeleton className="h-[48px] w-full" />
        </div>
      )}

      {/* Dashboard Content */}
      {!isLoading && (
        <>
          {/* No Students State */}
          {totalStudents === 0 && (
            <div className="pt-4">
              <EmptyState
                title="No students added yet"
                description="Start by registering students in your class to begin tracking attendance."
                icon={Users}
                actionLabel="Add Students"
                onAction={() => navigate('/students')}
              />
            </div>
          )}

          {/* Full Dashboard View (has students) */}
          {totalStudents > 0 && (
            <div className="space-y-4">
              {/* Monthly Calendar */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.05 }}
              >
                <MonthlyCalendar
                  currentYear={viewYear}
                  currentMonth={viewMonth}
                  attendanceDates={attendanceDates}
                  todayStr={todayStr}
                  onPrevMonth={handlePrevMonth}
                  onNextMonth={handleNextMonth}
                  onDateTap={handleDateTap}
                />
              </motion.div>

              {/* Summary Cards */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="grid grid-cols-3 gap-2"
              >
                {/* Total Students */}
                <Card className="p-3 bg-white dark:bg-neutral-800 shadow-soft border border-neutral-border dark:border-neutral-700 text-center flex flex-col justify-between">
                  <div>
                    <div className="flex h-8 w-8 mx-auto items-center justify-center rounded-full bg-primary-soft dark:bg-primary/20 text-primary mb-1.5">
                      <Users className="h-4 w-4" />
                    </div>
                    <span className="text-[9px] uppercase font-bold text-neutral-textSecondary dark:text-neutral-400 tracking-wider block leading-tight">Total Students</span>
                  </div>
                  <span className="text-lg font-black text-neutral-textPrimary dark:text-white block mt-1">{totalStudents}</span>
                </Card>

                {/* Overall Attendance */}
                <Card className="p-3 bg-white dark:bg-neutral-800 shadow-soft border border-neutral-border dark:border-neutral-700 text-center flex flex-col justify-between">
                  <div>
                    <div className="flex h-8 w-8 mx-auto items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/35 text-success mb-1.5">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <span className="text-[9px] uppercase font-bold text-neutral-textSecondary dark:text-neutral-400 tracking-wider block leading-tight">Overall Attendance</span>
                  </div>
                  <span className={`text-lg font-black block mt-1 ${overallPercentage >= 85 ? 'text-success' :
                      overallPercentage >= 75 ? 'text-warning' : 'text-danger'
                    }`}>
                    {allAttendance && allAttendance.length > 0 ? `${overallPercentage}%` : '—'}
                  </span>
                </Card>

                {/* Total Classes */}
                <Card className="p-3 bg-white dark:bg-neutral-800 shadow-soft border border-neutral-border dark:border-neutral-700 text-center flex flex-col justify-between">
                  <div>
                    <div className="flex h-8 w-8 mx-auto items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/35 text-amber-600 dark:text-amber-500 mb-1.5">
                      <ClipboardCheck className="h-4 w-4" />
                    </div>
                    <span className="text-[9px] uppercase font-bold text-neutral-textSecondary dark:text-neutral-400 tracking-wider block leading-tight">Total Classes</span>
                  </div>
                  <span className="text-lg font-black text-neutral-textPrimary dark:text-white block mt-1">{attendanceDates.size}</span>
                </Card>
              </motion.div>

              {/* Primary Action Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.15 }}
              >
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleTakeAttendance}
                  className="w-full"
                  icon={ClipboardCheck}
                >
                  {todayHasAttendance ? "Edit Today's Attendance" : "Take Today's Attendance"}
                </Button>
              </motion.div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};
