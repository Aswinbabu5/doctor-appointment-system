import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, XCircle, FileText } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Doctor } from '../../types';

export const DoctorApprovalPage: React.FC = () => {
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const { data: pendingDoctors = [], isLoading } = useQuery<Doctor[]>({
    queryKey: ['pending-doctors'],
    queryFn: () => adminApi.getPendingDoctors()
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => adminApi.approveDoctor(id),
    onSuccess: (data: any) => {
      addToast(`Dr. ${data.data.user.fullName} has been approved!`, 'success');
      queryClient.invalidateQueries({ queryKey: ['pending-doctors'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-metrics'] });
    },
    onError: (err: any) => {
      addToast(err.response?.data?.message || 'Failed to approve doctor.', 'error');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (data: { id: number; reason: string }) => adminApi.rejectDoctor(data.id, data.reason),
    onSuccess: () => {
      addToast('Doctor application rejected.', 'info');
      setRejectModalOpen(false);
      setRejectionReason('');
      setSelectedDoctor(null);
      queryClient.invalidateQueries({ queryKey: ['pending-doctors'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-metrics'] });
    },
    onError: (err: any) => {
      addToast(err.response?.data?.message || 'Failed to reject doctor.', 'error');
    }
  });

  const handleOpenReject = (doc: Doctor) => {
    setSelectedDoctor(doc);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (!selectedDoctor) return;
    if (!rejectionReason.trim() || rejectionReason.length < 5) {
      addToast('Please provide a descriptive reason for rejection (at least 5 characters).', 'error');
      return;
    }
    rejectMutation.mutate({
      id: selectedDoctor.id,
      reason: rejectionReason
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '6px' }}>
          Doctor Verification & Approvals
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Review practitioner credentials, verify medical license records, and approve doctors for public consultation bookings.
        </p>
      </div>

      {
        isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <LoadingSkeleton height="200px" />
            <LoadingSkeleton height="200px" />
          </div>
        ) : pendingDoctors.length === 0 ? (
          <EmptyState
            title="All Caught Up!"
            description="There are currently no doctor verification applications pending review."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {
              pendingDoctors.map((doc: Doctor) => (
                <div key={doc.id} className="card" style={{ padding: '28px', borderLeft: '4px solid var(--warning)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{doc.user?.username}</h3>
                        <span className="badge badge-warning">Pending Review</span>
                      </div>
                      <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.95rem' }}>
                        {doc.specialization}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Email: {doc.user?.email} • Phone: {doc.user?.phone || 'N/A'}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Medical Reg Number</div>
                      <div style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '1rem' }}>{doc.medicalRegNumber}</div>
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                    background: 'var(--bg-secondary)',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '16px',
                    fontSize: '0.875rem'
                  }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Qualifications</span>
                      <strong>{doc.qualifications}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Clinical Experience</span>
                      <strong>{doc.experienceYears} Years</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Requested Fee</span>
                      <strong>₹{Number(doc.consultationFee).toFixed(0)}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Application Date</span>
                      <strong>{new Date(doc.createdAt || Date.now()).toLocaleDateString()}</strong>
                    </div>
                  </div>

                  {
                    doc.bio && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.5', marginBottom: '16px' }}>
                        <strong>Bio: </strong>{doc.bio}
                      </p>
                    )
                  }

                  {
                    doc.documents && doc.documents.length > 0 && (
                      <div style={{ marginBottom: '20px' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                          Attached Registration Documents
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {
                            doc.documents.map((d: any) => (
                              <a
                                key={d.id}
                                href={d.filePath}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-secondary btn-sm"
                                style={{ fontSize: '0.8rem' }}
                              >
                                <FileText size={14} /> {d.originalName} ({Math.round(d.fileSize / 1024)} KB)
                              </a>
                            ))
                          }
                        </div>
                      </div>
                    )
                  }

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                    <button
                      onClick={() => handleOpenReject(doc)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      className="btn btn-secondary btn-sm"
                      style={{ color: 'var(--danger)' }}
                    >
                      <XCircle size={15} /> Reject Application
                    </button>
                    <button
                      onClick={() => approveMutation.mutate(doc.id)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      className="btn btn-primary btn-sm"
                    >
                      <CheckCircle2 size={15} />
                      {approveMutation.isPending ? 'Approving...' : 'Approve & Activate'}
                    </button>
                  </div>
                </div>
              ))
            }
          </div>
        )
      }

      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Doctor Application"
        maxWidth="480px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Please state the specific reason for rejecting <strong>{selectedDoctor?.user?.username}</strong>. The doctor will see this message upon login.
          </p>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
              Rejection Reason *
            </label>
            <textarea
              required
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Medical registration number could not be validated on the state medical council registry."
              className="input-field"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              onClick={() => setRejectModalOpen(false)}
              className="btn btn-secondary"
              disabled={rejectMutation.isPending}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmReject}
              className="btn btn-danger"
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
