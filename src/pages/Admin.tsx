import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  MoreVertical,
  Edit2,
  KeyRound,
  Mail,
  Trash2,
  Users,
  Shield,
  MapPin,
  Calendar,
  Building,
  Eye,
  EyeOff
} from 'lucide-react';
import { supabase } from '@/supabase/supabase';
import { useAuth } from '@/features/auth/AuthContext';
import { useToast } from '@/components/ui/Toast';
import {
  Button,
  SearchBar,
  Skeleton,
  EmptyState,
  ErrorState
} from '@/components/ui/CoreUI';
import { Input } from '@/components/ui/FormComponents';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Dialog } from '@/components/ui/Dialog';

// ==========================================
// TYPES
// ==========================================
interface OrgAdminData {
  organization_id: string;
  organization_name: string;
  place: string | null;
  admin_phone: string | null;
  created_at: string;
  admin_id: string | null;
  admin_name: string | null;
  admin_email: string | null;
  total_students: number;
}

export const Admin: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Org for actions
  const [selectedOrg, setSelectedOrg] = useState<OrgAdminData | null>(null);

  // Sheets Open State
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isEmailSheetOpen, setIsEmailSheetOpen] = useState(false);
  const [isPasswordSheetOpen, setIsPasswordSheetOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Add Org Form State
  const [addName, setAddName] = useState('');
  const [addPlace, setAddPlace] = useState('');
  const [addAdminName, setAddAdminName] = useState('');
  const [addAdminEmail, setAddAdminEmail] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});

  // Edit Org Form State
  const [editName, setEditName] = useState('');
  const [editPlace, setEditPlace] = useState('');
  const [editAdminName, setEditAdminName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  // Change Email Form State
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  // Reset Password Form State
  const [newPassword, setNewPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // ==========================================
  // QUERIES & MUTATIONS
  // ==========================================

  // Query: Get all organizations with their admin details and student counts
  const {
    data: organizations = [],
    isLoading: isListLoading,
    error: listError,
    refetch: refetchList
  } = useQuery<OrgAdminData[], Error>({
    queryKey: ['admin_organizations'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('admin_get_organizations');
      if (error) {
        console.error('[Supabase RPC Error]:', error);
        throw new Error(error.message || 'Database RPC function failure');
      }
      return (data || []) as OrgAdminData[];
    },
    enabled: profile?.role === 'super_admin'
  });

  // Mutation: Create Organization
  const createOrgMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { data, error } = await (supabase as any).rpc('admin_create_organization', {
        org_name: payload.name.trim(),
        org_place: payload.place.trim(),
        admin_name: payload.adminName.trim(),
        admin_email: payload.adminEmail.trim().toLowerCase(),
        admin_phone: payload.phone.trim(),
        temp_password: payload.password
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_organizations'] });
      toast('Organization created successfully!', 'success');
      setIsAddSheetOpen(false);
      // Reset form
      setAddName('');
      setAddPlace('');
      setAddAdminName('');
      setAddAdminEmail('');
      setAddPhone('');
      setAddPassword('');
      setAddErrors({});
    },
    onError: (err: any) => {
      toast(`Failed to create organization: ${err.message}`, 'error');
    }
  });

  // Mutation: Edit Organization
  const editOrgMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { data, error } = await (supabase as any).rpc('admin_edit_organization', {
        org_id: payload.id,
        org_name: payload.name.trim(),
        org_place: payload.place.trim(),
        admin_name: payload.adminName.trim(),
        admin_phone: payload.phone.trim()
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_organizations'] });
      toast('Organization details updated.', 'success');
      setIsEditSheetOpen(false);
      setSelectedOrg(null);
    },
    onError: (err: any) => {
      toast(`Failed to update details: ${err.message}`, 'error');
    }
  });

  // Mutation: Change Admin Email
  const changeEmailMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { data, error } = await (supabase as any).rpc('admin_change_user_email', {
        admin_user_id: payload.userId,
        new_email: payload.email.trim().toLowerCase()
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_organizations'] });
      toast('Admin email updated successfully.', 'success');
      setIsEmailSheetOpen(false);
      setSelectedOrg(null);
    },
    onError: (err: any) => {
      toast(`Failed to update email: ${err.message}`, 'error');
    }
  });

  // Mutation: Reset Admin Password
  const resetPasswordMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { data, error } = await (supabase as any).rpc('admin_reset_user_password', {
        admin_user_id: payload.userId,
        new_password: payload.password
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast('Admin password has been reset.', 'success');
      setIsPasswordSheetOpen(false);
      setSelectedOrg(null);
    },
    onError: (err: any) => {
      toast(`Password reset failed: ${err.message}`, 'error');
    }
  });

  // Mutation: Delete Organization
  const deleteOrgMutation = useMutation({
    mutationFn: async (orgId: string) => {
      const { data, error } = await (supabase as any).rpc('admin_delete_organization', {
        org_id: orgId
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_organizations'] });
      toast('Organization deleted successfully.', 'success');
      setIsDeleteDialogOpen(false);
      setSelectedOrg(null);
    },
    onError: (err: any) => {
      toast(`Failed to delete organization: ${err.message}`, 'error');
    }
  });

  // ==========================================
  // SEARCH, FILTER, SORT & STATISTICS
  // ==========================================
  const filteredOrgs = useMemo(() => {
    let list = [...organizations];

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (o) =>
          o.organization_name.toLowerCase().includes(q) ||
          (o.place && o.place.toLowerCase().includes(q)) ||
          (o.admin_name && o.admin_name.toLowerCase().includes(q)) ||
          (o.admin_email && o.admin_email.toLowerCase().includes(q))
      );
    }

    // Sort Alphabetically by Organization Name
    list.sort((a, b) => a.organization_name.localeCompare(b.organization_name));

    return list;
  }, [organizations, searchQuery]);

  // Global Statistics: Total Student Count across all organizations
  const globalStudentCount = useMemo(() => {
    return organizations.reduce((acc, current) => acc + (current.total_students || 0), 0);
  }, [organizations]);

  // Helper date formatter
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return '—';
    }
  };

  // ==========================================
  // EVENT HANDLERS
  // ==========================================
  const handleOpenMoreMenu = (org: OrgAdminData) => {
    setSelectedOrg(org);
    setIsMoreMenuOpen(true);
  };

  const handleStartEdit = () => {
    if (!selectedOrg) return;
    setEditName(selectedOrg.organization_name);
    setEditPlace(selectedOrg.place || '');
    setEditAdminName(selectedOrg.admin_name || '');
    setEditPhone(selectedOrg.admin_phone || '');
    setEditErrors({});
    setIsMoreMenuOpen(false);
    setIsEditSheetOpen(true);
  };

  const handleStartEmailChange = () => {
    if (!selectedOrg) return;
    setNewEmail(selectedOrg.admin_email || '');
    setEmailError('');
    setIsMoreMenuOpen(false);
    setIsEmailSheetOpen(true);
  };

  const handleStartPasswordReset = () => {
    if (!selectedOrg) return;
    setNewPassword('');
    setPasswordError('');
    setIsMoreMenuOpen(false);
    setIsPasswordSheetOpen(true);
  };

  const handleStartDelete = () => {
    setIsMoreMenuOpen(false);
    setIsDeleteDialogOpen(true);
  };

  // Validators
  const validateAddOrg = (): boolean => {
    const errors: Record<string, string> = {};
    if (!addName.trim()) errors.name = 'Organization Name is required';
    if (!addPlace.trim()) errors.place = 'Place is required';
    if (!addAdminName.trim()) errors.adminName = 'Admin Name is required';
    if (!addAdminEmail.trim() || !/\S+@\S+\.\S+/.test(addAdminEmail)) {
      errors.adminEmail = 'Provide a valid email address';
    }
    if (!addPassword || addPassword.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    setAddErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateEditOrg = (): boolean => {
    const errors: Record<string, string> = {};
    if (!editName.trim()) errors.name = 'Organization Name is required';
    if (!editPlace.trim()) errors.place = 'Place is required';
    if (!editAdminName.trim()) errors.adminName = 'Admin Name is required';
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Triggers
  const handleSaveNewOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAddOrg()) return;
    createOrgMutation.mutate({
      name: addName,
      place: addPlace,
      adminName: addAdminName,
      adminEmail: addAdminEmail,
      phone: addPhone,
      password: addPassword
    });
  };

  const handleSaveEditOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEditOrg() || !selectedOrg) return;
    editOrgMutation.mutate({
      id: selectedOrg.organization_id,
      name: editName,
      place: editPlace,
      adminName: editAdminName,
      phone: editPhone
    });
  };

  const handleSaveEmailChange = (e: React.FormEvent) => {
    e.preventDefault();
    const email = newEmail.trim();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Provide a valid email address');
      return;
    }
    if (!selectedOrg || !selectedOrg.admin_id) {
      toast('Admin account could not be resolved.', 'error');
      return;
    }
    changeEmailMutation.mutate({
      userId: selectedOrg.admin_id,
      email
    });
  };

  const handleSavePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    if (!selectedOrg || !selectedOrg.admin_id) {
      toast('Admin account could not be resolved.', 'error');
      return;
    }
    resetPasswordMutation.mutate({
      userId: selectedOrg.admin_id,
      password: newPassword
    });
  };

  const handleConfirmDelete = () => {
    if (!selectedOrg) return;
    deleteOrgMutation.mutate(selectedOrg.organization_id);
  };

  // ==========================================
  // SECURITY ROLE ROUTE CHECK
  // ==========================================
  if (profile?.role !== 'super_admin') {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center text-center p-6 space-y-4 text-left">
        <Shield className="h-12 w-12 text-danger animate-pulse" />
        <h3 className="text-body-lg font-bold text-neutral-textPrimary dark:text-white">Access Restricted</h3>
        <p className="text-small text-neutral-textSecondary dark:text-neutral-400 max-w-xs">
          You do not have the super administrator permissions required to access this panel.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-left">
      {/* Title & App Bar Area */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-textPrimary dark:text-white">
          Organizations
        </h1>
        <p className="text-caption text-neutral-textSecondary dark:text-neutral-400">
          Global multi-tenant organization controller.
        </p>
      </div>

      {/* Statistics Block */}
      {!isListLoading && !listError && organizations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-3"
        >
          {/* Total Organizations */}
          <div className="rounded-card border border-neutral-border dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4 shadow-soft flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-btn bg-cyan-50 dark:bg-cyan-900/30 text-info">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-textSecondary dark:text-neutral-400 block">
                Organizations
              </span>
              <span className="text-h2 font-extrabold text-neutral-textPrimary dark:text-white leading-none">
                {organizations.length}
              </span>
            </div>
          </div>

          {/* Total Students */}
          <div className="rounded-card border border-neutral-border dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4 shadow-soft flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-btn bg-primary-soft dark:bg-primary/20 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-textSecondary dark:text-neutral-400 block">
                Total Students
              </span>
              <span className="text-h2 font-extrabold text-neutral-textPrimary dark:text-white leading-none">
                {globalStudentCount}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Primary Action Button */}
      <Button
        variant="primary"
        onClick={() => setIsAddSheetOpen(true)}
        className="w-full"
        icon={Plus}
      >
        Add Organization
      </Button>

      {/* Dynamic Search Box */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search organizations..."
      />

      {/* Loading State */}
      {isListLoading && (
        <div className="space-y-3">
          <Skeleton className="h-[120px] w-full" />
          <Skeleton className="h-[120px] w-full" />
          <Skeleton className="h-[120px] w-full" />
        </div>
      )}

      {/* Error State */}
      {listError && (
        <ErrorState
          description={listError.message || "Could not load organizations list. Check connection."}
          onRetry={refetchList}
        />
      )}

      {/* List Content */}
      {!isListLoading && !listError && (
        <>
          {/* Case A: Empty Database */}
          {organizations.length === 0 && (
            <EmptyState
              title="No Organizations Created"
              description="Click Add Organization to start registering educational centers."
              icon={Building}
              actionLabel="Add First Organization"
              onAction={() => setIsAddSheetOpen(true)}
            />
          )}

          {/* Case B: Search returns nothing */}
          {organizations.length > 0 && filteredOrgs.length === 0 && (
            <EmptyState
              title="No Matching Organizations"
              description="No tenant records matched your current query."
              actionLabel="Clear Search"
              onAction={() => setSearchQuery('')}
            />
          )}

          {/* Case C: Render Organization Cards */}
          {filteredOrgs.length > 0 && (
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {filteredOrgs.map((org) => (
                  <motion.div
                    key={org.organization_id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18, ease: 'easeInOut' }}
                    className="rounded-card border border-neutral-border dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4 shadow-soft flex flex-col space-y-3.5 relative"
                  >
                    {/* Header: Title and Menu */}
                    <div className="flex justify-between items-start pr-8">
                      <div className="space-y-1 pr-2">
                        <h3 className="font-bold text-body-lg text-neutral-textPrimary dark:text-white leading-tight">
                          {org.organization_name}
                        </h3>
                        <div className="flex items-center space-x-1.5 text-caption text-neutral-textSecondary dark:text-neutral-400">
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate max-w-[180px]">
                            {org.place || 'No location configured'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleOpenMoreMenu(org)}
                        className="absolute right-3.5 top-3.5 flex h-9 w-9 items-center justify-center rounded-btn text-neutral-textSecondary dark:text-neutral-400 hover:bg-neutral-bg dark:hover:bg-neutral-700 hover:text-neutral-textPrimary dark:hover:text-white transition-colors focus:outline-none"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Meta info tags */}
                    <div className="grid grid-cols-2 gap-3 text-caption border-t border-neutral-border dark:border-neutral-700 pt-3 text-left">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-neutral-textSecondary dark:text-neutral-400 block text-[10px] uppercase tracking-wider">
                          Admin Name
                        </span>
                        <span className="font-bold text-neutral-textPrimary dark:text-white">
                          {org.admin_name || 'N/A'}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-semibold text-neutral-textSecondary dark:text-neutral-400 block text-[10px] uppercase tracking-wider">
                          Admin Email
                        </span>
                        <span className="font-bold text-neutral-textPrimary dark:text-white truncate block max-w-[140px]" title={org.admin_email || ''}>
                          {org.admin_email || 'N/A'}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-semibold text-neutral-textSecondary dark:text-neutral-400 block text-[10px] uppercase tracking-wider">
                          Students
                        </span>
                        <span className="font-bold text-primary dark:text-primary-light">
                          {org.total_students} student{org.total_students === 1 ? '' : 's'}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-semibold text-neutral-textSecondary dark:text-neutral-400 block text-[10px] uppercase tracking-wider">
                          Created
                        </span>
                        <span className="font-bold text-neutral-textPrimary dark:text-white flex items-center space-x-1">
                          <Calendar className="h-3 w-3 inline flex-shrink-0" />
                          <span>{formatDate(org.created_at)}</span>
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      {/* ==========================================
          MORE ACTIONS MENU SHEET
      ========================================== */}
      <BottomSheet
        isOpen={isMoreMenuOpen}
        onClose={() => setIsMoreMenuOpen(false)}
        title="Organization Actions"
      >
        <div className="space-y-2.5 pt-1.5">
          <button
            onClick={handleStartEdit}
            className="flex w-full items-center space-x-3 rounded-btn border border-neutral-border dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4 text-small font-semibold text-neutral-textPrimary dark:text-white hover:bg-neutral-bg dark:hover:bg-neutral-700 transition-colors focus:outline-none"
          >
            <Edit2 className="h-4.5 w-4.5 text-primary" />
            <span>Edit Organization</span>
          </button>
          <button
            onClick={handleStartPasswordReset}
            className="flex w-full items-center space-x-3 rounded-btn border border-neutral-border dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4 text-small font-semibold text-neutral-textPrimary dark:text-white hover:bg-neutral-bg dark:hover:bg-neutral-700 transition-colors focus:outline-none"
          >
            <KeyRound className="h-4.5 w-4.5 text-amber-500" />
            <span>Reset Password</span>
          </button>
          <button
            onClick={handleStartEmailChange}
            className="flex w-full items-center space-x-3 rounded-btn border border-neutral-border dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4 text-small font-semibold text-neutral-textPrimary dark:text-white hover:bg-neutral-bg dark:hover:bg-neutral-700 transition-colors focus:outline-none"
          >
            <Mail className="h-4.5 w-4.5 text-info" />
            <span>Change Email</span>
          </button>
          <button
            onClick={handleStartDelete}
            className="flex w-full items-center space-x-3 rounded-btn border border-danger/20 bg-red-50/10 p-4 text-small font-semibold text-danger hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors focus:outline-none"
          >
            <Trash2 className="h-4.5 w-4.5" />
            <span>Delete Organization</span>
          </button>
          <Button
            variant="secondary"
            onClick={() => setIsMoreMenuOpen(false)}
            className="w-full mt-2"
          >
            Cancel
          </Button>
        </div>
      </BottomSheet>

      {/* ==========================================
          ADD ORGANIZATION BOTTOM SHEET
      ========================================== */}
      <BottomSheet
        isOpen={isAddSheetOpen}
        onClose={() => {
          setIsAddSheetOpen(false);
          setAddErrors({});
        }}
        title="Add Organization"
      >
        <form onSubmit={handleSaveNewOrg} className="space-y-4 pt-1.5 pb-safe-bottom">
          <Input
            label="Organization Name *"
            value={addName}
            onChange={(e) => setAddName(e.target.value)}
            placeholder="e.g. Noorul Huda Nattu Dars"
            error={addErrors.name}
            disabled={createOrgMutation.isPending}
          />
          <Input
            label="Place / Location *"
            value={addPlace}
            onChange={(e) => setAddPlace(e.target.value)}
            placeholder="e.g. Wandoor"
            error={addErrors.place}
            disabled={createOrgMutation.isPending}
          />
          <Input
            label="Admin Name *"
            value={addAdminName}
            onChange={(e) => setAddAdminName(e.target.value)}
            placeholder="e.g. Ahmed"
            error={addErrors.adminName}
            disabled={createOrgMutation.isPending}
          />
          <Input
            label="Admin Email *"
            type="email"
            value={addAdminEmail}
            onChange={(e) => setAddAdminEmail(e.target.value)}
            placeholder="e.g. admin@email.com"
            error={addErrors.adminEmail}
            disabled={createOrgMutation.isPending}
          />
          <Input
            label="Admin Phone Number"
            value={addPhone}
            onChange={(e) => setAddPhone(e.target.value)}
            placeholder="e.g. +919876543210"
            disabled={createOrgMutation.isPending}
          />
          <div className="relative">
            <Input
              label="Temporary Password *"
              type={showAddPassword ? 'text' : 'password'}
              value={addPassword}
              onChange={(e) => setAddPassword(e.target.value)}
              placeholder="Min. 8 characters"
              error={addErrors.password}
              disabled={createOrgMutation.isPending}
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowAddPassword(!showAddPassword)}
              disabled={createOrgMutation.isPending}
              className="absolute right-4 top-[38px] text-neutral-textSecondary dark:text-neutral-500 hover:text-neutral-textPrimary dark:hover:text-white focus:outline-none disabled:opacity-50"
              title={showAddPassword ? 'Hide password' : 'Show password'}
            >
              {showAddPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setIsAddSheetOpen(false)}
              disabled={createOrgMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              loading={createOrgMutation.isPending}
            >
              Create Organization
            </Button>
          </div>
        </form>
      </BottomSheet>

      {/* ==========================================
          EDIT ORGANIZATION BOTTOM SHEET
      ========================================== */}
      <BottomSheet
        isOpen={isEditSheetOpen}
        onClose={() => setIsEditSheetOpen(false)}
        title="Edit Organization"
      >
        <form onSubmit={handleSaveEditOrg} className="space-y-4 pt-1.5 pb-safe-bottom">
          <Input
            label="Organization Name *"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="e.g. Noorul Huda Nattu Dars"
            error={editErrors.name}
            disabled={editOrgMutation.isPending}
          />
          <Input
            label="Place / Location *"
            value={editPlace}
            onChange={(e) => setEditPlace(e.target.value)}
            placeholder="e.g. Wandoor"
            error={editErrors.place}
            disabled={editOrgMutation.isPending}
          />
          <Input
            label="Admin Name *"
            value={editAdminName}
            onChange={(e) => setEditAdminName(e.target.value)}
            placeholder="e.g. Ahmed"
            error={editErrors.adminName}
            disabled={editOrgMutation.isPending}
          />
          <Input
            label="Admin Phone Number"
            value={editPhone}
            onChange={(e) => setEditPhone(e.target.value)}
            placeholder="e.g. +919876543210"
            disabled={editOrgMutation.isPending}
          />
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setIsEditSheetOpen(false)}
              disabled={editOrgMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              loading={editOrgMutation.isPending}
            >
              Save Details
            </Button>
          </div>
        </form>
      </BottomSheet>

      {/* ==========================================
          CHANGE EMAIL BOTTOM SHEET
      ========================================== */}
      <BottomSheet
        isOpen={isEmailSheetOpen}
        onClose={() => setIsEmailSheetOpen(false)}
        title="Change Email Address"
      >
        <form onSubmit={handleSaveEmailChange} className="space-y-4 pt-1.5 pb-safe-bottom">
          <p className="text-small text-neutral-textSecondary dark:text-neutral-400">
            This will update the admin's credential email for both Authentication and Profile details.
          </p>
          <Input
            label="New Email Address *"
            type="email"
            value={newEmail}
            onChange={(e) => {
              setNewEmail(e.target.value);
              if (emailError) setEmailError('');
            }}
            placeholder="e.g. newadmin@email.com"
            error={emailError}
            disabled={changeEmailMutation.isPending}
          />
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setIsEmailSheetOpen(false)}
              disabled={changeEmailMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              loading={changeEmailMutation.isPending}
            >
              Update Email
            </Button>
          </div>
        </form>
      </BottomSheet>

      {/* ==========================================
          RESET PASSWORD BOTTOM SHEET
      ========================================== */}
      <BottomSheet
        isOpen={isPasswordSheetOpen}
        onClose={() => setIsPasswordSheetOpen(false)}
        title="Reset Password"
      >
        <form onSubmit={handleSavePasswordReset} className="space-y-4 pt-1.5 pb-safe-bottom">
          <p className="text-small text-neutral-textSecondary dark:text-neutral-400">
            This will immediately update the organization admin's password.
          </p>
          <div className="relative">
            <Input
              label="New Password *"
              type={showResetPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (passwordError) setPasswordError('');
              }}
              placeholder="Min. 8 characters"
              error={passwordError}
              disabled={resetPasswordMutation.isPending}
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowResetPassword(!showResetPassword)}
              disabled={resetPasswordMutation.isPending}
              className="absolute right-4 top-[38px] text-neutral-textSecondary dark:text-neutral-500 hover:text-neutral-textPrimary dark:hover:text-white focus:outline-none disabled:opacity-50"
              title={showResetPassword ? 'Hide password' : 'Show password'}
            >
              {showResetPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setIsPasswordSheetOpen(false)}
              disabled={resetPasswordMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              loading={resetPasswordMutation.isPending}
            >
              Reset Password
            </Button>
          </div>
        </form>
      </BottomSheet>

      {/* ==========================================
          DELETE ORGANIZATION CONFIRMATION DIALOG
      ========================================== */}
      <Dialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Organization?"
        description="This will permanently remove the organization, students, attendance records and admin account. This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
      />
    </div>
  );
};
