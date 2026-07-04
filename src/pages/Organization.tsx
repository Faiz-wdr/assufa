import React, { useState, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  MapPin,
  FileSpreadsheet,
  Sun,
  Moon,
  Shield,
  ScrollText,
  ChevronRight,
  Building2,
  Download,
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import type { ThemePreference } from '@/features/auth/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/CoreUI';
import { Input } from '@/components/ui/FormComponents';
import { DatePicker } from '@/components/ui/FormComponents';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { supabase } from '@/supabase/supabase';

// Lazy-load legal pages
const PrivacyPolicy = lazy(() =>
  import('@/components/settings/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy }))
);
const TermsConditions = lazy(() =>
  import('@/components/settings/TermsConditions').then(m => ({ default: m.TermsConditions }))
);

// ==========================================
// TYPES
// ==========================================
type LegalView = 'privacy' | 'terms' | null;

// ==========================================
// SETTINGS ROW COMPONENT
// ==========================================
interface SettingsRowProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onClick?: () => void;
  rightElement?: React.ReactNode;
  disabled?: boolean;
}

const SettingsRow: React.FC<SettingsRowProps> = ({ icon, label, value, onClick, rightElement, disabled }) => (
  <motion.button
    type="button"
    whileTap={onClick && !disabled ? { scale: 0.98 } : {}}
    onClick={onClick}
    disabled={disabled || !onClick}
    className={`w-full flex items-center justify-between px-4 py-4 transition-colors text-left ${
      onClick && !disabled
        ? 'cursor-pointer hover:bg-accent active:bg-accent'
        : 'cursor-default'
    }`}
  >
    <div className="flex items-center gap-3.5 min-w-0">
      <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary/10 text-primary flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-small font-semibold text-foreground">{label}</p>
        {value && <p className="text-caption text-muted-foreground mt-0.5 truncate">{value}</p>}
      </div>
    </div>
    {rightElement !== undefined ? (
      rightElement
    ) : onClick ? (
      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
    ) : null}
  </motion.button>
);

// ==========================================
// SECTION WRAPPER
// ==========================================
const SettingsSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-0">
    <p className="px-1 pb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
      {title}
    </p>
    <div className="rounded-card border border-border overflow-hidden divide-y divide-border"
      style={{ backgroundColor: 'var(--surface)' }}>
      {children}
    </div>
  </div>
);

// ==========================================
// THEME SEGMENTED CONTROL
// ==========================================
const ThemeSelector: React.FC<{
  value: ThemePreference;
  onChange: (t: ThemePreference) => void;
  loading: boolean;
}> = ({ value, onChange, loading }) => {
  const options: { key: ThemePreference; label: string; icon: React.ReactNode }[] = [
    { key: 'light', label: 'Light', icon: <Sun className="h-4 w-4" /> },
    { key: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" /> },
  ];

  return (
    <div className="flex rounded-btn bg-accent/60 p-1 gap-1">
      {options.map(opt => {
        const isActive = value === opt.key;
        return (
          <button
            key={opt.key}
            type="button"
            disabled={loading}
            onClick={() => onChange(opt.key)}
            className={`relative flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-btn text-small font-semibold transition-all focus:outline-none disabled:opacity-60 ${
              isActive
                ? 'bg-background text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

// ==========================================
// LOCAL DATA TYPES FOR EXPORT
// ==========================================
interface StudentRow {
  id: string;
  name: string;
  place: string | null;
  phone: string | null;
}

interface AttendanceRow {
  student_id: string;
  attendance_date: string;
  status: 'present' | 'absent' | 'excused';
}

// ==========================================
// EXCEL EXPORT UTILITY
// ==========================================
async function exportAttendanceReport(
  orgId: string,
  orgName: string,
  orgLocation: string,
  startDate: string,
  endDate: string
): Promise<void> {
  // Fetch all required data in parallel
  const [studentsRes, attendanceRes] = await Promise.all([
    supabase
      .from('students')
      .select('id, name, place, phone')
      .eq('organization_id', orgId)
      .order('name'),
    supabase
      .from('attendance')
      .select('student_id, attendance_date, status')
      .eq('organization_id', orgId)
      .gte('attendance_date', startDate)
      .lte('attendance_date', endDate)
      .order('attendance_date'),
  ]);

  if (studentsRes.error) throw studentsRes.error;
  if (attendanceRes.error) throw attendanceRes.error;

  const students = (studentsRes.data || []) as StudentRow[];
  const attendance = (attendanceRes.data || []) as AttendanceRow[];

  // Dynamically import xlsx only when needed
  const XLSX = await import('xlsx');

  const workbook = XLSX.utils.book_new();
  workbook.Props = { Title: 'Attendance Report' };

  const today = new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric'
  });

  // --- Unique dates in range ---
  const dateSet = new Set<string>();
  attendance.forEach(r => dateSet.add(r.attendance_date));
  const uniqueDates = Array.from(dateSet).sort();
  const totalDays = uniqueDates.length;

  // --- Per-student stats ---
  const studentStats = students.map(s => {
    const recs = attendance.filter(r => r.student_id === s.id);
    const present = recs.filter(r => r.status === 'present').length;
    const absent = recs.filter(r => r.status === 'absent').length;
    const pct = recs.length > 0 ? Math.round((present / recs.length) * 100) : 0;
    return { ...s, present, absent, total: recs.length, pct };
  });

  const totalStudents = students.length;
  const overallPresent = studentStats.reduce((s, x) => s + x.present, 0);
  const overallTotal = studentStats.reduce((s, x) => s + x.total, 0);
  const overallPct = overallTotal > 0 ? Math.round((overallPresent / overallTotal) * 100) : 0;

  // Helper to auto-fit columns
  const autoFit = (ws: any, data: any[][]) => {
    const widths = data[0]?.map((_: any, i: number) => ({
      wch: Math.max(...data.map(row => String(row[i] ?? '').length), 10)
    })) || [];
    ws['!cols'] = widths;
  };

  // ==========================================
  // SHEET 1: ATTENDANCE SUMMARY
  // ==========================================
  const summaryData = [
    ['Attendance Report', ''],
    ['', ''],
    ['Organization', orgName],
    ['Location / Place', orgLocation],
    ['Report Period', `${startDate} to ${endDate}`],
    ['Export Date', today],
    ['', ''],
    ['Total Students', totalStudents],
    ['Total Attendance Days', totalDays],
    ['Overall Present Count', overallPresent],
    ['Overall Attendance %', `${overallPct}%`],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
  ws1['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];
  // Bold headers
  if (ws1['A1']) ws1['A1'].s = { font: { bold: true, sz: 14 } };
  XLSX.utils.book_append_sheet(workbook, ws1, 'Attendance Summary');

  // ==========================================
  // SHEET 2: STUDENT SUMMARY
  // ==========================================
  const studentHeaders = ['Student Name', 'Place', 'Phone Number', 'Present Days', 'Absent Days', 'Attendance %'];
  const studentRows = studentStats.map(s => [
    s.name,
    s.place || '—',
    s.phone || '—',
    s.present,
    s.absent,
    `${s.pct}%`,
  ]);
  const ws2Data = [studentHeaders, ...studentRows];
  const ws2 = XLSX.utils.aoa_to_sheet(ws2Data);
  ws2['!freeze'] = { xSplit: 0, ySplit: 1 };
  ws2['!views'] = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];
  autoFit(ws2, ws2Data);
  XLSX.utils.book_append_sheet(workbook, ws2, 'Student Summary');

  // ==========================================
  // SHEET 3: DAILY ATTENDANCE
  // ==========================================
  const dailyHeaders = ['Date', 'Day', 'Total Students', 'Present', 'Absent', 'Attendance %'];
  const dailyRows = uniqueDates.map(date => {
    const dayRecs = attendance.filter(r => r.attendance_date === date);
    const present = dayRecs.filter(r => r.status === 'present').length;
    const absent = dayRecs.filter(r => r.status === 'absent').length;
    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    const pct = dayRecs.length > 0 ? Math.round((present / dayRecs.length) * 100) : 0;
    return [date, dayName, dayRecs.length, present, absent, `${pct}%`];
  });
  const ws3Data = [dailyHeaders, ...dailyRows];
  const ws3 = XLSX.utils.aoa_to_sheet(ws3Data);
  ws3['!views'] = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];
  autoFit(ws3, ws3Data);
  XLSX.utils.book_append_sheet(workbook, ws3, 'Daily Attendance');

  // ==========================================
  // SHEET 4: ATTENDANCE MATRIX
  // ==========================================
  const matrixHeader = ['Student Name', ...uniqueDates];
  const matrixRows = students.map(s => {
    const cells = uniqueDates.map(date => {
      const rec = attendance.find(r => r.student_id === s.id && r.attendance_date === date);
      if (!rec) return '—';
      if (rec.status === 'present') return 'P';
      if (rec.status === 'absent') return 'A';
      return 'E';
    });
    return [s.name, ...cells];
  });
  const ws4Data = [matrixHeader, ...matrixRows];
  const ws4 = XLSX.utils.aoa_to_sheet(ws4Data);
  ws4['!views'] = [{ state: 'frozen', xSplit: 1, ySplit: 1 }];
  // Auto-fit first column (student name)
  const nameWidth = Math.max(...students.map(s => s.name.length), 14);
  ws4['!cols'] = [{ wch: nameWidth }, ...uniqueDates.map(() => ({ wch: 12 }))];
  XLSX.utils.book_append_sheet(workbook, ws4, 'Attendance Matrix');

  // Generate file name
  const safePlace = orgLocation.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Attendance_Report_${safePlace}_${endDate}.xlsx`;

  XLSX.writeFile(workbook, fileName);
}

// ==========================================
// MAIN SETTINGS PAGE
// ==========================================
export const Organization: React.FC = () => {
  const { profile, organization, theme, updateOrganizationPlace, updateTheme } = useAuth();
  const { toast } = useToast();
  const isSuperAdmin = profile?.role === 'super_admin';

  // Sub-view state (legal pages)
  const [legalView, setLegalView] = useState<LegalView>(null);

  // Class Place sheet state
  const [isPlaceSheetOpen, setIsPlaceSheetOpen] = useState(false);
  const [placeInput, setPlaceInput] = useState('');
  const [placeError, setPlaceError] = useState('');
  const [isSavingPlace, setIsSavingPlace] = useState(false);

  // Export sheet state
  const [isExportSheetOpen, setIsExportSheetOpen] = useState(false);
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [exportDateError, setExportDateError] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Theme update state
  const [isUpdatingTheme, setIsUpdatingTheme] = useState(false);

  // --- Handlers ---
  const openPlaceSheet = () => {
    setPlaceInput(organization?.location || '');
    setPlaceError('');
    setIsPlaceSheetOpen(true);
  };

  const handleSavePlace = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = placeInput.trim();
    if (!trimmed) {
      setPlaceError('Place name is required.');
      return;
    }
    setIsSavingPlace(true);
    try {
      await updateOrganizationPlace(trimmed);
      toast('Class place updated successfully!', 'success');
      setIsPlaceSheetOpen(false);
    } catch (err: any) {
      toast(`Failed to update: ${err.message}`, 'error');
    } finally {
      setIsSavingPlace(false);
    }
  };

  const validateExportDates = (): boolean => {
    if (!exportStartDate || !exportEndDate) {
      setExportDateError('Please select both start and end dates.');
      return false;
    }
    if (exportStartDate > exportEndDate) {
      setExportDateError('Start date must be before or equal to end date.');
      return false;
    }
    setExportDateError('');
    return true;
  };

  const handleExport = async () => {
    if (!validateExportDates()) return;
    if (!organization) {
      toast('No organization data found.', 'error');
      return;
    }

    setIsExporting(true);
    try {
      await exportAttendanceReport(
        organization.id,
        organization.name,
        organization.location || organization.name,
        exportStartDate,
        exportEndDate
      );
      toast('Report exported successfully!', 'success');
      setIsExportSheetOpen(false);
    } catch (err: any) {
      toast(`Export failed: ${err.message}`, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleThemeChange = async (newTheme: ThemePreference) => {
    setIsUpdatingTheme(true);
    try {
      await updateTheme(newTheme);
    } finally {
      setIsUpdatingTheme(false);
    }
  };

  // ==========================================
  // SUPER ADMIN VIEW
  // ==========================================
  if (isSuperAdmin) {
    return (
      <div className="space-y-4 text-left">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="text-caption text-muted-foreground">Application preferences and utilities.</p>
        </div>

        <SettingsSection title="Appearance">
          <SettingsRow
            icon={theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            label="Theme"
            rightElement={
              <ThemeSelector value={theme} onChange={handleThemeChange} loading={isUpdatingTheme} />
            }
          />
        </SettingsSection>

        <SettingsSection title="Legal">
          <SettingsRow
            icon={<Shield className="h-4 w-4" />}
            label="Privacy Policy"
            onClick={() => setLegalView('privacy')}
          />
          <SettingsRow
            icon={<ScrollText className="h-4 w-4" />}
            label="Terms & Conditions"
            onClick={() => setLegalView('terms')}
          />
        </SettingsSection>

        {/* Legal Pages Overlay */}
        <AnimatePresence>
          {legalView && (
            <Suspense fallback={null}>
              {legalView === 'privacy' && (
                <PrivacyPolicy onBack={() => setLegalView(null)} />
              )}
              {legalView === 'terms' && (
                <TermsConditions onBack={() => setLegalView(null)} />
              )}
            </Suspense>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ==========================================
  // ORG ADMIN VIEW (FULL SETTINGS)
  // ==========================================
  return (
    <div className="relative space-y-5 text-left">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-caption text-muted-foreground">Manage your class preferences and data.</p>
      </div>

      {/* SECTION 1: CLASS INFORMATION */}
      <SettingsSection title="Class Information">
        <SettingsRow
          icon={<MapPin className="h-4 w-4" />}
          label="Class Place"
          value={organization?.location || 'Not set'}
          onClick={openPlaceSheet}
        />
        <SettingsRow
          icon={<Building2 className="h-4 w-4" />}
          label="Class Name"
          value={organization?.name || 'Not set'}
        />
      </SettingsSection>

      {/* SECTION 2: EXPORT REPORTS */}
      <SettingsSection title="Export Reports">
        <SettingsRow
          icon={<FileSpreadsheet className="h-4 w-4" />}
          label="Export Attendance Report"
          value="Generate a multi-sheet Excel workbook"
          onClick={() => {
            setExportStartDate('');
            setExportEndDate('');
            setExportDateError('');
            setIsExportSheetOpen(true);
          }}
        />
      </SettingsSection>

      {/* SECTION 3: APPEARANCE */}
      <SettingsSection title="Appearance">
        <SettingsRow
          icon={theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          label="Theme"
          rightElement={
            <ThemeSelector value={theme} onChange={handleThemeChange} loading={isUpdatingTheme} />
          }
        />
      </SettingsSection>

      {/* SECTION 4: LEGAL */}
      <SettingsSection title="Legal">
        <SettingsRow
          icon={<Shield className="h-4 w-4" />}
          label="Privacy Policy"
          onClick={() => setLegalView('privacy')}
        />
        <SettingsRow
          icon={<ScrollText className="h-4 w-4" />}
          label="Terms & Conditions"
          onClick={() => setLegalView('terms')}
        />
      </SettingsSection>

      {/* App version footer */}
      <div className="pt-2 pb-1 text-center">
        <p className="text-caption text-muted-foreground">Assufa Dars · v0.1.0</p>
      </div>

      {/* ==========================================
          CLASS PLACE BOTTOM SHEET
      ========================================== */}
      <BottomSheet
        isOpen={isPlaceSheetOpen}
        onClose={() => setIsPlaceSheetOpen(false)}
        title="Edit Class Place"
      >
        <form onSubmit={handleSavePlace} className="space-y-5 pt-1">
          <p className="text-caption text-muted-foreground">
            This name will appear as the subtitle in the application header.
          </p>
          <Input
            label="Place Name *"
            value={placeInput}
            onChange={e => {
              setPlaceInput(e.target.value);
              if (placeError) setPlaceError('');
            }}
            placeholder="e.g. Wandoor"
            error={placeError}
            disabled={isSavingPlace}
            autoFocus
          />
          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setIsPlaceSheetOpen(false)}
              disabled={isSavingPlace}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              loading={isSavingPlace}
            >
              Save
            </Button>
          </div>
        </form>
      </BottomSheet>

      {/* ==========================================
          EXPORT REPORT BOTTOM SHEET
      ========================================== */}
      <BottomSheet
        isOpen={isExportSheetOpen}
        onClose={() => setIsExportSheetOpen(false)}
        title="Export Attendance Report"
      >
        <div className="space-y-5 pt-1">
          <p className="text-caption text-muted-foreground">
            Select a date range to generate a multi-sheet Excel report including student summaries, daily attendance, and an attendance matrix.
          </p>

          <div className="space-y-4">
            <DatePicker
              label="Start Date"
              value={exportStartDate}
              onChange={v => {
                setExportStartDate(v);
                if (exportDateError) setExportDateError('');
              }}
              disabled={isExporting}
            />
            <DatePicker
              label="End Date"
              value={exportEndDate}
              onChange={v => {
                setExportEndDate(v);
                if (exportDateError) setExportDateError('');
              }}
              disabled={isExporting}
            />
          </div>

          {exportDateError && (
            <p className="text-caption font-semibold text-danger">{exportDateError}</p>
          )}

          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setIsExportSheetOpen(false)}
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              className="flex-1"
              icon={Download}
              loading={isExporting}
              onClick={handleExport}
            >
              Export Excel
            </Button>
          </div>
        </div>
      </BottomSheet>

      {/* ==========================================
          LEGAL PAGES OVERLAY (Lazy)
      ========================================== */}
      <AnimatePresence>
        {legalView && (
          <Suspense fallback={null}>
            {legalView === 'privacy' && (
              <PrivacyPolicy onBack={() => setLegalView(null)} />
            )}
            {legalView === 'terms' && (
              <TermsConditions onBack={() => setLegalView(null)} />
            )}
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  );
};
