import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { availabilityApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import { Plus, Trash2 } from 'lucide-react';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { AvailabilitySlot } from '../../types';

export const ScheduleManagementPage: React.FC = () => {
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('09:30');
  const [quickSlots, setQuickSlots] = useState(false);

  const { data: slots = [], isLoading } = useQuery<AvailabilitySlot[]>({
    queryKey: ['my-availability-slots'],
    queryFn: () => availabilityApi.getMySlots()
  });

  // Create Slot Mutation
  const createMutation = useMutation({
    mutationFn: (newSlots: Array<{ date: string; startTime: string; endTime: string }>) =>
      availabilityApi.createSlots(newSlots),
    onSuccess: () => {
      addToast('Slots published successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['my-availability-slots'] });
    },
    onError: (err: any) => {
      addToast(err.response?.data?.message || 'Failed to create slot.', 'error');
    }
  });

  // Delete Slot Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => availabilityApi.deleteSlot(id),
    onSuccess: () => {
      addToast('Slot removed.', 'info');
      queryClient.invalidateQueries({ queryKey: ['my-availability-slots'] });
    },
    onError: (err: any) => {
      addToast(err.response?.data?.message || 'Failed to delete slot.', 'error');
    }
  });

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSlots) {
      // Generate 4 consecutive 30-min slots starting from startTime
      const [h, m] = startTime.split(':').map(Number);
      const generated = [];
      let curMinutes = h * 60 + m;

      for (let i = 0; i < 4; i++) {
        const sH = Math.floor(curMinutes / 60).toString().padStart(2, '0');
        const sM = (curMinutes % 60).toString().padStart(2, '0');
        curMinutes += 30;
        const eH = Math.floor(curMinutes / 60).toString().padStart(2, '0');
        const eM = (curMinutes % 60).toString().padStart(2, '0');

        generated.push({
          date,
          startTime: `${sH}:${sM}`,
          endTime: `${eH}:${eM}`
        });
      }

      createMutation.mutate(generated);
    } else {
      createMutation.mutate([{ date, startTime, endTime }]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '6px' }}>
          Schedule & Slot Management
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Publish open consultation slots for patients to book. Strict anti-overlap guards prevent double scheduling.
        </p>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} style={{ color: 'var(--primary)' }} /> Create Availability Slots
        </h2>

        <form onSubmit={handleAddSlot} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Date</label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Start Time</label>
            <input
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>End Time</label>
            <input
              type="time"
              required
              disabled={quickSlots}
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '12px', fontSize: '0.85rem', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={quickSlots}
                onChange={(e) => setQuickSlots(e.target.checked)}
              />
              Generate 4x 30-min block
            </label>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {createMutation.isPending ? 'Publishing...' : 'Publish Slots'}
            </button>
          </div>
        </form>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px' }}>
          Your Scheduled Availability ({slots.length} Total Slots)
        </h2>

        {
          isLoading ? (
            <LoadingSkeleton height="200px" />
          ) : slots.length === 0 ? (
            <EmptyState title="No Slots Published" description="You have not added any consultation slots yet. Use the form above to add your working hours." />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time Window</th>
                    <th>Duration</th>
                    <th>Booking Status</th>
                    <th>Patient Info</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    slots.map((slot: AvailabilitySlot) => {
                      const isPast = new Date(slot.endTimestamp).getTime() < Date.now();
                      return (
                        <tr key={slot.id} style={{ opacity: isPast ? 0.6 : 1 }}>
                          <td style={{ fontWeight: 600 }}>
                            {new Date(slot.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td>
                            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                              {slot.startTime} - {slot.endTime}
                            </span>
                          </td>
                          <td>{slot.durationMinutes} mins</td>
                          <td>
                            {
                              slot.isBooked ? (
                                <span className="badge badge-success">Booked</span>
                              ) : isPast ? (
                                <span className="badge badge-secondary">Expired</span>
                              ) : (
                                <span className="badge badge-primary">Available</span>
                              )
                            }
                          </td>
                          <td>
                            {
                              slot.appointment ? (
                                <div>
                                  <div style={{ fontWeight: 600 }}>{slot.appointment.patient.username}</div>
                                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{slot.appointment.appointmentNumber}</div>
                                </div>
                              ) : (
                                <span style={{ color: 'var(--text-muted)' }}>—</span>
                              )
                            }
                          </td>
                          <td>
                            {
                              !slot.isBooked && (
                                <button
                                  onClick={() => deleteMutation.mutate(slot.id)}
                                  disabled={deleteMutation.isPending}
                                  className="btn btn-secondary btn-sm"
                                  style={{ color: 'var(--danger)', padding: '6px 10px' }}
                                  title="Remove slot"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )
                            }
                          </td>
                        </tr>
                      );
                    })
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
