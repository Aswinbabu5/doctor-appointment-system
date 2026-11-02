import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Clock, ShieldAlert, RefreshCw, LogOut } from 'lucide-react';

export const PendingApprovalPage: React.FC = () => {
  const { user, refreshUser, logout } = useAuth();
  const [checking, setChecking] = React.useState(false);

  const handleRefresh = async () => {
    setChecking(true);
    await refreshUser();
    setTimeout(() => setChecking(false), 600);
  };

  const isRejected = user?.doctorProfile?.approvalStatus === 'REJECTED';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-secondary)',
      padding: '24px'
    }}>
      <div className="card" style={{ maxWidth: '580px', width: '100%', padding: '40px', textAlign: 'center' }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: isRejected ? 'var(--danger-bg)' : 'var(--warning-bg)',
          color: isRejected ? 'var(--danger)' : 'var(--warning)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          {isRejected ? <ShieldAlert size={36} /> : <Clock size={36} />}
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '12px' }}>
          {isRejected ? 'Application Not Approved' : 'Medical Profile Under Verification'}
        </h1>

        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '24px' }}>
          {isRejected
            ? `Your application for medical practitioner credentials could not be approved. Reason provided: "${user?.doctorProfile?.rejectionReason || 'Verification failed'}"`
            : `Hello Dr. ${user?.username}, thank you for registering with DocCare Connect. Our medical administrative committee is actively reviewing your credentials (Reg: ${user?.doctorProfile?.medicalRegNumber}). Verification typically completes within 24 business hours.`
          }
        </p>

        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          textAlign: 'left',
          marginBottom: '32px',
          border: '1px solid var(--border)'
        }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Application Summary
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.875rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Specialization:</span>
              <div style={{ fontWeight: 600 }}>{user?.doctorProfile?.specialization}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Experience:</span>
              <div style={{ fontWeight: 600 }}>{user?.doctorProfile?.experienceYears} Years</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Reg Number:</span>
              <div style={{ fontWeight: 600 }}>{user?.doctorProfile?.medicalRegNumber}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Status:</span>
              <div style={{ fontWeight: 700, color: isRejected ? 'var(--danger)' : 'var(--warning)' }}>
                {user?.doctorProfile?.approvalStatus}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={handleRefresh}
            disabled={checking}
            className="btn btn-primary"
            style={{ minWidth: '160px' }}
          >
            <RefreshCw size={16} className={checking ? 'animate-spin' : ''} />
            {checking ? 'Checking...' : 'Check Status'}
          </button>
          <button onClick={logout} className="btn btn-secondary">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
