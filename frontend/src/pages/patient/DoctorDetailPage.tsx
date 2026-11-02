import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorApi, availabilityApi, appointmentApi, settingsApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import { Calendar, Clock, ShieldCheck } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { AvailabilitySlot, Doctor } from '../../types';

export const DoctorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const doctorId = parseInt(id || '0', 10);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [notes, setNotes] = useState('');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  // Fetch Doctor Profile
  const { data: doctor, isLoading: loadingDoc } = useQuery<Doctor>({
    queryKey: ['doctor-profile', doctorId],
    queryFn: () => doctorApi.getDoctorById(doctorId),
    enabled: !!doctorId
  });

  // Fetch Doctor Availability Slots
  const { data: slots = [], isLoading: loadingSlots } = useQuery<AvailabilitySlot[]>({
    queryKey: ['doctor-slots', doctorId],
    queryFn: () => availabilityApi.getDoctorSlots(doctorId, { availableOnly: true }),
    enabled: !!doctorId
  });

  // Fetch App Settings for Commission
  const { data: settings } = useQuery({
    queryKey: ['app-settings'],
    queryFn: () => settingsApi.getSettings()
  });

  // Booking Mutation
  const bookMutation = useMutation({
    mutationFn: (data: { slotId: number; notes?: string }) => appointmentApi.bookAppointment(data),
    onSuccess: () => {
      addToast('Appointment booked successfully!', 'success');
      setBookingModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['doctor-slots'] });
      queryClient.invalidateQueries({ queryKey: ['patient-appointments'] });
      navigate('/patient/appointments');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to book appointment. Please try again.';
      addToast(msg, 'error');
    }
  });

  if (loadingDoc) {
    return <LoadingSkeleton height="400px" />;
  }

  if (!doctor) {
    return <EmptyState title="Doctor Not Found" description="The requested doctor profile could not be located." />;
  }

  // Calculate Fee Details for Selected Slot
  const docFee = Number(doctor.consultationFee);
  const commType = settings?.commissionType || 'PERCENTAGE';
  const commRate = Number(settings?.commissionValue || 10);
  const commAmount = commType === 'PERCENTAGE' ? Math.round((docFee * commRate) / 100) : commRate;
  const totalAmount = docFee + commAmount;

  // Group slots by date
  const slotsByDate: { [date: string]: AvailabilitySlot[] } = {};
  slots.forEach((s: AvailabilitySlot) => {
    const d = new Date(s.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    if (!slotsByDate[d]) 
      slotsByDate[d] = [];
    slotsByDate[d].push(s);
  });

  const handleOpenBooking = (slot: AvailabilitySlot) => {
    setSelectedSlot(slot);
    setBookingModalOpen(true);
  };

  const handleConfirmBooking = () => {
    if (!selectedSlot) return;
    bookMutation.mutate({
      slotId: selectedSlot.id,
      notes: notes || undefined
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div className="card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{
            width: '88px',
            height: '88px',
            borderRadius: '20px',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 800,
            flexShrink: 0
          }}>
            {doctor.user?.username?.replace('Dr. ', '').charAt(0) || 'D'}
          </div>

          <div style={{ flex: 1, minWidth: '260px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{doctor.user?.username}</h1>
              <ShieldCheck size={20} style={{ color: 'var(--primary)' }} />
            </div>

            <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '1.05rem', marginBottom: '6px' }}>
              {doctor.specialization}
            </div>

            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
              {doctor.qualifications} • Reg #{doctor.medicalRegNumber}
            </div>

            <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.6', maxWidth: '800px' }}>
              {doctor.bio || 'Experienced specialist committed to evidence-based medical consultations and personalized patient care.'}
            </p>
          </div>

          <div style={{
            background: 'var(--bg-secondary)',
            padding: '20px 24px',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
            minWidth: '180px'
          }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Consultation Fee
            </span>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>
              ₹{docFee.toFixed(0)}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
              per 30-min session
            </span>
          </div>
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '8px' }}>
          Available Appointment Slots
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
          Select an open slot to schedule your medical consultation.
        </p>

        {
        loadingSlots ? (
          <LoadingSkeleton height="200px" />
        ) : Object.keys(slotsByDate).length === 0 ? (
          <EmptyState
            title="No Open Slots"
            description="Dr. Sharma has not published any open slots for the coming days. Please check back later."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {
            Object.entries(slotsByDate).map(([dateLabel, dateSlots]) => (
              <div key={dateLabel} className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Calendar size={18} style={{ color: 'var(--primary)' }} />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{dateLabel}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                    {dateSlots.length} slot(s) available
                  </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {
                  dateSlots.map((slot: AvailabilitySlot) => (
                    <button
                      key={slot.id}
                      onClick={() => handleOpenBooking(slot)}
                      className="btn"
                      style={{
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-main)',
                        border: '1px solid var(--border)',
                        padding: '10px 18px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary)';
                        e.currentTarget.style.background = 'var(--primary-light)';
                        e.currentTarget.style.color = 'var(--primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.background = 'var(--bg-secondary)';
                        e.currentTarget.style.color = 'var(--text-main)';
                      }}
                    >
                      <Clock size={16} />
                      {slot.startTime} - {slot.endTime}
                    </button>
                  ))
                  }
                </div>
              </div>
            ))
            }
          </div>
        )
        }
      </div>

      <Modal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        title="Confirm Appointment Booking"
        maxWidth="540px"
      >
        {
        selectedSlot && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
              border: '1px solid var(--border)'
            }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>
                {doctor.user?.username}
              </div>
              <div style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '12px' }}>
                {doctor.specialization}
              </div>
              <div style={{ display: 'flex', gap: '20px', fontSize: '0.9rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Date: </span>
                  <strong>{new Date(selectedSlot.date).toLocaleDateString()}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Time: </span>
                  <strong>{selectedSlot.startTime} - {selectedSlot.endTime}</strong>
                </div>
              </div>
            </div>

            <div style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
              fontSize: '0.9rem'
            }}>
              <div style={{ fontWeight: 700, marginBottom: '12px', fontSize: '0.95rem' }}>
                Transparent Fee Breakdown
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Doctor Consultation Fee:</span>
                <span>₹{docFee.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Platform Service Fee ({commRate}%):</span>
                <span>₹{commAmount.toFixed(2)}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '10px',
                borderTop: '1px solid var(--border)',
                fontWeight: 800,
                fontSize: '1.05rem',
                color: 'var(--primary)'
              }}>
                <span>Total Amount:</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                Symptoms / Reason for Visit (Optional):
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Briefly describe your symptoms or medical concern..."
                rows={3}
                className="input-field"
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => setBookingModalOpen(false)}
                className="btn btn-secondary"
                disabled={bookMutation.isPending}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBooking}
                className="btn btn-primary"
                disabled={bookMutation.isPending}
              >
                {bookMutation.isPending ? 'Confirming...' : 'Confirm & Book'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
