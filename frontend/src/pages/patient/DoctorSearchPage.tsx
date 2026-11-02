import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { doctorApi } from '../../api/services';
import { Search, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Doctor } from '../../types';

const SPECIALIZATIONS = [
  'All Specializations',
  'Cardiology',
  'Dermatology',
  'Pediatrics',
  'Orthopedics',
  'General Medicine',
  'Neurology'
];

export const DoctorSearchPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('All Specializations');
  const [sortBy, setSortBy] = useState('experience');

  const { data, isLoading } = useQuery({
    queryKey: ['doctors-search', search, specialization, sortBy],
    queryFn: () => doctorApi.getDoctors({
      search: search || undefined,
      specialization: specialization === 'All Specializations' ? undefined : specialization,
      sortBy
    })
  });

  const doctors: Doctor[] = data?.doctors || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '8px' }}>
          Find & Consult Top Doctors
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Explore our certified healthcare practitioners, view verified qualifications, and book instant appointments.
        </p>
      </div>

      <div className="card" style={{ padding: '20px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          alignItems: 'center'
        }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '220px', maxWidth: '335px' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by doctor name or specialty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                height: '42px',
                padding: '0 14px 0 42px',
                border: '1px solid var(--border)',
                borderRadius: '11px',
                background: 'var(--bg-card)',
                color: '#1E293B',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              style={{
                height: '38px',
                minWidth: '320px',
                padding: '0 14px',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                background: '#ffffff',
                color: '#333333',
                fontSize: '15px',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {
                SPECIALIZATIONS.map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))
              }
            </select>
          </div>

          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                height: '38px',
                minWidth: '340px',
                padding: '0 14px',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                background: '#ffffff',
                color: '#333333',
                fontSize: '15px',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="experience">Sort by Experience (High to Low)</option>
              <option value="fee_asc">Consultation Fee: Low to High</option>
              <option value="fee_desc">Consultation Fee: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {
        isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            <LoadingSkeleton height="240px" />
            <LoadingSkeleton height="240px" />
            <LoadingSkeleton height="240px" />
          </div>
        ) : doctors.length === 0 ? (
          <EmptyState
            title="No Doctors Found"
            description="We couldn't find any certified doctors matching your search parameters. Try adjusting your filter."
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
            {
              doctors.map((doc: Doctor) => (
                <div key={doc.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '16px',
                        background: 'var(--primary-light)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        flexShrink: 0
                      }}>
                        {doc.user?.username?.replace('Dr. ', '').charAt(0) || 'D'}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '2px' }}>
                          {doc.user?.username}
                        </h3>
                        <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem', marginBottom: '4px' }}>
                          {doc.specialization}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {doc.qualifications}
                        </div>
                      </div>
                    </div>

                    <p style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.85rem',
                      lineHeight: '1.5',
                      marginBottom: '20px',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {doc.bio || `Senior healthcare specialist with over ${doc.experienceYears} years of medical experience treating clinical cases.`}
                    </p>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '20px',
                      fontSize: '0.85rem'
                    }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Experience</span>
                        <strong style={{ color: 'var(--text-main)' }}>{doc.experienceYears} Years</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Consultation Fee</span>
                        <strong style={{ color: 'var(--primary)', fontSize: '0.95rem' }}>
                          ₹{Number(doc.consultationFee).toFixed(0)}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/patient/doctors/${doc.id}`}
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <Calendar size={16} /> Book Appointment
                  </Link>
                </div>
              ))
            }
          </div>
        )
      }
    </div>
  );
};
