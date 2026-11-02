import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { NotificationBell } from './NotificationBell';

interface HeaderProps {
  title: string;
  // subtitle?: string;
  action?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, action }) => {
  const { user } = useAuth();

  return (
    <header
      style={{
        height: 'var(--header-height)',
        // height: '45px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border)',
        padding: '0 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>{title}</h1>
        {/* {
          subtitle && (
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>{subtitle}</p>
          )
        } */}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {action}
        <NotificationBell />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.875rem',
              border: '1px solid var(--primary-border)'
            }}
          >
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.username}</span>
        </div>
      </div>
    </header>
  );
};
