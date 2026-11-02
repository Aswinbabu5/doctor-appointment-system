import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentApi, availabilityApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import { Calendar, Clock, RefreshCw, XCircle, FileText, AlertTriangle } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Appointment, AvailabilitySlot } from '../../types';
import { Link } from 'react-router-dom';

export const MyAppointmentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED'>('UPCOMING');
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedNewSlotId, setSelectedNewSlotId] = useState<number | null>(null);

  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ['patient-appointments'],
    queryFn: () => appointmentApi.getPatientAppointments()
  });

  // Doctor slots for rescheduling
  const { data: doctorSlots = [], isLoading: loadingSlots } = useQuery<AvailabilitySlot[]>({
    queryKey: ['doctor-reschedule-slots', selectedAppt?.doctorId],
    queryFn: () => availabilityApi.getDoctorSlots(selectedAppt!.doctorId, { availableOnly: true }),
    enabled: !!selectedAppt && rescheduleModalOpen
  });

  // Reschedule Mutation
  const rescheduleMutation = useMutation({
    mutationFn: (data: { id: number; newSlotId: number }) =>
      appointmentApi.rescheduleAppointment(data.id, data.newSlotId),
    onSuccess: () => {
      addToast('Appointment rescheduled successfully!', 'success');
      setRescheduleModalOpen(false);
      setSelectedNewSlotId(null);
      queryClient.invalidateQueries({ queryKey: ['patient-appointments'] });
    },
    onError: (err: any) => {
      addToast(err.response?.data?.message || 'Failed to reschedule appointment.', 'error');
    }
  });

  // Cancel Mutation
  const cancelMutation = useMutation({
    mutationFn: (data: { id: number; reason: string }) =>
      appointmentApi.cancelAppointment(data.id, data.reason),
    onSuccess: () => {
      addToast('Appointment cancelled successfully.', 'info');
      setCancelModalOpen(false);
      setCancelReason('');
      queryClient.invalidateQueries({ queryKey: ['patient-appointments'] });
    },
    onError: (err: any) => {
      addToast(err.response?.data?.message || 'Failed to cancel appointment.', 'error');
    }
  });

  const filteredAppointments = appointments.filter((a: Appointment) => {
    if (activeTab === 'UPCOMING') return a.status === 'BOOKED' || a.status === 'IN_PROGRESS';
    if (activeTab === 'COMPLETED') return a.status === 'COMPLETED';
    if (activeTab === 'CANCELLED') return a.status === 'CANCELLED' || a.status === 'NO_SHOW';
    return true;
  });

  const handleOpenReschedule = (appt: Appointment) => {
    setSelectedAppt(appt);
    setSelectedNewSlotId(null);
    setRescheduleModalOpen(true);
  };

  const handleOpenCancel = (appt: Appointment) => {
    setSelectedAppt(appt);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  const handleConfirmReschedule = () => {
    if (!selectedAppt || !selectedNewSlotId) return;
    rescheduleMutation.mutate({
      id: selectedAppt.id,
      newSlotId: selectedNewSlotId
    });
  };

  const handleConfirmCancel = () => {
    if (!selectedAppt) return;
    if (!cancelReason.trim()) {
      addToast('Please provide a reason for cancellation.', 'error');
      return;
    }
    cancelMutation.mutate({
      id: selectedAppt.id,
      reason: cancelReason
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '6px' }}>My Consultations</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Track past and upcoming doctor consultations, reschedule slots, or download digital prescriptions.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
        {(['UPCOMING', 'COMPLETED', 'CANCELLED', 'ALL'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.875rem',
              background: activeTab === tab ? 'var(--primary-light)' : 'transparent',
              color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <LoadingSkeleton height="120px" />
          <LoadingSkeleton height="120px" />
        </div>
      ) : filteredAppointments.length === 0 ? (
        <EmptyState
          title="No Appointments Found"
          description={`You do not have any consultations in the ${activeTab.toLowerCase()} category.`}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredAppointments.map((appt: Appointment) => {
            const isBooked = appt.status === 'BOOKED';
            const scheduledMs = new Date(appt.scheduledTimestamp).getTime();
            const now = Date.now();
            const hoursLeft = (scheduledMs - now) / (1000 * 60 * 60);
            const canModify = isBooked && hoursLeft >= 24;

            return (
              <div key={appt.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{appt.doctor.user?.username}</h3>
                      <Badge status={appt.status} />
                    </div>
                    <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem' }}>
                      {appt.doctor.specialization}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Appt Number</div>
                    <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.95rem' }}>{appt.appointmentNumber}</div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '24px',
                  background: 'var(--bg-secondary)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem'
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
                    <span style={{ color: 'var(--text-muted)' }}>Fee Paid: </span>
                    <strong style={{ color: 'var(--text-main)' }}>₹{Number(appt.totalAmount).toFixed(0)}</strong>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {isBooked && !canModify && (
                      <span style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertTriangle size={14} /> Rescheduling/cancellation locked (under 24h cutoff)
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {appt.prescription && (
                      <Link to="/patient/prescriptions" className="btn btn-secondary btn-sm">
                        <FileText size={14} /> View Prescription
                      </Link>
                    )}

                    {canModify && (
                      <>
                        <button
                          onClick={() => handleOpenReschedule(appt)}
                          className="btn btn-outline btn-sm"
                        >
                          <RefreshCw size={14} /> Reschedule
                        </button>
                        <button
                          onClick={() => handleOpenCancel(appt)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--danger)' }}
                        >
                          <XCircle size={14} /> Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reschedule Modal */}
      <Modal
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        title="Reschedule Consultation"
        maxWidth="500px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Select a new available time slot with Dr. {selectedAppt?.doctor.user?.username}. Your existing slot will be automatically released.
          </p>

          {loadingSlots ? (
            <LoadingSkeleton height="120px" />
          ) : doctorSlots.length === 0 ? (
            <EmptyState title="No Available Slots" description="There are no alternate slots available for this doctor right now." />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
              {doctorSlots.map((slot: AvailabilitySlot) => {
                const isSelected = selectedNewSlotId === slot.id;
                return (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedNewSlotId(slot.id)}
                    className="btn"
                    style={{
                      background: isSelected ? 'var(--primary)' : 'var(--bg-secondary)',
                      color: isSelected ? '#ffffff' : 'var(--text-main)',
                      border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)',
                      padding: '8px',
                      fontSize: '0.8rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px'
                    }}
                  >
                    <span>{new Date(slot.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    <strong>{slot.startTime}</strong>
                  </button>
                );
              })}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button
              onClick={() => setRescheduleModalOpen(false)}
              className="btn btn-secondary"
              disabled={rescheduleMutation.isPending}
            >
              Close
            </button>
            <button
              onClick={handleConfirmReschedule}
              className="btn btn-primary"
              disabled={!selectedNewSlotId || rescheduleMutation.isPending}
            >
              {rescheduleMutation.isPending ? 'Rescheduling...' : 'Confirm Reschedule'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Appointment"
        maxWidth="460px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Are you sure you want to cancel appointment <strong>{selectedAppt?.appointmentNumber}</strong>?
          </p>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
              Reason for Cancellation:
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g., Conflict with work schedule..."
              rows={3}
              className="input-field"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button
              onClick={() => setCancelModalOpen(false)}
              className="btn btn-secondary"
              disabled={cancelMutation.isPending}
            >
              Keep Appointment
            </button>
            <button
              onClick={handleConfirmCancel}
              className="btn btn-danger"
              disabled={!cancelReason.trim() || cancelMutation.isPending}
            >
              {cancelMutation.isPending ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
