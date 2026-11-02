import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { prescriptionApi } from '../../api/services';
import { FileText, Calendar, Stethoscope, Printer } from 'lucide-react';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Prescription, PrescriptionItem } from '../../types';

export const PrescriptionsPage: React.FC = () => {
  const { data: prescriptions = [], isLoading } = useQuery<Prescription[]>({
    queryKey: ['patient-prescriptions'],
    queryFn: () => prescriptionApi.getMyPrescriptions()
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '6px' }}>Digital Prescriptions</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Access and print all formal medical prescriptions issued by your consulting physicians.
          </p>
        </div>
      </div>

      {
        isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <LoadingSkeleton height="180px" />
            <LoadingSkeleton height="180px" />
          </div>
        ) : prescriptions.length === 0 ? (
          <EmptyState
            title="No Prescriptions Issued"
            description="You do not have any digital prescriptions on file yet. Prescriptions will appear here once your consulting doctor finishes your appointment."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {
              prescriptions.map((rx: Prescription) => (
                <div key={rx.id} className="card" style={{ padding: '28px', borderLeft: '4px solid var(--primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '20px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <Stethoscope size={16} /> Official Prescription
                      </div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px' }}>
                        {rx.doctor.user.username}
                      </h3>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Appt #: {rx.appointment.appointmentNumber}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <div>Issued On</div>
                        <strong style={{ color: 'var(--text-main)' }}>{new Date(rx.createdAt).toLocaleDateString()}</strong>
                      </div>
                      <button
                        onClick={handlePrint}
                        className="btn btn-outline btn-sm"
                      >
                        <Printer size={15} /> Print
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                        Primary Diagnosis
                      </span>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem' }}>
                        {rx.diagnosis}
                      </div>
                    </div>

                    {
                      rx.clinicalNotes && (
                        <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                            Clinical Advice & Notes
                          </span>
                          <div style={{ color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                            {rx.clinicalNotes}
                          </div>
                        </div>
                      )
                    }
                  </div>

                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={16} style={{ color: 'var(--primary)' }} /> Prescribed Medicines & Regimen
                    </h4>

                    <div style={{ overflowX: 'auto' }}>
                      <table className="table" style={{ fontSize: '0.875rem' }}>
                        <thead>
                          <tr>
                            <th>Medicine</th>
                            <th>Dosage</th>
                            <th>Frequency</th>
                            <th>Duration</th>
                            <th>Special Instructions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {
                            rx.items.map((item: PrescriptionItem) => (
                              <tr key={item.id}>
                                <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{item.medicineName}</td>
                                <td>{item.dosage}</td>
                                <td><span className="badge badge-info">{item.frequency}</span></td>
                                <td>{item.duration}</td>
                                <td style={{ color: 'var(--text-muted)' }}>{item.instructions || 'As advised'}</td>
                              </tr>
                            ))
                          }
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {
                    rx.followUpDate && (
                      <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                        <Calendar size={16} style={{ color: 'var(--primary)' }} />
                        <span>Recommended Follow-up Date: <strong>{new Date(rx.followUpDate).toLocaleDateString()}</strong></span>
                      </div>
                    )
                  }
                </div>
              ))
            }
          </div>
        )
      }
    </div>
  );
};
