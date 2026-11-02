import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Stethoscope, User, LogOut, LayoutDashboard } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getDashboardLink = () => {
    if (!user)
      return '/login';
    if (user.role === 'ADMIN')
      return '/admin/dashboard';
    if (user.role === 'DOCTOR') {
      return user.doctorProfile?.approvalStatus === 'APPROVED' ? '/doctor/dashboard' : '/doctor/pending-approval';
    }
    return '/patient/dashboard';
  };

  return (
    <nav
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 1.5rem',
          height: '70px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >

        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(15, 118, 110, 0.3)'
            }}
          >
            <Stethoscope size={22} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            DocCare<span style={{ color: 'var(--primary)' }}>Connect</span>
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link
            to="/patient/doctors"
            style={{
              fontWeight: 600,
              fontSize: '0.925rem',
              color: 'var(--text-primary)',
              transition: 'color 0.15s ease'
            }}
          >
            Find Doctors
          </Link>

          {
            user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate(getDashboardLink())}
                >
                  <LayoutDashboard size={16} /> Dashboard
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={logout}
                  title="Log out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Link to="/login" className="btn btn-secondary btn-sm">
                  <User size={16} /> Sign In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Get Started
                </Link>
              </div>
            )
          }
        </div>
      </div>
    </nav>
  );
};
