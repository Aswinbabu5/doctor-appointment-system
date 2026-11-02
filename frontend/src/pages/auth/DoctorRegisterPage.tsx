import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/common/Navbar';
import { Stethoscope, Upload, ArrowRight, ShieldCheck } from 'lucide-react';

export const DoctorRegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    specialization: 'Cardiology',
    qualifications: '',
    medicalRegNumber: '',
    experienceYears: 5,
    consultationFee: 800,
    bio: ''
  });
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { registerDoctor } = useAuth();
  const navigate = useNavigate();

  const specializations = [
    'Cardiology',
    'Dermatology',
    'Pediatrics',
    'Orthopedics',
    'Neurology',
    'General Medicine',
    'Gastroenterology',
    'Psychiatry',
    'Ophthalmology',
    'ENT'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCertificateFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => data.append(k, String(v)));
      if (certificateFile) {
        data.append('certificate', certificateFile);
      }

      await registerDoctor(data);
      navigate('/pending-approval');
    } catch {
      // Handled by AuthContext toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' }}>
        <div style={{ width: '100%', maxWidth: '680px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}
            >
              <Stethoscope size={26} />
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Join as Medical Practitioner</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.35rem' }}>
              Register your clinical credentials to offer consultations on DocCare Connect
            </p>
          </div>

          <div className="card" style={{ padding: '2.5rem' }}>
            <form onSubmit={handleSubmit}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                1. Personal & Contact Details
              </h3>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name (with Dr. prefix)</label>
                  <input
                    type="text"
                    name="username"
                    className="form-control"
                    placeholder="e.g. Dr. John Watson"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="dr.watson@hospital.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-control"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <h3 style={{ fontSize: '1.1rem', margin: '1.75rem 0 1.25rem', color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                2. Professional Credentials & Licensing
              </h3>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Primary Specialization</label>
                  <select
                    name="specialization"
                    className="form-control"
                    value={formData.specialization}
                    onChange={handleChange}
                    required
                  >
                    {specializations.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Medical Registration No.</label>
                  <input
                    type="text"
                    name="medicalRegNumber"
                    className="form-control"
                    placeholder="e.g. MCI-2015-8831"
                    value={formData.medicalRegNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Medical Qualifications / Degrees</label>
                  <input
                    type="text"
                    name="qualifications"
                    className="form-control"
                    placeholder="e.g. MBBS, MD (Cardiology), FRCS"
                    value={formData.qualifications}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Years of Clinical Experience</label>
                  <input
                    type="number"
                    name="experienceYears"
                    className="form-control"
                    min="0"
                    max="60"
                    value={formData.experienceYears}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Consultation Fee (₹)</label>
                <input
                  type="number"
                  name="consultationFee"
                  className="form-control"
                  min="100"
                  step="50"
                  value={formData.consultationFee}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Professional Biography & Expertise</label>
                <textarea
                  name="bio"
                  className="form-control"
                  rows={3}
                  placeholder="Summarize your clinical focus, hospital affiliations, and areas of expertise..."
                  value={formData.bio}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Medical Certificate / Registration Document (PDF or Image)</label>
                <div
                  style={{
                    border: '2px dashed var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.5rem',
                    textAlign: 'center',
                    backgroundColor: '#F8FAFC',
                    cursor: 'pointer'
                  }}
                  onClick={() => document.getElementById('certInput')?.click()}
                >
                  <Upload size={28} color="var(--primary)" style={{ margin: '0 auto 0.5rem' }} />
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                    {certificateFile ? certificateFile.name : 'Click to upload Medical License / Certificate'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Supported formats: PDF, JPG, PNG (Max 5MB)
                  </div>
                  <input
                    id="certInput"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--primary-light)',
                  border: '1px solid var(--primary-border)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  gap: '0.75rem',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)'
                }}
              >
                <ShieldCheck size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  Notice: All doctor accounts are initially assigned a <strong>PENDING</strong> status. Our medical administration verifies registration numbers before granting appointment calendar access.
                </span>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting Application...' : 'Submit Application for Review'} <ArrowRight size={18} />
              </button>
            </form>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Already registered?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Doctor Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
