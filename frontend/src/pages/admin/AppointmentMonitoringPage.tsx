import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/services';
import { Badge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Appointment } from '../../types';

export const AppointmentMonitoringPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-appointments', statusFilter],
    queryFn: () => adminApi.getAllAppointments({
      status: statusFilter || undefined
    })
  });

  const appointments: Appointment[] = data?.appointments || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '6px' }}>
          Platform Appointment Monitoring
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Audit active bookings, review status history, track platform commission revenue and doctor payouts.
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', flexWrap: 'wrap' }}>
        {['', 'BOOKED', 'IN_PROGRESS', 'COMPLETED', 'NO_SHOW', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.85rem',
              background: statusFilter === st ? 'var(--primary-light)' : 'transparent',
              color: statusFilter === st ? 'var(--primary)' : 'var(--text-muted)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {st ? st.replace('_', ' ') : 'All Statuses'}
          </button>
        ))}
      </div>

      {/* Appointments Table */}
      <div className="card" style={{ padding: '24px' }}>
        {isLoading ? (
          <LoadingSkeleton height="260px" />
        ) : appointments.length === 0 ? (
          <EmptyState title="No Appointments Found" description="There are no appointments matching this status filter." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Appt #</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Scheduled Date & Time</th>
                  <th>Doctor Fee</th>
                  <th>Platform Fee</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a: Appointment) => (
                  <tr key={a.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{a.appointmentNumber}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{a.patient.username}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{a.patient.email}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{a.doctor.user?.username}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>{a.doctor.specialization}</div>
                    </td>
                    <td>
                      <div>{new Date(a.scheduledDate).toLocaleDateString()}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{a.startTime} - {a.endTime}</div>
                    </td>
                    <td style={{ fontSize: '0.9rem' }}>₹{Number(a.doctorFee).toFixed(0)}</td>
                    <td style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600 }}>₹{Number(a.commissionAmount).toFixed(0)}</td>
                    <td style={{ fontSize: '0.95rem', fontWeight: 700 }}>₹{Number(a.totalAmount).toFixed(0)}</td>
                    <td>
                      <Badge status={a.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
