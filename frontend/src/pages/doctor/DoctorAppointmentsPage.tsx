import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import { Calendar, Clock, Play, UserX, FileText } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Link } from 'react-router-dom';
import { Appointment } from '../../types';

export const DoctorAppointmentsPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ['doctor-all-appointments', statusFilter],
    queryFn: () => appointmentApi.getDoctorAppointments({
      status: statusFilter === 'ALL' ? undefined : statusFilter
    })
  });

  const updateStatusMutation = useMutation({
    mutationFn: (data: { id: number; status: string }) =>
      appointmentApi.updateStatus(data.id, data.status),
    onSuccess: (_, vars) => {
      addToast(`Appointment marked as ${vars.status}.`, 'info');
      queryClient.invalidateQueries({ queryKey: ['doctor-all-appointments'] });
    },
    onError: (err: any) => {
      addToast(err.response?.data?.message || 'Failed to update appointment status.', 'error');
    }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '6px' }}>
          Consultation Queue & Appointments
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Review scheduled patients, initiate digital consultations, and view clinical histories.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', flexWrap: 'wrap' }}>
        {
          ['ALL', 'BOOKED', 'IN_PROGRESS', 'COMPLETED', 'NO_SHOW', 'CANCELLED'].map((st) => (
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
              {st.replace('_', ' ')}
            </button>
          ))
        }
      </div>

      {
        isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <LoadingSkeleton height="140px" />
            <LoadingSkeleton height="140px" />
          </div>
        ) : appointments.length === 0 ? (
          <EmptyState title="No Appointments Found" description="There are no appointments matching this status filter." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {
              appointments.map((appt: Appointment) => (
                <div key={appt.id} className="card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{appt.patient.username}</h3>
                        <Badge status={appt.status} />
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Phone: {appt.patient.phone || 'N/A'} • Email: {appt.patient.email}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Appt Ref</div>
                      <div style={{ fontFamily: 'monospace', fontWeight: 700 }}>{appt.appointmentNumber}</div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '24px',
                    background: 'var(--bg-secondary)',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    marginBottom: '16px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={16} style={{ color: 'var(--primary)' }} />
                      <span>{new Date(appt.scheduledDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={16} style={{ color: 'var(--primary)' }} />
                      <span>{appt.startTime} - {appt.endTime}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Intake Notes: </span>
                      <span style={{ fontStyle: 'italic' }}>{appt.notes || 'None noted'}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', alignItems: 'center' }}>
                    {
                      appt.status === 'BOOKED' && (
                        <>
                          <button
                            onClick={() => updateStatusMutation.mutate({ id: appt.id, status: 'NO_SHOW' })}
                            className="btn btn-secondary btn-sm"
                            style={{ color: 'var(--warning)' }}
                          >
                            <UserX size={14} /> Mark No-Show
                          </button>
                          <Link
                            to={`/doctor/consultations/${appt.id}`}
                            className="btn btn-primary btn-sm"
                          >
                            <Play size={14} /> Start Consultation
                          </Link>
                        </>
                      )}

                    {
                      appt.status === 'IN_PROGRESS' && (
                        <Link
                          to={`/doctor/consultations/${appt.id}`}
                          className="btn btn-primary btn-sm"
                        >
                          <Play size={14} /> Resume Session & Prescribe
                        </Link>
                      )
                    }

                    {
                      appt.status === 'COMPLETED' && appt.prescription && (
                        <div style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FileText size={16} /> Prescription Issued
                        </div>
                      )
                    }
                  </div>
                </div>
              ))
            }
          </div>
        )
      }
    </div>
  );
};
