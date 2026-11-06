'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { StaffRole, StaffInvite } from '@/types';
import { ApiClient } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import {
  Users,
  UserPlus,
  Copy,
  CheckCircle2,
  Trash2,
  UserX,
  UserCheck,
  Shield,
  HelpCircle,
  AlertTriangle,
  Mail,
  ChevronDown,
  Edit2,
  Sliders,
} from 'lucide-react';

interface StaffMember {
  id: number;
  userId?: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  staffRole: StaffRole;
  permissions?: string[];
  isActive: boolean;
  createdAt: string;
}

export default function MerchantStaffPage() {
  const { t } = useI18n();
  const { storeId } = useAuth();

  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [invites, setInvites] = useState<StaffInvite[]>([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [assignedRole, setAssignedRole] = useState<StaffRole>('CASHIER');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [createdInvite, setCreatedInvite] = useState<StaffInvite | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<StaffMember | null>(null);

  // Edit Staff Modal State
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [editStaffRole, setEditStaffRole] = useState<StaffRole>('CASHIER');
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);

  useEffect(() => {
    loadStaff();
  }, [storeId]);

  const showFeedback = (msg: string, isErr = false) => {
    if (isErr) {
      setActionError(msg);
      setTimeout(() => setActionError(null), 4000);
    } else {
      setActionSuccess(msg);
      setTimeout(() => setActionSuccess(null), 3500);
    }
  };

  const loadStaff = () => {
    ApiClient.get('/staff')
      .then((res) => {
        if (res.success) {
          if (res.staff) {
            setStaffList(res.staff);
          }
          if (res.pendingInvites) {
            setInvites(res.pendingInvites);
          }
        }
      })
      .catch(() => {
        // Fallback demo staff
        setStaffList([
          {
            id: 211,
            name: 'Marcus Brody',
            email: 'cashier@urbantrend.com',
            role: 'STORE_STAFF',
            staffRole: 'CASHIER',
            isActive: true,
            createdAt: new Date().toISOString(),
          },
        ]);
      });
  };

  // Change Role
  const handleChangeRole = async (staffId: number, newRole: StaffRole) => {
    try {
      const res = await ApiClient.patch(`/staff/${staffId}/role`, { staffRole: newRole });
      if (res.success) {
        setStaffList((prev) =>
          prev.map((s) => (s.id === staffId ? { ...s, staffRole: newRole } : s))
        );
        showFeedback(res.message || `Role updated to ${newRole}`);
      }
    } catch (err: any) {
      showFeedback(err.message || 'Failed to update role', true);
    }
  };

  const handleOpenEditModal = (st: StaffMember) => {
    setEditingStaff(st);
    setEditStaffRole(st.staffRole || 'CASHIER');
    setEditPermissions(st.permissions || []);
  };

  const handleSavePermissions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    setIsSavingPermissions(true);
    try {
      const targetId = editingStaff.userId || editingStaff.id;
      const res = await ApiClient.patch(`/staff/${targetId}/permissions`, {
        staffRole: editStaffRole,
        permissions: editPermissions,
      });
      if (res.success || res.message) {
        setStaffList((prev) =>
          prev.map((s) =>
            s.id === editingStaff.id
              ? { ...s, staffRole: editStaffRole, permissions: editPermissions }
              : s
          )
        );
        showFeedback('Staff role and custom permissions updated successfully.');
        setEditingStaff(null);
      }
    } catch (err: any) {
      showFeedback(err.message || 'Failed to update staff permissions', true);
    } finally {
      setIsSavingPermissions(false);
    }
  };

  // Toggle Deactivate / Reactivate
  const handleToggleStatus = async (staff: StaffMember) => {
    const action = staff.isActive ? 'deactivate' : 'reactivate';
    if (!confirm(`Are you sure you want to ${action} ${staff.name}?`)) return;

    try {
      const res = await ApiClient.patch(`/staff/${staff.id}/toggle-status`, {});
      if (res.success) {
        setStaffList((prev) =>
          prev.map((s) => (s.id === staff.id ? { ...s, isActive: !s.isActive } : s))
        );
        showFeedback(res.message || `Staff member ${action}d successfully`);
      }
    } catch (err: any) {
      showFeedback(err.message || `Failed to ${action} staff member`, true);
    }
  };

  // Delete Staff Member
  const handleDeleteConfirmed = async () => {
    if (!deletingStaff) return;
    try {
      const res = await ApiClient.delete(`/staff/${deletingStaff.id}`);
      if (res.success) {
        setStaffList((prev) => prev.filter((s) => s.id !== deletingStaff.id));
        showFeedback(res.message || 'Staff member removed from store');
      }
    } catch (err: any) {
      showFeedback(err.message || 'Failed to remove staff member', true);
    } finally {
      setDeletingStaff(null);
    }
  };

  // Revoke Invite
  const handleRevokeInvite = async (inviteId: number) => {
    if (!confirm('Are you sure you want to revoke this pending invitation?')) return;
    try {
      const res = await ApiClient.delete(`/staff/${inviteId}`);
      if (res.success) {
        setInvites((prev) => prev.filter((i) => i.id !== inviteId));
        showFeedback(res.message || 'Invite revoked');
      }
    } catch (err: any) {
      showFeedback(err.message || 'Failed to revoke invite', true);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await ApiClient.post('/staff/invite', {
        email,
        assignedRole,
        permissions: selectedPermissions,
      });
      if (res.success && res.invite) {
        setCreatedInvite(res.invite);
        setInvites((prev) => [...prev, res.invite]);
        showFeedback('Staff invitation created successfully!');
      }
    } catch (e: any) {
      showFeedback(e.message || 'Failed to generate invite', true);
    } finally {
      setIsLoading(false);
    }
  };

  const copyInviteLink = (code: string) => {
    const url = `${window.location.origin}/staff/accept?code=${code}`;
    navigator.clipboard.writeText(url);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('merchant.staff')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your team members: change roles, toggle active status, or remove access.
          </p>
        </div>

        <Button
          size="sm"
          leftIcon={<UserPlus className="w-4 h-4" />}
          onClick={() => {
            setCreatedInvite(null);
            setEmail('');
            setIsInviteModalOpen(true);
          }}
        >
          {t('merchant.inviteStaff')}
        </Button>
      </div>

      {/* Action Notifications */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-500/30 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Staff Table */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-brand-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Active Team Members ({staffList.length})
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-850 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Staff Member</th>
                <th className="px-6 py-3.5">Assigned Role</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Member Since</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {staffList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    No staff members assigned to this store yet. Click &quot;Invite Staff Member&quot; above to add someone.
                  </td>
                </tr>
              ) : (
                staffList.map((st) => (
                  <tr
                    key={st.id}
                    className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors ${
                      !st.isActive ? 'opacity-65 bg-slate-50/30 dark:bg-slate-900/40' : ''
                    }`}
                  >
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 font-bold flex items-center justify-center shrink-0">
                        {st.name?.[0] || 'S'}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {st.name}
                        </span>
                        <span className="text-slate-400 text-[11px]">{st.email}</span>
                      </div>
                    </td>

                    {/* Assigned Role & Permissions */}
                    <td className="px-6 py-4">
                      <div className="space-y-1.5">
                        <div className="relative inline-block">
                          <select
                            value={st.staffRole || 'CASHIER'}
                            onChange={(e) => handleChangeRole(st.id, e.target.value as StaffRole)}
                            className="px-2.5 py-1.5 pr-7 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer appearance-none shadow-sm"
                          >
                            <option value="CASHIER">CASHIER (POS Only)</option>
                            <option value="MANAGER">MANAGER (Full POS & Orders)</option>
                            <option value="INVENTORY_CLERK">INVENTORY CLERK (Stock)</option>
                            <option value="ACCOUNTANT">ACCOUNTANT (Finance & Invoices)</option>
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        {st.permissions && st.permissions.length > 0 && (
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {st.permissions.map((p) => (
                              <span
                                key={p}
                                className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20"
                              >
                                {p.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      {st.isActive !== false ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          Deactivated
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {formatDate(st.createdAt)}
                    </td>

                    {/* Actions: Edit Permissions + Deactivate/Reactivate + Delete */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(st)}
                          title="Edit role and custom permission overrides"
                          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-brand-500 text-xs font-bold transition-all"
                        >
                          <Sliders className="w-4 h-4 text-brand-500" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(st)}
                          title={st.isActive !== false ? 'Deactivate staff member' : 'Reactivate staff member'}
                          className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                            st.isActive !== false
                              ? 'border-amber-200 dark:border-amber-800 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50'
                              : 'border-emerald-200 dark:border-emerald-800 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                          }`}
                        >
                          {st.isActive !== false ? (
                            <UserX className="w-4 h-4" />
                          ) : (
                            <UserCheck className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeletingStaff(st)}
                          title="Remove staff member from store"
                          className="p-2 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Invites Table (if any) */}
      {invites.length > 0 && (
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Pending Invitations ({invites.length})
            </h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {invites.map((inv) => (
              <div key={inv.id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{inv.email}</span>
                    <span className="text-slate-400 text-[11px]">
                      Role: {inv.assignedRole} &bull; Code:{' '}
                      <code className="font-mono text-brand-600 dark:text-brand-400">{inv.inviteCode}</code>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => copyInviteLink(inv.inviteCode)}
                    leftIcon={<Copy className="w-3.5 h-3.5" />}
                  >
                    Copy Link
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    onClick={() => handleRevokeInvite(inv.id)}
                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    Revoke
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingStaff}
        onClose={() => setDeletingStaff(null)}
        title="Remove Staff Member"
        description="Are you sure you want to remove this employee from your store?"
      >
        <div className="space-y-4 pt-2">
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200 space-y-1">
            <p className="font-bold">
              Removing: {deletingStaff?.name} ({deletingStaff?.email})
            </p>
            <p>
              This user will lose access to your store POS, orders, and merchant center immediately.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setDeletingStaff(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteConfirmed}>
              Yes, Remove Staff
            </Button>
          </div>
        </div>
      </Modal>

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite New Staff Member"
        description="Generate an invite code and send it to your team member."
      >
        {createdInvite ? (
          <div className="space-y-4 pt-2 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Invitation Code Generated!
            </h4>
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-300">
                Invite Code
              </span>
              <p className="text-2xl font-mono font-black text-amber-600 tracking-widest">
                {createdInvite.inviteCode}
              </p>
              <p className="text-[11px] text-slate-500">Role: {createdInvite.assignedRole}</p>
            </div>

            <Button
              size="md"
              className="w-full"
              leftIcon={<Copy className="w-4 h-4" />}
              onClick={() => copyInviteLink(createdInvite.inviteCode)}
            >
              {copiedCode ? 'Invitation Link Copied!' : 'Copy Invitation Link'}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSendInvite} className="space-y-4 pt-2">
            <Input
              label="Staff Member Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cashier@yourstore.com"
              required
            />

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                Role & Permissions
              </label>
              <select
                value={assignedRole}
                onChange={(e) => setAssignedRole(e.target.value as StaffRole)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                <option value="CASHIER">CASHIER - Point of Sale (POS) Access</option>
                <option value="MANAGER">MANAGER - Orders, Inventory & POS</option>
                <option value="INVENTORY_CLERK">INVENTORY_CLERK - Stock & Catalog Only</option>
                <option value="ACCOUNTANT">ACCOUNTANT - Finance, Invoices & Reports</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                Custom Permission Overrides (Optional)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { key: 'manage_inventory', label: 'Manage Inventory & Stock' },
                  { key: 'process_pos', label: 'Process POS & Sales' },
                  { key: 'view_finance', label: 'View Financial Reports' },
                  { key: 'export_reports', label: 'Export Analytics Reports' },
                  { key: 'view_invoices', label: 'View Invoices & Billing' },
                ].map((perm) => {
                  const checked = selectedPermissions.includes(perm.key);
                  return (
                    <label
                      key={perm.key}
                      className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-colors ${
                        checked
                          ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 text-brand-900 dark:text-brand-200 font-bold'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPermissions((prev) => [...prev, perm.key]);
                          } else {
                            setSelectedPermissions((prev) => prev.filter((k) => k !== perm.key));
                          }
                        }}
                        className="rounded text-brand-600 focus:ring-brand-500"
                      />
                      <span>{perm.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <Button type="submit" size="lg" isLoading={isLoading} className="w-full">
              Generate Invite Code
            </Button>
          </form>
        )}
      </Modal>

      {/* Edit Staff Permissions & Role Modal */}
      <Modal
        isOpen={!!editingStaff}
        onClose={() => setEditingStaff(null)}
        title="Edit Staff Role & Permissions"
        description={`Customize access levels and permission overrides for ${editingStaff?.name}.`}
      >
        <form onSubmit={handleSavePermissions} className="space-y-4 pt-2">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold flex items-center justify-center shrink-0">
              {editingStaff?.name?.[0] || 'S'}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">{editingStaff?.name}</p>
              <p className="text-[11px] text-slate-400">{editingStaff?.email}</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
              Assigned Staff Role
            </label>
            <select
              value={editStaffRole}
              onChange={(e) => setEditStaffRole(e.target.value as StaffRole)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-xs font-bold text-slate-800 dark:text-slate-200"
            >
              <option value="CASHIER">CASHIER - Point of Sale (POS) Access</option>
              <option value="MANAGER">MANAGER - Orders, Inventory & POS</option>
              <option value="INVENTORY_CLERK">INVENTORY CLERK - Stock & Catalog Only</option>
              <option value="ACCOUNTANT">ACCOUNTANT - Finance, Invoices & Reports</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
              Custom Permission Overrides
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                { key: 'manage_inventory', label: 'Manage Inventory & Stock' },
                { key: 'process_pos', label: 'Process POS & Sales' },
                { key: 'view_finance', label: 'View Financial Reports' },
                { key: 'export_reports', label: 'Export Analytics Reports' },
                { key: 'view_invoices', label: 'View Invoices & Billing' },
              ].map((perm) => {
                const checked = editPermissions.includes(perm.key);
                return (
                  <label
                    key={perm.key}
                    className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-colors ${
                      checked
                        ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 text-brand-900 dark:text-brand-200 font-bold'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditPermissions((prev) => [...prev, perm.key]);
                        } else {
                          setEditPermissions((prev) => prev.filter((k) => k !== perm.key));
                        }
                      }}
                      className="rounded text-brand-600 focus:ring-brand-500"
                    />
                    <span>{perm.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditingStaff(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isSavingPermissions}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
