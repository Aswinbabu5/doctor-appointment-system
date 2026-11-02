import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { appointmentApi, availabilityApi } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, Users, CheckCircle2, ArrowRight, Play, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Appointment, AvailabilitySlot } from '../../types';

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const doctor = user?.doctorProfile;

  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ['doctor-appointments'],
    queryFn: () => appointmentApi.getDoctorAppointments()
  });

  const { data: mySlots = [] } = useQuery<AvailabilitySlot[]>({
    queryKey: ['my-availability-slots'],
    queryFn: () => availabilityApi.getMySlots()
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter((a: Appointment) => {
    const d = new Date(a.scheduledDate).toISOString().split('T')[0];
    return d === todayStr;
  });

  const upcomingAppts = appointments.filter((a: Appointment) => a.status === 'BOOKED' || a.status === 'IN_PROGRESS');
  const completedAppts = appointments.filter((a: Appointment) => a.status === 'COMPLETED');

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
        gap: '24px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#ffffff' }}>
              Welcome, {user?.username}
            </h1>
            <span style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 700
            }}>
              {doctor?.specialization}
            </span>
          </div>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.95rem' }}>
            • Reg #{doctor?.medicalRegNumber}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/doctor/schedule" className="btn" style={{ background: '#ffffff', color: 'var(--primary)', fontWeight: 700 }}>
            <PlusCircle size={16} /> Manage Schedule
          </Link>
          <Link to="/doctor/appointments" className="btn btn-secondary" style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)' }}>
            Patient Queue
          </Link>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
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
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Today's Consultations</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{todayAppts.length}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'var(--warning-bg)',
            color: 'var(--warning)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Pending in Queue</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{upcomingAppts.length}</div>
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
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Completed Sessions</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{completedAppts.length}</div>
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
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Active Published Slots</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              {mySlots.filter((s: AvailabilitySlot) => !s.isBooked).length}
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Upcoming Patient Consultations</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Review patient intake notes, start sessions, and record clinical prescriptions.
            </p>
          </div>
          <Link to="/doctor/appointments" className="btn btn-outline btn-sm">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {
          isLoading ? (
            <LoadingSkeleton height="160px" />
          ) : upcomingAppts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
              No upcoming patients in your queue right now.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Date & Time</th>
                    <th>Appt #</th>
                    <th>Symptoms / Notes</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    upcomingAppts.slice(0, 5).map((appt: Appointment) => (
                      <tr key={appt.id}>
                        <td>
                          <div style={{ fontWeight: 700 }}>{appt.patient.username}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{appt.patient.phone || appt.patient.email}</div>
                        </td>
                        <td>
                          <div>{new Date(appt.scheduledDate).toLocaleDateString()}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{appt.startTime} - {appt.endTime}</div>
                        </td>
                        <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{appt.appointmentNumber}</td>
                        <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {appt.notes || 'Routine consultation'}
                        </td>
                        <td>
                          <Badge status={appt.status} />
                        </td>
                        <td>
                          <Link
                            to={`/doctor/consultations/${appt.id}`}
                            className="btn btn-primary btn-sm"
                          >
                            <Play size={13} /> {appt.status === 'IN_PROGRESS' ? 'Resume' : 'Start'}
                          </Link>
                        </td>
                      </tr>
                    ))
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
