import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  Search,
  FileText,
  UserCheck,
  Users,
  Settings,
  Clock,
  User,
  Stethoscope,
  LogOut
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  if (!user)
    return null;

  const role = user.role;

  const patientNav = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      to: '/patient/doctors',
      label: 'Find Doctors',
      icon: Search
    },
    {
      to: '/patient/appointments',
      label: 'My Appointments',
      icon: Calendar
    },
    {
      to: '/patient/prescriptions',
      label: 'My Prescriptions',
      icon: FileText
    }
  ];

  const doctorNav = [
    {
      to: '/doctor',
      label: 'Overview',
      icon: LayoutDashboard
    },
    {
      to: '/doctor/schedule',
      label: 'Schedule & Slots',
      icon: Clock
    },
    {
      to: '/doctor/appointments',
      label: 'Appointments',
      icon: Calendar
    },
    {
      to: '/doctor/profile',
      label: 'Doctor Profile',
      icon: User
    }
  ];

  const adminNav = [
    {
      to: '/admin',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      to: '/admin/doctor-approvals',
      label: 'Doctor Approvals',
      icon: UserCheck
    },
    {
      to: '/admin/users',
      label: 'User Management',
      icon: Users
    },
    {
      to: '/admin/appointments',
      label: 'Appointments',
      icon: Calendar
    },
    {
      to: '/admin/settings',
      label: 'Settings',
      icon: Settings
    }
  ];

  const navItems = role === 'ADMIN' ? adminNav : role === 'DOCTOR' ? doctorNav : patientNav;

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        backgroundColor: 'var(--bg-sidebar)',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        boxShadow: 'var(--shadow-md)',
        flexShrink: 0
      }}
    >
      <div
        style={{
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          borderBottom: '1px solid #1E293B'
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--primary)',
            color: '#ffffff',
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Stethoscope size={20} />
        </div>
        <Link to="/" style={{ color: '#ffffff', fontWeight: 800, fontSize: '1.15rem' }}>
          DocCare<span style={{ color: '#2DD4BF' }}>Connect</span>
        </Link>
      </div>

      <div style={{ padding: '1rem 1.5rem 0.5rem' }}>
        <span
          style={{
            display: 'inline-block',
            backgroundColor: '#1E293B',
            color: '#94A3B8',
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '0.2rem 0.6rem',
            borderRadius: 'var(--radius-full)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em'
          }}
        >
          {role === 'ADMIN' ? 'Administrator' : role === 'DOCTOR' ? 'Doctor Portal' : 'Patient Portal'}
        </span>
      </div>

      <nav style={{ flex: 1, padding: '0.5rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {
          navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard' || item.to === '/doctor' || item.to === '/admin'}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.7rem 0.95rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.925rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#ffffff' : '#94A3B8',
                  backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                  transition: 'all 0.15s ease'
                })}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })
        }
      </nav>

      <div
        style={{
          padding: '1.25rem',
          borderTop: '1px solid #1E293B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#1E293B',
              color: '#2DD4BF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.9rem',
              flexShrink: 0
            }}
          >
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div
              style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#ffffff',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden'
              }}
            >
              {user.username}
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                color: '#64748B',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden'
              }}
            >
              {user.email}
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          title="Sign out"
          style={{
            color: '#94A3B8',
            padding: '0.4rem',
            borderRadius: 'var(--radius-sm)',
            transition: 'color 0.15s ease'
          }}
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
};
