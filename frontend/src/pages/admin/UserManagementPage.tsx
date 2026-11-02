import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import { Search, UserCheck, UserX } from 'lucide-react';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { User } from '../../types';

export const UserManagementPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, roleFilter],
    queryFn: () => adminApi.getAllUsers({
      search: search || undefined,
      role: roleFilter || undefined
    })
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (userId: number) => adminApi.toggleUserActive(userId),
    onSuccess: (res: any) => {
      addToast(res.message, 'success');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err: any) => {
      addToast(err.response?.data?.message || 'Failed to toggle user status.', 'error');
    }
  });

  const users: User[] = data?.users || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '6px' }}>User Management</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Monitor registered accounts, inspect doctor profiles, and control active login permissions.
        </p>
      </div>

      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search user name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '40px' }}
            />
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Account Roles</option>
              <option value="USER">Patients Only</option>
              <option value="DOCTOR">Doctors Only</option>
              <option value="ADMIN">Admins Only</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        {
          isLoading ? (
            <LoadingSkeleton height="260px" />
          ) : users.length === 0 ? (
            <EmptyState title="No Users Found" description="No accounts matched your search criteria." />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>User Details</th>
                    <th>Role</th>
                    <th>Contact Info</th>
                    <th>Account Status</th>
                    <th>Joined Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    users.map((u: User) => (
                      <tr key={u.id}>
                        <td>
                          <div style={{ fontWeight: 700 }}>{u.username}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
                        </td>
                        <td>
                          <span className={`badge ${u.role === 'ADMIN' ? 'badge-primary' :
                              u.role === 'DOCTOR' ? 'badge-info' : 'badge-secondary'
                            }`}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.85rem' }}>{u.phone || 'No phone provided'}</div>
                        </td>
                        <td>
                          {
                            u.isActive ? (
                              <span className="badge badge-success">Active</span>
                            ) : (
                              <span className="badge badge-danger">Deactivated</span>
                            )
                          }
                        </td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          {
                            u.role !== 'ADMIN' && (
                              <button
                                onClick={() => toggleActiveMutation.mutate(u.id)}
                                disabled={toggleActiveMutation.isPending}
                                className={`btn btn-sm ${u.isActive ? 'btn-secondary' : 'btn-primary'}`}
                                style={{
                                  fontSize: '0.8rem',
                                  color: u.isActive ? 'var(--danger)' : undefined
                                }}
                              >
                                {
                                  u.isActive ? (
                                    <>
                                      <UserX size={14} /> Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck size={14} /> Activate
                                    </>
                                  )
                                }
                              </button>
                            )
                          }
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          )
        }
      </div>
    </div>
  );
};
