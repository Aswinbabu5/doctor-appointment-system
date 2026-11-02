import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentApi, prescriptionApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import { Stethoscope, Plus, Trash2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Appointment } from '../../types';

interface MedicineRow {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export const ConsultationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const appointmentId = parseInt(id || '0', 10);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const [diagnosis, setDiagnosis] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [medicines, setMedicines] = useState<MedicineRow[]>([
    { medicineName: '', dosage: '', frequency: '1-0-1', duration: '5 days', instructions: 'Take after meals' }
  ]);

  const { data: appointment, isLoading } = useQuery<Appointment>({
    queryKey: ['appointment-detail', appointmentId],
    queryFn: () => appointmentApi.getAppointmentById(appointmentId),
    enabled: !!appointmentId
  });

  // Automatically mark status as IN_PROGRESS if currently BOOKED
  useEffect(() => {
    if (appointment && appointment.status === 'BOOKED') {
      appointmentApi.updateStatus(appointment.id, 'IN_PROGRESS').catch(() => { });
    }
  }, [appointment]);

  // Complete & Prescribe Mutation
  const completeMutation = useMutation({
    mutationFn: (data: any) => prescriptionApi.createPrescription(data),
    onSuccess: () => {
      addToast('Consultation completed and prescription saved successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['doctor-all-appointments'] });
      navigate('/doctor/appointments');
    },
    onError: (err: any) => {
      addToast(err.response?.data?.message || 'Failed to complete consultation.', 'error');
    }
  });

  const handleAddMedicineRow = () => {
    setMedicines([
      ...medicines,
      { medicineName: '', dosage: '', frequency: '1-0-1', duration: '5 days', instructions: 'Take after meals' }
    ]);
  };

  const handleRemoveMedicineRow = (index: number) => {
    if (medicines.length === 1) {
      addToast('At least one medicine is required in the prescription.', 'info');
      return;
    }
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleUpdateMedicine = (index: number, field: keyof MedicineRow, val: string) => {
    const updated = [...medicines];
    updated[index][field] = val;
    setMedicines(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!diagnosis.trim()) {
      addToast('Please provide a medical diagnosis.', 'error');
      return;
    }

    const validMedicines = medicines.filter(m => m.medicineName.trim() && m.dosage.trim());
    if (validMedicines.length === 0) {
      addToast('Please provide at least one medicine with valid name and dosage.', 'error');
      return;
    }

    completeMutation.mutate({
      appointmentId,
      diagnosis,
      clinicalNotes: clinicalNotes || undefined,
      followUpDate: followUpDate || undefined,
      items: validMedicines
    });
  };

  if (isLoading) {
    return <LoadingSkeleton height="400px" />;
  }

  if (!appointment) {
    return <EmptyState title="Appointment Not Found" description="Could not load the specified consultation session." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1000px', margin: '0 auto' }}>
      <button
        onClick={() => navigate('/doctor/appointments')}
        className="btn btn-secondary btn-sm"
        style={{ alignSelf: 'flex-start' }}
      >
        <ArrowLeft size={16} /> Back to Appointments
      </button>

      <div className="card" style={{ padding: '24px', background: 'var(--bg-secondary)', borderLeft: '4px solid var(--primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.05em' }}>
              Active Patient Session
            </span>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '2px' }}>
              {appointment.patient.username}
            </h1>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Phone: {appointment.patient.phone || 'N/A'} • Email: {appointment.patient.email}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Scheduled Window</div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              {appointment.startTime} - {appointment.endTime} ({new Date(appointment.scheduledDate).toLocaleDateString()})
            </div>
            <div style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
              {appointment.appointmentNumber}
            </div>
          </div>
        </div>

        {
          appointment.notes && (
            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border)', fontSize: '0.875rem' }}>
              <span style={{ fontWeight: 600 }}>Patient Chief Complaint: </span>
              <span style={{ color: 'var(--text-muted)' }}>{appointment.notes}</span>
            </div>
          )
        }
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="card" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Stethoscope size={20} style={{ color: 'var(--primary)' }} /> Clinical Findings & Diagnosis
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '6px' }}>
                Primary Diagnosis *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Acute Bronchitis, Essential Hypertension..."
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '6px' }}>
                Clinical Notes / Advice
              </label>
              <textarea
                placeholder="Patient symptoms observed, lifestyle guidance, diet recommendations..."
                rows={3}
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '6px' }}>
                Recommended Follow-Up Date (Optional)
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="input-field"
                style={{ maxWidth: '240px' }}
              />
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Prescription Medications</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Add prescription drugs with dosage, administration schedule, and instructions.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddMedicineRow}
              className="btn btn-outline btn-sm"
            >
              <Plus size={16} /> Add Medicine
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {
              medicines.map((med, index) => (
                <div
                  key={index}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 2fr auto',
                    gap: '12px',
                    alignItems: 'center',
                    background: 'var(--bg-secondary)',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>Medicine Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Amoxicillin"
                      value={med.medicineName}
                      onChange={(e) => handleUpdateMedicine(index, 'medicineName', e.target.value)}
                      className="input-field"
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>Dosage</label>
                    <input
                      type="text"
                      required
                      placeholder="500mg"
                      value={med.dosage}
                      onChange={(e) => handleUpdateMedicine(index, 'dosage', e.target.value)}
                      className="input-field"
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>Frequency</label>
                    <input
                      type="text"
                      placeholder="1-0-1"
                      value={med.frequency}
                      onChange={(e) => handleUpdateMedicine(index, 'frequency', e.target.value)}
                      className="input-field"
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>Duration</label>
                    <input
                      type="text"
                      placeholder="5 days"
                      value={med.duration}
                      onChange={(e) => handleUpdateMedicine(index, 'duration', e.target.value)}
                      className="input-field"
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>Instructions</label>
                    <input
                      type="text"
                      placeholder="After meals"
                      value={med.instructions}
                      onChange={(e) => handleUpdateMedicine(index, 'instructions', e.target.value)}
                      className="input-field"
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>

                  <div style={{ paddingTop: '20px' }}>
                    <button
                      type="button"
                      onClick={() => handleRemoveMedicineRow(index)}
                      className="btn btn-secondary btn-sm"
                      style={{ color: 'var(--danger)', padding: '8px' }}
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
          <button
            type="button"
            onClick={() => navigate('/doctor/appointments')}
            className="btn btn-secondary"
            disabled={completeMutation.isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={completeMutation.isPending}
            className="btn btn-primary"
            style={{ minWidth: '220px', justifyContent: 'center' }}
          >
            <CheckCircle2 size={18} />
            {completeMutation.isPending ? 'Completing Session...' : 'Complete & Issue Prescription'}
          </button>
        </div>
      </form>
    </div>
  );
};
