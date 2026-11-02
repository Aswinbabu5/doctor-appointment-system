import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMutation } from '@tanstack/react-query';
import { doctorApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2 } from 'lucide-react';

export const DoctorProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const doctor = user?.doctorProfile;
  const { addToast } = useToast();

  const [specialization, setSpecialization] = useState(doctor?.specialization || '');
  const [qualifications, setQualifications] = useState(doctor?.qualifications || '');
  const [experienceYears, setExperienceYears] = useState(doctor?.experienceYears || 0);
  const [consultationFee, setConsultationFee] = useState(doctor?.consultationFee ? Number(doctor.consultationFee) : 0);
  const [bio, setBio] = useState(doctor?.bio || '');

  const updateMutation = useMutation({
    mutationFn: (data: any) => doctorApi.updateProfile(data),
    onSuccess: async () => {
      addToast('Profile updated successfully!', 'success');
      await refreshUser();
    },
    onError: (err: any) => {
      addToast(err.response?.data?.message || 'Failed to update profile.', 'error');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      specialization,
      qualifications,
      experienceYears: Number(experienceYears),
      consultationFee: Number(consultationFee),
      bio
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '800px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '6px' }}>Doctor Medical Profile</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Manage your public directory listing, clinical credentials, and standard consultation fee.
        </p>
      </div>

      <div className="card" style={{ padding: '32px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '24px' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              fontWeight: 800
            }}>
              {user?.username.replace('Dr. ', '').charAt(0)}
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{user?.username}</h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Medical Reg #{doctor?.medicalRegNumber} • Status: <strong style={{ color: 'var(--primary)' }}>{doctor?.approvalStatus}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '6px' }}>
                Medical Specialization
              </label>
              <input
                type="text"
                required
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '6px' }}>
                Experience (Years)
              </label>
              <input
                type="number"
                required
                min={0}
                value={experienceYears}
                onChange={(e) => setExperienceYears(parseInt(e.target.value, 10))}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '6px' }}>
              Academic & Medical Qualifications
            </label>
            <input
              type="text"
              required
              value={qualifications}
              onChange={(e) => setQualifications(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '6px' }}>
              Consultation Fee (₹ INR)
            </label>
            <input
              type="number"
              required
              min={0}
              step={50}
              value={consultationFee}
              onChange={(e) => setConsultationFee(parseFloat(e.target.value))}
              className="input-field"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '6px' }}>
              Professional Biography
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="input-field"
              placeholder="Highlight your clinical expertise, hospital affiliations, and treatment philosophies..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="btn btn-primary"
              style={{ minWidth: '160px', justifyContent: 'center' }}
            >
              <CheckCircle2 size={16} />
              {updateMutation.isPending ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
