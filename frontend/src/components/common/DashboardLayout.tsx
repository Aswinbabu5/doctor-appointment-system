import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Outlet } from 'react-router-dom';

interface DashboardLayoutProps {
  title?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  title,
  action,
  children
}) => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header title={title || ''} action={action} />
        <main className="page-body">{children || <Outlet />}</main>
      </div>
    </div>
  );
};
