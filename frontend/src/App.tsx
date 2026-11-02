import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'

import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { DoctorRegisterPage } from './pages/auth/DoctorRegisterPage'
import { PendingApprovalPage } from './pages/auth/PendingApprovalPage'
import { NotFoundPage } from './pages/NotFoundPage'

import { DashboardLayout } from './components/common/DashboardLayout'
import { PatientDashboard } from './pages/patient/PatientDashboard'
import { DoctorSearchPage } from './pages/patient/DoctorSearchPage'
import { DoctorDetailPage } from './pages/patient/DoctorDetailPage'
import { MyAppointmentsPage } from './pages/patient/MyAppointmentsPage'
import { PrescriptionsPage } from './pages/patient/PrescriptionsPage'

import { DoctorDashboard } from './pages/doctor/DoctorDashboard'
import { ScheduleManagementPage } from './pages/doctor/ScheduleManagementPage'
import { DoctorAppointmentsPage } from './pages/doctor/DoctorAppointmentsPage'
import { ConsultationPage } from './pages/doctor/ConsultationPage'
import { DoctorProfilePage } from './pages/doctor/DoctorProfilePage'

import { AdminDashboard } from './pages/admin/AdminDashboard'
import { DoctorApprovalPage } from './pages/admin/DoctorApprovalPage'
import { UserManagementPage } from './pages/admin/UserManagementPage'
import { AppointmentMonitoringPage } from './pages/admin/AppointmentMonitoringPage'
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 60 * 1000
    }
  }
})

const ProtectedRoute: React.FC<{ 
  children: React.ReactNode, 
  allowedRoles?: Array<'USER' | 'DOCTOR' | 'ADMIN'>, 
  requireApprovedDoctor?: boolean}> = ({ children, allowedRoles, requireApprovedDoctor = true }) => {
  const { user, isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their default home
    if (user.role === 'ADMIN') 
      return <Navigate to="/admin/dashboard" replace />
    if (user.role === 'DOCTOR') 
      return <Navigate to="/doctor/dashboard" replace />
      
    return <Navigate to="/patient/dashboard" replace />
  }

  // Doctor approval verification check
  if (user.role === 'DOCTOR' && requireApprovedDoctor && user.doctorProfile?.approvalStatus !== 'APPROVED') {
    return <Navigate to="/doctor/pending-approval" replace />
  }

  return <>{children}</>
}

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/register-doctor" element={<DoctorRegisterPage />} />
              <Route path="/dashboard" element={<Navigate to="/patient/dashboard" replace />} />
              <Route path="/doctor/pending-approval"
                element={
                  <ProtectedRoute allowedRoles={['DOCTOR']} requireApprovedDoctor={false}>
                    <PendingApprovalPage />
                  </ProtectedRoute>
                }/>

              <Route path="/patient"
                element={
                  <ProtectedRoute allowedRoles={['USER']}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }>
                <Route index element={<Navigate to="/patient/dashboard" replace />} />
                <Route path="dashboard" element={<PatientDashboard />} />
                <Route path="doctors" element={<DoctorSearchPage />} />
                <Route path="doctors/:id" element={<DoctorDetailPage />} />
                <Route path="appointments" element={<MyAppointmentsPage />} />
                <Route path="prescriptions" element={<PrescriptionsPage />} />
              </Route>

              <Route path="/doctor"
                element={
                  <ProtectedRoute allowedRoles={['DOCTOR']}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }>
                <Route index element={<Navigate to="/doctor/dashboard" replace />} />
                <Route path="dashboard" element={<DoctorDashboard />} />
                <Route path="schedule" element={<ScheduleManagementPage />} />
                <Route path="appointments" element={<DoctorAppointmentsPage />} />
                <Route path="consultations/:id" element={<ConsultationPage />} />
                <Route path="profile" element={<DoctorProfilePage />} />
              </Route>

              <Route path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="doctor-approvals" element={<DoctorApprovalPage />} />
                <Route path="users" element={<UserManagementPage />} />
                <Route path="appointments" element={<AppointmentMonitoringPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  )
}

export default App
