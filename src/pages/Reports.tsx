import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  ChevronDown,
  Trash2,
  Edit,
  Users,
  Share2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/supabase/supabase';
import { useAuth } from '@/features/auth/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Dialog } from '@/components/ui/Dialog';
import {
  Button,
  Card,
  SearchBar,
  Skeleton,
  EmptyState,
  ErrorState
} from '@/components/ui/CoreUI';

// Types matching database schema
interface Student {
  id: string;
  name: string;
}

interface AttendanceLog {
  student_id: string;
  attendance_date: string;
  status: 'present' | 'absent' | 'excused';
}

interface ReportGroup {
  dateStr: string;
  dayName: string;
  formattedDate: string;
  present: string[];
  absent: string[];
  presentCount: number;
  absentCount: number;
  percentage: number;
}

export const Reports: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const orgId = profile?.organization_id;

  // State Hooks
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [dateToDelete, setDateToDelete] = useState<string | null>(null);

  // ==========================================
  // 1. DATABASE QUERIES & MUTATIONS
  // ==========================================

  // Query: Get students roster for mapping names
  const {
    data: students,
    isLoading: isStudentsLoading,
    error: studentsError
  } = useQuery<Student[]>({
    queryKey: ['students_roster_names', orgId],
    queryFn: async () => {
      if (!orgId) return [] as Student[];
      const { data, error } = await supabase
        .from('students')
        .select('id, name')
        .eq('organization_id', orgId);
      if (error) throw error;
      return (data || []) as Student[];
    },
    enabled: !!orgId,
  });

  // Query: Get all attendance logs for organization
  const {
    data: attendanceLogs,
    isLoading: isAttendanceLoading,
    error: attendanceError,
    refetch: refetchReports
  } = useQuery<AttendanceLog[]>({
    queryKey: ['attendance_history', orgId],
    queryFn: async () => {
      if (!orgId) return [] as AttendanceLog[];
      const { data, error } = await supabase
        .from('attendance')
        .select('student_id, attendance_date, status')
        .eq('organization_id', orgId);
      if (error) throw error;
      return (data || []) as AttendanceLog[];
    },
    enabled: !!orgId,
  });

  // Query: Get organization details for share reports
  const { data: orgInfo } = useQuery({
    queryKey: ['org_info_reports', orgId],
    queryFn: async () => {
      if (!orgId) return null;
      const { data, error } = await supabase
        .from('organizations')
        .select('name, location')
        .eq('id', orgId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!orgId
  });

  const [isSharing, setIsSharing] = useState(false);

  // Mutation: Delete Attendance for Date
  const deleteAttendanceMutation = useMutation({
    mutationFn: async (dateStr: string) => {
      if (!orgId) throw new Error('No active organization session found. Please log out and log back in.');
      const { error } = await supabase
        .from('attendance')
        .delete()
        .eq('organization_id', orgId)
        .eq('attendance_date', dateStr);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance_history', orgId] });
      queryClient.invalidateQueries({ queryKey: ['attendance_stats', orgId] });
      toast('Attendance records deleted successfully.', 'success');
      setExpandedDate(null);
    },
    onError: (err: any) => {
      toast(`Failed to delete attendance: ${err.message}`, 'error');
    }
  });

  // ==========================================
  // 2. DATA AGGREGATION & SEARCH FILTER
  // ==========================================

  // timezone-neutral date formatter
  const formatDisplayDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Group attendance records by date
  const reports = useMemo(() => {
    if (!attendanceLogs || !students) return [] as ReportGroup[];

    // Create a map for quick student name lookup
    const studentMap = new Map(students.map(s => [s.id, s.name]));

    const groups: Record<string, ReportGroup> = {};

    attendanceLogs.forEach(log => {
      const date = log.attendance_date;
      if (!groups[date]) {
        // Parse date timezone-safely
        const [year, month, day] = date.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day);
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
        const formattedDate = dateObj.toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' });

        groups[date] = {
          dateStr: date,
          dayName,
          formattedDate,
          present: [],
          absent: [],
          presentCount: 0,
          absentCount: 0,
          percentage: 0
        };
      }

      const studentName = studentMap.get(log.student_id) || 'Unknown Student';
      if (log.status === 'absent') {
        groups[date].absent.push(studentName);
        groups[date].absentCount++;
      } else {
        groups[date].present.push(studentName);
        groups[date].presentCount++;
      }
    });

    // Convert to array, sort lists, calculate percentages, and sort reverse-chronologically
    return Object.values(groups).map(g => {
      const total = g.presentCount + g.absentCount;
      g.percentage = total > 0 ? Math.round((g.presentCount / total) * 100) : 0;

      // Sort student names alphabetically
      g.present.sort((a, b) => a.localeCompare(b));
      g.absent.sort((a, b) => a.localeCompare(b));
      return g;
    }).sort((a, b) => b.dateStr.localeCompare(a.dateStr));
  }, [attendanceLogs, students]);

  // Filter reports by search query (date, day name, month name)
  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return reports;
    const q = searchQuery.toLowerCase().trim();
    return reports.filter(r =>
      r.dateStr.includes(q) ||
      r.dayName.toLowerCase().includes(q) ||
      r.formattedDate.toLowerCase().includes(q)
    );
  }, [reports, searchQuery]);

  // ==========================================
  // 3. EVENT HANDLERS
  // ==========================================

  const handleCardTap = (dateStr: string) => {
    setExpandedDate(prev => prev === dateStr ? null : dateStr);
  };

  const handleEditClick = (e: React.MouseEvent, dateStr: string) => {
    e.stopPropagation();
    navigate(`/attendance?date=${dateStr}`);
  };

  const handleDeleteClick = (e: React.MouseEvent, dateStr: string) => {
    e.stopPropagation();
    setDateToDelete(dateStr);
    setIsDeleteDialogOpen(true);
  };

  // ── Share Attendance as Image (Canvas based) ──
  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  const downloadFile = (blob: Blob, dateStr: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance_report_${dateStr}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast('Image downloaded. You can now share it to WhatsApp!', 'info');
  };

  const shareImage = async (canvas: HTMLCanvasElement, dateStr: string) => {
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast('Failed to generate image file.', 'error');
          return;
        }

        const file = new File([blob], `attendance_${dateStr}.png`, { type: 'image/png' });

        // Check if Web Share API is supported
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: `Attendance Report - ${dateStr}`,
              text: `Daily attendance report for ${dateStr}.`
            });
            toast('Shared successfully!', 'success');
          } catch (shareError: any) {
            // AbortError is triggered if the user cancels the share sheet
            if (shareError.name !== 'AbortError') {
              downloadFile(blob, dateStr);
            }
          }
        } else {
          downloadFile(blob, dateStr);
        }
      }, 'image/png');
    } catch (err: any) {
      toast('Failed to generate sharing image.', 'error');
    }
  };

  const handleShareAsImage = async (report: ReportGroup) => {
    setIsSharing(true);
    try {
      const orgName = (orgInfo as any)?.name || 'Assufa Dars';
      const orgLocation = (orgInfo as any)?.location || '';

      // Merge present and absent lists into a single alphabetically sorted list
      const allStudents = [
        ...report.present.map(name => ({ name, status: 'Present' as const })),
        ...report.absent.map(name => ({ name, status: 'Absent' as const }))
      ];
      allStudents.sort((a, b) => a.name.localeCompare(b.name));

      // Native High-Resolution Canvas Dimensions (2x size: 960px width)
      const width = 960;
      const headerHeight = 240;
      const rowHeight = 88;
      const summaryHeight = 120;
      const footerHeight = 100;
      const height = headerHeight + summaryHeight + (allStudents.length * rowHeight) + footerHeight;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Enable high quality text rendering alignment
      ctx.textBaseline = 'middle';

      // 1. Header background (Ruby Crimson Brand Primary)
      ctx.fillStyle = '#B51D52';
      ctx.fillRect(0, 0, width, headerHeight);

      // 2. Header Text (Native High-Res Vector Fonts)
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 38px sans-serif';
      ctx.fillText('Attendance Report', 48, 70);

      ctx.font = '500 24px sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText(`${orgName} ${orgLocation ? `• ${orgLocation}` : ''}`, 48, 125);

      ctx.font = 'bold 24px sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(`${report.dayName}, ${report.formattedDate}`, 48, 180);

      // 3. Summary row background
      ctx.fillStyle = '#FAFAFA';
      ctx.fillRect(0, headerHeight, width, summaryHeight);

      // Bottom border for summary
      ctx.strokeStyle = '#E5E7EB';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, headerHeight + summaryHeight);
      ctx.lineTo(width, headerHeight + summaryHeight);
      ctx.stroke();

      // Summary text positioning
      ctx.font = '600 22px sans-serif';

      // Present Count
      ctx.fillStyle = '#16A34A';
      ctx.fillText(`Present: ${report.presentCount}`, 48, headerHeight + 60);

      // Absent Count
      ctx.fillStyle = '#DC2626';
      ctx.fillText(`Absent: ${report.absentCount}`, 320, headerHeight + 60);

      // Percentage
      ctx.fillStyle = '#111827';
      ctx.fillText(`Attendance: ${report.percentage}%`, 600, headerHeight + 60);

      // 4. Students rows
      let currentY = headerHeight + summaryHeight;
      allStudents.forEach((student, index) => {
        // Alternate backgrounds
        ctx.fillStyle = index % 2 === 0 ? '#FFFFFF' : '#F9FAFB';
        ctx.fillRect(0, currentY, width, rowHeight);

        // Bottom border line
        ctx.strokeStyle = '#F3F4F6';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, currentY + rowHeight);
        ctx.lineTo(width, currentY + rowHeight);
        ctx.stroke();

        // Student name
        ctx.fillStyle = '#111827';
        ctx.font = '600 26px sans-serif';
        ctx.fillText(student.name, 48, currentY + (rowHeight / 2));

        // Draw status badge pill (Scaled up for high-res)
        const badgeText = student.status.toUpperCase();
        const badgeWidth = student.status === 'Present' ? 144 : 130;
        const badgeHeight = 44;
        const badgeX = width - badgeWidth - 48;
        const badgeY = currentY + (rowHeight - badgeHeight) / 2;

        ctx.fillStyle = student.status === 'Present' ? '#DCFCE7' : '#FEE2E2';
        drawRoundedRect(ctx, badgeX, badgeY, badgeWidth, badgeHeight, 10);
        ctx.fill();

        ctx.fillStyle = student.status === 'Present' ? '#16A34A' : '#DC2626';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(badgeText, badgeX + (badgeWidth / 2), badgeY + (badgeHeight / 2) + 1);
        ctx.textAlign = 'left'; // restore alignment

        currentY += rowHeight;
      });

      // 5. Footer
      ctx.fillStyle = '#F3F4F6';
      ctx.fillRect(0, currentY, width, footerHeight);

      ctx.fillStyle = '#9CA3AF';
      ctx.font = '500 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Generated via Assufa Dars App', width / 2, currentY + (footerHeight / 2));
      ctx.textAlign = 'left';

      await shareImage(canvas, report.dateStr);
    } catch (err: any) {
      toast('Failed to generate image.', 'error');
    } finally {
      setIsSharing(false);
    }
  };

  const handleConfirmDelete = () => {
    if (dateToDelete) {
      deleteAttendanceMutation.mutate(dateToDelete);
    }
    setIsDeleteDialogOpen(false);
  };

  // ==========================================
  // 4. RENDER METHODS
  // ==========================================

  // Super Admin View Guard
  if (profile && profile.role === 'super_admin') {
    return (
      <div className="space-y-6 text-left">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-textPrimary">Reports</h1>
          <p className="text-sm text-neutral-textSecondary">View historical metrics.</p>
        </div>
        <Card className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-neutral-800 border border-neutral-border dark:border-neutral-700">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft dark:bg-primary/20 text-primary mb-4">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-body-lg font-bold text-neutral-textPrimary dark:text-white">Super Admin Mode</h3>
          <p className="mt-2 text-small text-neutral-textSecondary dark:text-neutral-400 max-w-xs">
            Super Admins manage tenant organizations globally. To view or edit attendance reports, please log in or switch context to an organization Class Admin.
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
      className="space-y-4 text-left"
    >
      {/* Page Title & Subtext */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-textPrimary">Reports</h1>
        <p className="text-caption text-neutral-textSecondary">Review log history, edit mistakes, or delete days.</p>
      </div>

      {/* Dynamic Search Box */}
      <SearchBar
        value={searchQuery}
        onChange={(val) => {
          setSearchQuery(val);
          setExpandedDate(null); // Collapse open card on filter
        }}
        placeholder="Search by date or day..."
      />

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full animate-pulse" />
          <Skeleton className="h-24 w-full animate-pulse" />
          <Skeleton className="h-24 w-full animate-pulse" />
        </div>
      )}

      {/* Fetching Error State */}
      {!isLoading && isError && (
        <div className="pt-2">
          <ErrorState
            description="Failed to load historical attendance logs. Please check database connection."
            onRetry={refetchReports}
          />
        </div>
      )}

      {/* Roster Reports */}
      {!isLoading && !isError && (
        <>
          {/* Case A: No Logs Exist at All */}
          {reports.length === 0 && (
            <div className="pt-4">
              <EmptyState
                title="No attendance recorded"
                description="Click below to record your first class attendance roster logs."
                icon={Calendar}
                actionLabel="Go to Attendance"
                onAction={() => navigate('/attendance')}
              />
            </div>
          )}

          {/* Case B: Logs exist but search filters everything out */}
          {reports.length > 0 && filteredReports.length === 0 && (
            <div className="pt-4">
              <EmptyState
                title="No results match search"
                description="Try search by day name (e.g. Friday) or date numbers."
                onAction={() => setSearchQuery('')}
                actionLabel="Clear Search"
              />
            </div>
          )}

          {/* Case C: Render Grouped Cards */}
          {filteredReports.length > 0 && (
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {filteredReports.map((report) => {
                  const isExpanded = expandedDate === report.dateStr;
                  const pct = report.percentage;

                  return (
                    <motion.div
                      key={report.dateStr}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="rounded-card border border-neutral-border dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden shadow-soft"
                    >
                      {/* Card Header Tappable Segment */}
                      <div
                        onClick={() => handleCardTap(report.dateStr)}
                        className="flex items-center justify-between p-4 cursor-pointer select-none"
                      >
                        <div className="flex items-center space-x-3 text-left">
                          <div className="flex h-10 w-10 flex-col items-center justify-center rounded-[10px] bg-primary-soft dark:bg-primary/20 text-primary font-bold text-xs select-none">
                            <Calendar className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-neutral-textSecondary dark:text-neutral-400 tracking-wider block leading-none">{report.dayName}</span>
                            <span className="font-bold text-body text-neutral-textPrimary dark:text-white mt-1.5 block leading-none">{formatDisplayDate(report.dateStr)}</span>
                          </div>
                        </div>

                        {/* Stats Summary overview */}
                        <div className="flex items-center space-x-4">
                          <div className="text-right hidden xs:block">
                            <span className="text-[10px] font-medium text-neutral-textSecondary dark:text-neutral-400 block">Presents</span>
                            <span className="font-bold text-small text-neutral-textPrimary dark:text-white mt-0.5 block">{report.presentCount} / {report.presentCount + report.absentCount}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-caption font-bold px-2 py-0.5 rounded-badge ${pct >= 85 ? 'bg-emerald-50 text-success' :
                              pct >= 75 ? 'bg-amber-50 text-warning' : 'bg-red-50 text-danger'
                              }`}>
                              {pct}%
                            </span>
                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.15 }}
                              className="text-neutral-textSecondary"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </motion.div>
                          </div>
                        </div>
                      </div>

                      {/* Card Expanded Segment */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            className="overflow-hidden border-t border-neutral-border dark:border-neutral-700 bg-neutral-bg/30 dark:bg-neutral-900/30"
                          >
                            <div className="p-4 space-y-4 text-small">
                              {/* Grid columns of Present / Absentees */}
                              <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                                {/* Present Students */}
                                <div className="space-y-2">
                                  <span className="text-[10px] uppercase tracking-wider font-bold text-success block">Present ({report.presentCount})</span>
                                  {report.present.length === 0 ? (
                                    <span className="text-xs text-neutral-textSecondary dark:text-neutral-400 block italic">No students present</span>
                                  ) : (
                                    <div className="max-h-36 overflow-y-auto border border-neutral-border/60 dark:border-neutral-700/60 bg-white dark:bg-neutral-800 rounded-input divide-y divide-neutral-border/40 dark:divide-neutral-700/40 px-2.5 py-1">
                                      {report.present.map((name, i) => (
                                        <span key={i} className="block py-1.5 font-semibold text-neutral-textPrimary dark:text-white text-xs">{name}</span>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Absent Students */}
                                <div className="space-y-2">
                                  <span className="text-[10px] uppercase tracking-wider font-bold text-danger block">Absent ({report.absentCount})</span>
                                  {report.absent.length === 0 ? (
                                    <span className="text-xs text-neutral-textSecondary dark:text-neutral-400 block italic">No students absent</span>
                                  ) : (
                                    <div className="max-h-36 overflow-y-auto border border-neutral-border/60 dark:border-neutral-700/60 bg-white dark:bg-neutral-800 rounded-input divide-y divide-neutral-border/40 dark:divide-neutral-700/40 px-2.5 py-1">
                                      {report.absent.map((name, i) => (
                                        <span key={i} className="block py-1.5 font-semibold text-neutral-textPrimary dark:text-white text-xs">{name}</span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Card Actions drawer footer */}
                              <div className="flex space-x-2 pt-3 border-t border-neutral-border/50">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="flex-1 py-1.5 text-xs text-primary"
                                  onClick={(e) => handleEditClick(e, report.dateStr)}
                                  icon={Edit}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  className="flex-1 py-1.5 text-xs"
                                  onClick={() => handleShareAsImage(report)}
                                  icon={Share2}
                                  loading={isSharing}
                                >
                                  Share
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="flex-1 py-1.5 text-xs text-danger hover:bg-red-50"
                                  onClick={(e) => handleDeleteClick(e, report.dateStr)}
                                  icon={Trash2}
                                >
                                  Delete
                                </Button>
                              </div>
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

      {/* Delete Confirmation Alert Modal */}
      <Dialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDateToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Attendance Records"
        description={dateToDelete ? `Are you sure you want to delete all class attendance logs for ${formatDisplayDate(dateToDelete)}? This action is permanent and cannot be undone.` : ''}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
      />
    </motion.div>
  );
};
