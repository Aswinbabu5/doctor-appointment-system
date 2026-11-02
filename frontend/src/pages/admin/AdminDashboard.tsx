import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/services';
import { Users, Stethoscope, Clock, IndianRupee, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Appointment } from '../../types';

export const AdminDashboard: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard-metrics'],
    queryFn: () => adminApi.getMetrics()
  });

  const metrics = data?.metrics;
  const recentAppointments: Appointment[] = data?.recentAppointments || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, marginBottom: '6px' }}>
          Platform Administration Overview
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Real-time metrics, system health, practitioner verifications, and platform appointment operations.
        </p>
      </div>

      {
        metrics?.pendingDoctors ? (
          <div style={{
            background: 'var(--warning-bg)',
            border: '1px solid var(--warning)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center' }}>
                <AlertTriangle size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '2px' }}>
                  {metrics.pendingDoctors} Doctor Application(s) Awaiting Medical Review
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Practitioners are pending medical certificate verification before their profiles can be listed.
                </p>
              </div>
            </div>

            <Link to="/admin/doctor-approvals" className="btn btn-primary btn-sm">
              Review Applications <ArrowRight size={14} />
            </Link>
          </div>
        ) : null
      }

      {
        isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <LoadingSkeleton height="110px" />
            <LoadingSkeleton height="110px" />
            <LoadingSkeleton height="110px" />
            <LoadingSkeleton height="110px" />
          </div>
        ) : (
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
                <Users size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Registered Patients</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{metrics?.totalPatients}</div>
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
                <Stethoscope size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Approved Doctors</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{metrics?.totalDoctors}</div>
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
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Pending Verifications</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{metrics?.pendingDoctors}</div>
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
                <IndianRupee size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Commission Revenue</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                  ₹{Number(metrics?.totalCommissionEarned || 0).toFixed(0)}
                </div>
              </div>
            </div>
          </div>
        )
      }

      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Recent Platform Appointments</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Live bookings across the healthcare platform.
            </p>
          </div>
          <Link to="/admin/appointments" className="btn btn-outline btn-sm">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {
          recentAppointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
              No appointments booked yet.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Appt #</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Scheduled Date</th>
                    <th>Total Fee</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    recentAppointments.map((appt: Appointment) => (
                      <tr key={appt.id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{appt.appointmentNumber}</td>
                        <td>{appt.patient.username}</td>
                        <td>{appt.doctor.user?.username}</td>
                        <td>{new Date(appt.scheduledDate).toLocaleDateString()}</td>
                        <td style={{ fontWeight: 600 }}>₹{Number(appt.totalAmount).toFixed(0)}</td>
                        <td>
                          <Badge status={appt.status} />
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
