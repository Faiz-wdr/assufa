import React, { useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import * as XLSX from 'xlsx';
import {
  MapPin,
  Download,
  Sun,
  Moon,
  FileText,
  Shield,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { supabase } from '@/supabase/supabase';
import { useAuth } from '@/features/auth/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { useSettings } from '@/features/settings/SettingsContext';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/CoreUI';
import { Input } from '@/components/ui/FormComponents';
import { DatePicker } from '@/components/ui/FormComponents';

// Lazy-loaded legal pages (performance optimisation)
const PrivacyPolicy = lazy(() =>
  import('@/pages/PrivacyPolicy').then((m) => ({ default: m.PrivacyPolicy }))
);
const TermsConditions = lazy(() =>
  import('@/pages/TermsConditions').then((m) => ({ default: m.TermsConditions }))
);

// ==========================================
// TYPES
// ==========================================
interface Student {
  id: string;
  name: string;
  place: string | null;
  phone: string | null;
}

interface AttendanceLog {
  student_id: string;
  attendance_date: string;
  status: 'present' | 'absent' | 'excused';
}

interface OrgInfo {
  name: string;
  location: string | null;
}

// ==========================================
// PAGE TRANSITION VARIANTS
// ==========================================
const pageVariants = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

const containerVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0 },
};

// ==========================================
// SECTION LABEL COMPONENT
// ==========================================
const SectionLabel: React.FC<{ label: string }> = ({ label }) => (
  <div className="px-1 pb-1.5 pt-5 first:pt-0">
    <span className="text-[10px] font-black uppercase tracking-[0.12em] text-neutral-textSecondary dark:text-neutral-textSecondary/70">
      {label}
    </span>
  </div>
);

// ==========================================
// SETTINGS ROW COMPONENT
// ==========================================
interface SettingsRowProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle?: string;
  onClick: () => void;
  rightContent?: React.ReactNode;
  id?: string;
}

const SettingsRow: React.FC<SettingsRowProps> = ({
  icon,
  iconBg,
  title,
  subtitle,
  onClick,
  rightContent,
  id,
}) => (
  <motion.button
    id={id}
    whileTap={{ scale: 0.985 }}
    onClick={onClick}
    className="flex w-full items-center justify-between rounded-[12px] bg-white dark:bg-neutral-800 border border-neutral-border dark:border-neutral-700 px-4 py-3.5 text-left shadow-soft transition-colors hover:bg-neutral-bg dark:hover:bg-neutral-700 focus:outline-none"
  >
    <div className="flex items-center space-x-3.5">
      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] ${iconBg}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-small font-semibold text-neutral-textPrimary dark:text-white leading-snug">
          {title}
        </p>
        {subtitle && (
          <p className="text-caption text-neutral-textSecondary dark:text-neutral-400 mt-0.5 truncate max-w-[180px]">
            {subtitle}
          </p>
        )}
      </div>
    </div>
    <div className="flex items-center space-x-1.5 text-neutral-textSecondary dark:text-neutral-400 flex-shrink-0">
      {rightContent}
      <ChevronRight className="h-4 w-4 opacity-40" />
    </div>
  </motion.button>
);

// ==========================================
// THEME SEGMENTED CONTROL
// ==========================================
interface ThemeControlProps {
  value: 'light' | 'dark';
  onChange: (v: 'light' | 'dark') => void;
}

const ThemeControl: React.FC<ThemeControlProps> = ({ value, onChange }) => {
  const options: { id: 'light' | 'dark'; label: string; icon: React.ReactNode }[] = [
    { id: 'light', label: 'Light', icon: <Sun className="h-4 w-4" /> },
    { id: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" /> },
  ];

  return (
    <div className="flex rounded-btn bg-neutral-border/30 dark:bg-neutral-700/50 p-1 w-full">
      {options.map((opt) => {
        const isActive = value === opt.id;
        return (
          <button
            key={opt.id}
            id={`theme-btn-${opt.id}`}
            type="button"
            onClick={() => onChange(opt.id)}
            className="relative flex flex-1 items-center justify-center gap-2 py-2.5 rounded-btn text-small font-semibold transition-colors focus:outline-none z-10"
          >
            {isActive && (
              <motion.div
                layoutId="theme-pill"
                className="absolute inset-0 bg-white dark:bg-neutral-600 rounded-[9px] shadow-soft -z-10"
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              />
            )}
            <span className={isActive ? 'text-primary dark:text-primary-light' : 'text-neutral-textSecondary dark:text-neutral-400'}>
              {opt.icon}
            </span>
            <span className={isActive ? 'text-neutral-textPrimary dark:text-white' : 'text-neutral-textSecondary dark:text-neutral-400'}>
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

// ==========================================
// EXCEL EXPORT UTILITY
// ==========================================
const generateExcel = (
  orgName: string,
  place: string,
  students: Student[],
  attendance: AttendanceLog[],
  startDate: string,
  endDate: string
) => {
  const wb = XLSX.utils.book_new();
  wb.Props = { Title: 'Attendance Report' };

  // ── Filter by date range ──
  const filtered = attendance.filter(
    (a) => a.attendance_date >= startDate && a.attendance_date <= endDate
  );

  // ── Unique sorted dates ──
  const allDates = [...new Set(filtered.map((a) => a.attendance_date))].sort();

  // ── Per-student stats ──
  const studentStats = new Map<
    string,
    { present: number; absent: number; dates: Set<string> }
  >();
  students.forEach((s) => {
    studentStats.set(s.id, { present: 0, absent: 0, dates: new Set() });
  });
  filtered.forEach((a) => {
    const stat = studentStats.get(a.student_id);
    if (!stat) return;
    if (a.status === 'present') stat.present++;
    else stat.absent++;
    stat.dates.add(a.attendance_date);
  });

  // Helper to parse date safely
  const parseDate = (d: string) => {
    const [y, m, day] = d.split('-').map(Number);
    return new Date(y, m - 1, day);
  };

  const formatDate = (d: string) =>
    parseDate(d).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const dayName = (d: string) =>
    parseDate(d).toLocaleDateString('en-IN', { weekday: 'long' });

  const totalAttendanceRecords = filtered.length;
  const totalPresent = filtered.filter((a) => a.status === 'present').length;
  const overallPct =
    totalAttendanceRecords > 0
      ? Math.round((totalPresent / totalAttendanceRecords) * 100)
      : 0;

  const generatedAt = new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // ─────────────────────────────────────────
  // SHEET 1 — Attendance Summary
  // ─────────────────────────────────────────
  const summaryData = [
    ['ATTENDANCE REPORT — SUMMARY', '', ''],
    ['Generated', generatedAt, ''],
    [],
    ['Organization', orgName, ''],
    ['Place', place, ''],
    ['Date Range', `${formatDate(startDate)} – ${formatDate(endDate)}`, ''],
    ['Total Students', students.length, ''],
    ['Total Attendance Days', allDates.length, ''],
    ['Total Attendance Percentage', `${overallPct}%`, ''],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
  ws1['!cols'] = [{ wch: 30 }, { wch: 40 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, ws1, 'Attendance Summary');

  // ─────────────────────────────────────────
  // SHEET 2 — Student Summary
  // ─────────────────────────────────────────
  const s2Headers = [
    'Student Name',
    'Place',
    'Phone Number',
    'Present Days',
    'Absent Days',
    'Attendance %',
  ];
  const s2Rows = students.map((s) => {
    const stat = studentStats.get(s.id)!;
    const total = stat.present + stat.absent;
    const pct = total > 0 ? Math.round((stat.present / total) * 100) : 0;
    return [
      s.name,
      s.place || '—',
      s.phone || '—',
      stat.present,
      stat.absent,
      `${pct}%`,
    ];
  });
  const ws2 = XLSX.utils.aoa_to_sheet([s2Headers, ...s2Rows]);
  ws2['!cols'] = [
    { wch: 30 },
    { wch: 20 },
    { wch: 18 },
    { wch: 14 },
    { wch: 14 },
    { wch: 16 },
  ];
  ws2['!freeze'] = { xSplit: 0, ySplit: 1 };
  XLSX.utils.book_append_sheet(wb, ws2, 'Student Summary');

  // ─────────────────────────────────────────
  // SHEET 3 — Daily Attendance
  // ─────────────────────────────────────────
  const s3Headers = [
    'Date',
    'Day',
    'Total Students',
    'Present',
    'Absent',
    'Attendance %',
  ];

  const dateGroups = new Map<
    string,
    { present: number; absent: number }
  >();
  allDates.forEach((d) => dateGroups.set(d, { present: 0, absent: 0 }));
  filtered.forEach((a) => {
    const g = dateGroups.get(a.attendance_date);
    if (!g) return;
    if (a.status === 'present') g.present++;
    else g.absent++;
  });

  const s3Rows = allDates.map((d) => {
    const g = dateGroups.get(d)!;
    const total = g.present + g.absent;
    const pct = total > 0 ? Math.round((g.present / total) * 100) : 0;
    return [
      formatDate(d),
      dayName(d),
      students.length,
      g.present,
      g.absent,
      `${pct}%`,
    ];
  });

  const ws3 = XLSX.utils.aoa_to_sheet([s3Headers, ...s3Rows]);
  ws3['!cols'] = [
    { wch: 20 },
    { wch: 14 },
    { wch: 16 },
    { wch: 12 },
    { wch: 12 },
    { wch: 16 },
  ];
  ws3['!freeze'] = { xSplit: 0, ySplit: 1 };
  XLSX.utils.book_append_sheet(wb, ws3, 'Daily Attendance');

  // ─────────────────────────────────────────
  // SHEET 4 — Attendance Matrix
  // ─────────────────────────────────────────
  const matrixHeader = ['Student Name', ...allDates.map(formatDate)];

  // Build lookup: student_id + date → status
  const lookup = new Map<string, string>();
  filtered.forEach((a) => {
    lookup.set(`${a.student_id}|${a.attendance_date}`, a.status);
  });

  const matrixRows = students.map((s) => {
    const cells = allDates.map((d) => {
      const status = lookup.get(`${s.id}|${d}`);
      if (!status) return '—';
      return status === 'present' ? 'P' : 'A';
    });
    return [s.name, ...cells];
  });

  const ws4 = XLSX.utils.aoa_to_sheet([matrixHeader, ...matrixRows]);
  ws4['!cols'] = [{ wch: 28 }, ...allDates.map(() => ({ wch: 14 }))];
  ws4['!freeze'] = { xSplit: 1, ySplit: 1 };
  XLSX.utils.book_append_sheet(wb, ws4, 'Attendance Matrix');

  // ── Write file ──
  const safeName = place.replace(/\s+/g, '_');
  const today = new Date().toISOString().split('T')[0];
  const fileName = `Attendance_Report_${safeName}_${today}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

// ==========================================
// LEGAL PAGE WRAPPER
// ==========================================
interface LegalPageWrapperProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const LegalPageWrapper: React.FC<LegalPageWrapperProps> = ({ title, onClose, children }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.2, ease: 'easeInOut' }}
    className="fixed inset-0 z-50 flex justify-center bg-black/40 dark:bg-black/60"
    onClick={onClose}
  >
    <div
      className="relative w-full max-w-md h-full bg-neutral-bg dark:bg-neutral-900 overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-neutral-border dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4">
        <button
          onClick={onClose}
          className="flex items-center space-x-2 text-small font-semibold text-primary"
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
          <span>Settings</span>
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-small font-bold text-neutral-textPrimary dark:text-white">
          {title}
        </h1>
      </div>
      {/* Content */}
      <div className="px-5 py-6">
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        }>
          {children}
        </Suspense>
      </div>
    </div>
  </motion.div>
);

// ==========================================
// MAIN SETTINGS PAGE
// ==========================================
export const Settings: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { classPlace, saveClassPlace, theme, saveTheme } = useSettings();

  const orgId = profile?.organization_id;

  // ── State ──
  const [activeLegal, setActiveLegal] = useState<'privacy' | 'terms' | null>(null);

  // Class Place Sheet
  const [isPlaceSheetOpen, setIsPlaceSheetOpen] = useState(false);
  const [placeInput, setPlaceInput] = useState('');
  const [isSavingPlace, setIsSavingPlace] = useState(false);
  const [placeError, setPlaceError] = useState('');

  // Export Sheet
  const [isExportSheetOpen, setIsExportSheetOpen] = useState(false);
  const [exportStart, setExportStart] = useState('');
  const [exportEnd, setExportEnd] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  // ── Queries (for export) ──
  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ['settings_students', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from('students')
        .select('id, name, place, phone')
        .eq('organization_id', orgId)
        .order('name');
      if (error) throw error;
      return (data || []) as Student[];
    },
    enabled: !!orgId,
  });

  const { data: attendanceLogs = [] } = useQuery<AttendanceLog[]>({
    queryKey: ['settings_attendance', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from('attendance')
        .select('student_id, attendance_date, status')
        .eq('organization_id', orgId);
      if (error) throw error;
      return (data || []) as AttendanceLog[];
    },
    enabled: !!orgId,
  });

  const { data: orgInfo } = useQuery<OrgInfo>({
    queryKey: ['settings_org', orgId],
    queryFn: async () => {
      if (!orgId) return { name: 'Assufa Dars', location: null };
      const { data, error } = await supabase
        .from('organizations')
        .select('name, location')
        .eq('id', orgId)
        .single();
      if (error) throw error;
      return data as OrgInfo;
    },
    enabled: !!orgId,
  });

  // ── Handlers: Class Place ──
  const openPlaceSheet = () => {
    setPlaceInput(classPlace);
    setPlaceError('');
    setIsPlaceSheetOpen(true);
  };

  const handleSavePlace = async () => {
    const trimmed = placeInput.trim();
    if (!trimmed) {
      setPlaceError('Place name is required.');
      return;
    }
    setIsSavingPlace(true);
    setPlaceError('');
    try {
      await saveClassPlace(trimmed);
      setIsPlaceSheetOpen(false);
      toast('Class place updated successfully.', 'success');
    } catch (err: any) {
      toast(`Failed to save: ${err.message}`, 'error');
    } finally {
      setIsSavingPlace(false);
    }
  };

  // ── Handlers: Export ──
  const openExportSheet = () => {
    setExportError('');
    // Default: current month
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    setExportStart(`${y}-${m}-01`);
    setExportEnd(`${y}-${m}-${new Date(y, now.getMonth() + 1, 0).getDate()}`);
    setIsExportSheetOpen(true);
  };

  const handleExport = async () => {
    if (!exportStart || !exportEnd) {
      setExportError('Please select a valid date range.');
      return;
    }
    if (exportStart > exportEnd) {
      setExportError('Start date must be before or equal to end date.');
      return;
    }
    setIsExporting(true);
    setExportError('');
    try {
      const orgName = orgInfo?.name || 'Assufa Dars';
      generateExcel(orgName, classPlace, students, attendanceLogs, exportStart, exportEnd);
      setIsExportSheetOpen(false);
      toast('Report exported successfully!', 'success');
    } catch (err: any) {
      setExportError(`Export failed: ${err.message}`);
      toast('Export failed. Please try again.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // ── Handlers: Theme ──
  const handleThemeChange = async (newTheme: 'light' | 'dark') => {
    await saveTheme(newTheme);
    toast(`${newTheme === 'dark' ? 'Dark' : 'Light'} mode enabled.`, 'info');
  };

  // ── Super Admin guard ──
  if (profile?.role === 'super_admin') {
    return (
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="space-y-4 text-left"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-textPrimary dark:text-white">Settings</h1>
          <p className="text-caption text-neutral-textSecondary">Application preferences and utilities.</p>
        </div>
        <div className="rounded-card border border-neutral-border bg-white dark:bg-neutral-800 p-8 text-center">
          <p className="text-small text-neutral-textSecondary">Settings are only available for organization admins.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.18, ease: 'easeInOut' }}
        className="space-y-0.5 text-left pb-2"
      >
        {/* Page Header */}
        <div className="pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-textPrimary dark:text-white">
            Settings
          </h1>
          <p className="text-caption text-neutral-textSecondary dark:text-neutral-400">
            Application preferences and utilities.
          </p>
        </div>

        {/* ─── SECTION 1: CLASS INFORMATION ─── */}
        <SectionLabel label="Class Information" />
        <SettingsRow
          id="settings-class-place"
          icon={<MapPin className="h-4.5 w-4.5 text-primary" />}
          iconBg="bg-primary-soft dark:bg-primary/20"
          title="Class Place"
          subtitle={classPlace}
          onClick={openPlaceSheet}
        />

        {/* ─── SECTION 2: EXPORT REPORTS ─── */}
        <SectionLabel label="Export Reports" />
        <SettingsRow
          id="settings-export-report"
          icon={<Download className="h-4.5 w-4.5 text-info" />}
          iconBg="bg-cyan-50 dark:bg-cyan-900/30"
          title="Export Attendance Report"
          subtitle="Download Excel (.xlsx)"
          onClick={openExportSheet}
        />

        {/* ─── SECTION 3: APPEARANCE ─── */}
        <SectionLabel label="Appearance" />
        <div className="rounded-[12px] bg-white dark:bg-neutral-800 border border-neutral-border dark:border-neutral-700 px-4 py-3.5 shadow-soft">
          <div className="flex items-center space-x-3.5 mb-3.5">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] bg-amber-50 dark:bg-amber-900/30">
              {theme === 'dark'
                ? <Moon className="h-4.5 w-4.5 text-amber-500" />
                : <Sun className="h-4.5 w-4.5 text-amber-500" />}
            </div>
            <p className="text-small font-semibold text-neutral-textPrimary dark:text-white">
              Theme
            </p>
          </div>
          <ThemeControl value={theme} onChange={handleThemeChange} />
        </div>

        {/* ─── SECTION 4: LEGAL ─── */}
        <SectionLabel label="Legal" />
        <div className="space-y-2">
          <SettingsRow
            id="settings-privacy-policy"
            icon={<Shield className="h-4.5 w-4.5 text-success" />}
            iconBg="bg-emerald-50 dark:bg-emerald-900/30"
            title="Privacy Policy"
            subtitle="How we handle your data"
            onClick={() => setActiveLegal('privacy')}
          />
          <SettingsRow
            id="settings-terms-conditions"
            icon={<FileText className="h-4.5 w-4.5 text-neutral-textSecondary" />}
            iconBg="bg-neutral-border/40 dark:bg-neutral-700/60"
            title="Terms & Conditions"
            subtitle="Usage rules and agreements"
            onClick={() => setActiveLegal('terms')}
          />
        </div>

        {/* ─── App version ─── */}
        <div className="pt-6 pb-2 text-center">
          <p className="text-caption text-neutral-textSecondary/50 dark:text-neutral-600">
            Assufa Dars · v1.0.0
          </p>
        </div>
      </motion.div>

      {/* ─────────────────────────────────────
          CLASS PLACE BOTTOM SHEET
      ───────────────────────────────────── */}
      <BottomSheet
        isOpen={isPlaceSheetOpen}
        onClose={() => setIsPlaceSheetOpen(false)}
        title="Edit Class Place"
      >
        <div className="space-y-5 pt-1">
          <Input
            id="place-name-input"
            label="Place Name"
            placeholder="e.g. Wandoor"
            value={placeInput}
            onChange={(e) => {
              setPlaceInput(e.target.value);
              if (placeError) setPlaceError('');
            }}
            error={placeError}
            autoFocus
          />
          <div className="grid grid-cols-2 gap-3 pt-1">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setIsPlaceSheetOpen(false)}
              disabled={isSavingPlace}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSavePlace}
              loading={isSavingPlace}
            >
              Save
            </Button>
          </div>
        </div>
      </BottomSheet>

      {/* ─────────────────────────────────────
          EXPORT BOTTOM SHEET
      ───────────────────────────────────── */}
      <BottomSheet
        isOpen={isExportSheetOpen}
        onClose={() => setIsExportSheetOpen(false)}
        title="Export Attendance Report"
      >
        <div className="space-y-4 pt-1">
          <p className="text-small text-neutral-textSecondary dark:text-neutral-400">
            Select a date range to include in the Excel report.
          </p>

          <DatePicker
            label="Start Date"
            value={exportStart}
            onChange={(v) => {
              setExportStart(v);
              if (exportError) setExportError('');
            }}
          />
          <DatePicker
            label="End Date"
            value={exportEnd}
            onChange={(v) => {
              setExportEnd(v);
              if (exportError) setExportError('');
            }}
          />

          {exportError && (
            <p className="text-caption font-semibold text-danger">{exportError}</p>
          )}

          <div className="grid grid-cols-2 gap-3 pt-1">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setIsExportSheetOpen(false)}
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={Download}
              onClick={handleExport}
              loading={isExporting}
            >
              Export Excel
            </Button>
          </div>
        </div>
      </BottomSheet>

      {/* ─────────────────────────────────────
          LEGAL OVERLAYS
      ───────────────────────────────────── */}
      <AnimatePresence>
        {activeLegal === 'privacy' && (
          <LegalPageWrapper
            title="Privacy Policy"
            onClose={() => setActiveLegal(null)}
          >
            <PrivacyPolicy />
          </LegalPageWrapper>
        )}
        {activeLegal === 'terms' && (
          <LegalPageWrapper
            title="Terms & Conditions"
            onClose={() => setActiveLegal(null)}
          >
            <TermsConditions />
          </LegalPageWrapper>
        )}
      </AnimatePresence>
    </>
  );
};
