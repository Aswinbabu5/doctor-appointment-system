import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { appointmentApi, doctorApi } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, UserCheck, Stethoscope, ArrowRight, FileText, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Appointment, Doctor } from '../../types';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();

  const { data: appointments = [], isLoading: loadingAppts } = useQuery<Appointment[]>({
    queryKey: ['patient-appointments'],
    queryFn: () => appointmentApi.getPatientAppointments()
  });

  const { data: doctorsData, isLoading: loadingDocs } = useQuery({
    queryKey: ['approved-doctors-summary'],
    queryFn: () => doctorApi.getDoctors({ limit: 4 })
  });

  const upcomingAppt = appointments.find((a: Appointment) => a.status === 'BOOKED' || a.status === 'IN_PROGRESS');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '36px',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '24px',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ maxWidth: '600px' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
            Welcome back, {user?.username}! 👋
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1rem', lineHeight: '1.6' }}>
            Manage your medical appointments, access digital prescriptions, and connect with certified medical specialists in just a few clicks.
          </p>
        </div>
        <Link to="/patient/doctors" className="btn" style={{
          background: '#ffffff',
          color: 'var(--primary)',
          fontWeight: 700,
          padding: '14px 24px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
        }}>
          <Search size={18} /> Book New Consultation
        </Link>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px'
      }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Calendar size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Upcoming Consultations</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              {appointments.filter((a: Appointment) => a.status === 'BOOKED').length}
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'var(--success-bg)',
            color: 'var(--success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <UserCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Completed Sessions</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              {appointments.filter((a: Appointment) => a.status === 'COMPLETED').length}
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: '#F1F5F9',
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FileText size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Prescriptions on File</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              {appointments.filter((a: Appointment) => !!a.prescription).length}
            </div>
          </div>
        </div>
      </div>

      {
        loadingAppts ? (
          <LoadingSkeleton height="160px" />
        ) : upcomingAppt ? (
          <div className="card" style={{ borderLeft: '4px solid var(--primary)', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.05em' }}>
                    Next Scheduled Appointment
                  </span>
                  <Badge status={upcomingAppt.status} />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                  {upcomingAppt.doctor.user?.username}
                </h2>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  {upcomingAppt.doctor.specialization} • {upcomingAppt.doctor.qualifications}
                </div>
              </div>

              <Link to="/patient/appointments" className="btn btn-secondary btn-sm">
                Manage / Reschedule <ArrowRight size={14} />
              </Link>
            </div>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '24px',
              background: 'var(--bg-secondary)',
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.925rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} style={{ color: 'var(--primary)' }} />
                <span style={{ fontWeight: 600 }}>{new Date(upcomingAppt.scheduledDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} style={{ color: 'var(--primary)' }} />
                <span style={{ fontWeight: 600 }}>{upcomingAppt.startTime} - {upcomingAppt.endTime}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Appt #:</span>
                <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{upcomingAppt.appointmentNumber}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '36px 20px' }}>
            <Stethoscope size={40} style={{ color: 'var(--primary)', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '6px' }}>No Upcoming Consultations</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '20px' }}>
              You do not have any active appointments scheduled. Browse our qualified doctors and book a convenient slot.
            </p>
            <Link to="/patient/doctors" className="btn btn-primary">
              Find a Doctor
            </Link>
          </div>
        )
      }

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Available Specialists</h2>
          <Link to="/patient/doctors" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {
          loadingDocs ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <LoadingSkeleton height="180px" />
              <LoadingSkeleton height="180px" />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {
                doctorsData?.doctors?.map((doc: Doctor) => (
                  <div key={doc.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '2px' }}>{doc.user?.username}</h3>
                          <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.825rem' }}>{doc.specialization}</div>
                        </div>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          ₹{Number(doc.consultationFee).toFixed(0)}
                        </span>
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', lineHeight: '1.5', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {doc.bio || `${doc.qualifications} with ${doc.experienceYears} years of medical experience.`}
                      </p>
                    </div>

                    <Link to={`/patient/doctors/${doc.id}`} className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                      View Profile & Slots
                    </Link>
                  </div>
                ))
              }
            </div>
          )
        }
      </div>
    </div>
  );
};
