import { api } from './api'
import { ApiResponse, User, Doctor, DoctorProfile, AvailabilitySlot, Appointment, Prescription, NotificationItem, AppSettings } from '../types'

export const authApi = {
  registerPatient: async (data: any) => {
    const res = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/register', data)
    return res.data.data
  },
  registerDoctor: async (data: any) => {
    const res = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/register-doctor', data)
    return res.data.data
  },
  login: async (credentials: { email: string; password: string }) => {
    const res = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', credentials)
    return res.data.data
  },
  getMe: async () => {
    const res = await api.get<ApiResponse<User>>('/auth/me')
    return res.data.data
  }
}

export const doctorApi = {
  getDoctors: async (params?: {
    search?: string
    specialization?: string
    minFee?: number
    maxFee?: number
    sortBy?: string
    page?: number
    limit?: number
  }) => {
    const res = await api.get<ApiResponse>('/doctors', { params })
    return res.data
  },
  getDoctorById: async (id: number) => {
    const res = await api.get<ApiResponse<Doctor>>(`/doctors/${id}`)
    return res.data.data
  },
  updateProfile: async (data: Partial<DoctorProfile>) => {
    const res = await api.put<ApiResponse<Doctor>>('/doctors/profile', data)
    return res.data.data
  },
  uploadDocument: async (file: File, documentType = 'CERTIFICATE') => {
    const formData = new FormData()
    formData.append('document', file)
    formData.append('documentType', documentType)
    const res = await api.post<ApiResponse<any>>('/doctors/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data.data
  }
}

export const availabilityApi = {
  getDoctorSlots: async (doctorId: number, params?: { startDate?: string; endDate?: string; availableOnly?: boolean }) => {
    const res = await api.get<ApiResponse<AvailabilitySlot[]>>(`/availability/doctor/${doctorId}`, { params })
    return res.data.data
  },
  getMySlots: async (params?: { startDate?: string; endDate?: string }) => {
    const res = await api.get<ApiResponse<AvailabilitySlot[]>>('/availability/mine', { params })
    return res.data.data
  },
  createSlots: async (slots: Array<{ date: string; startTime: string; endTime: string }>) => {
    const res = await api.post<ApiResponse<AvailabilitySlot[]>>('/availability', { slots })
    return res.data.data
  },
  deleteSlot: async (slotId: number) => {
    const res = await api.delete<ApiResponse<{ message: string }>>(`/availability/${slotId}`)
    return res.data
  }
}

export const appointmentApi = {
  bookAppointment: async (data: { slotId: number; notes?: string }) => {
    const res = await api.post<ApiResponse<Appointment>>('/appointments/book', data)
    return res.data.data
  },
  rescheduleAppointment: async (appointmentId: number, newSlotId: number) => {
    const res = await api.post<ApiResponse<Appointment>>(`/appointments/${appointmentId}/reschedule`, { newSlotId })
    return res.data.data
  },
  cancelAppointment: async (appointmentId: number, reason: string) => {
    const res = await api.post<ApiResponse<Appointment>>(`/appointments/${appointmentId}/cancel`, { reason })
    return res.data.data
  },
  updateStatus: async (appointmentId: number, status: string, reason?: string) => {
    const res = await api.patch<ApiResponse<Appointment>>(`/appointments/${appointmentId}/status`, { status, reason })
    return res.data.data
  },
  getPatientAppointments: async (status?: string) => {
    const res = await api.get<ApiResponse<Appointment[]>>('/appointments/patient', { params: { status } })
    return res.data.data
  },
  getDoctorAppointments: async (params?: { status?: string; date?: string }) => {
    const res = await api.get<ApiResponse<Appointment[]>>('/appointments/doctor', { params })
    return res.data.data
  },
  getAppointmentById: async (appointmentId: number) => {
    const res = await api.get<ApiResponse<Appointment>>(`/appointments/${appointmentId}`)
    return res.data.data
  }
};

export const prescriptionApi = {
  createPrescription: async (data: {
    appointmentId: number
    diagnosis: string
    clinicalNotes?: string
    followUpDate?: string | null
    items: Array<{
      medicineName: string
      dosage: string
      frequency: string
      duration: string
      instructions?: string | null
    }>
  }) => {
    const res = await api.post<ApiResponse<Prescription>>('/prescriptions', data)
    return res.data.data
  },
  getPrescriptionByAppointment: async (appointmentId: number) => {
    const res = await api.get<ApiResponse<Prescription>>(`/prescriptions/appointment/${appointmentId}`)
    return res.data.data
  },
  getMyPrescriptions: async () => {
    const res = await api.get<ApiResponse<Prescription[]>>('/prescriptions/patient')
    return res.data.data
  }
}

export const notificationApi = {
  getNotifications: async (unreadOnly?: boolean) => {
    const res = await api.get<ApiResponse<NotificationItem[]>>('/notifications', {
      params: unreadOnly !== undefined ? { unreadOnly } : {}
    })
    return res.data
  },
  markAsRead: async (id: number) => {
    const res = await api.patch<ApiResponse<{ message: string }>>(`/notifications/${id}/read`)
    return res.data
  },
  markAllAsRead: async () => {
    const res = await api.post<ApiResponse<{ message: string }>>('/notifications/read-all')
    return res.data
  }
}

export const adminApi = {
  getMetrics: async () => {
    const res = await api.get<ApiResponse<any>>('/admin/metrics')
    return res.data.data
  },
  getPendingDoctors: async () => {
    const res = await api.get<ApiResponse<Doctor[]>>('/admin/doctors/pending')
    return res.data.data
  },
  approveDoctor: async (doctorId: number) => {
    const res = await api.patch<ApiResponse<Doctor>>(`/admin/doctors/${doctorId}/approve`)
    return res.data
  },
  rejectDoctor: async (doctorId: number, reason: string) => {
    const res = await api.patch<ApiResponse<Doctor>>(`/admin/doctors/${doctorId}/reject`, { reason })
    return res.data
  },
  getAllUsers: async (params?: { role?: string; search?: string; page?: number; limit?: number }) => {
    const res = await api.get<ApiResponse>('/admin/users', { params })
    return res.data
  },
  toggleUserActive: async (userId: number) => {
    const res = await api.patch<ApiResponse<{ id: number; email: string; isActive: boolean }>>(`/admin/users/${userId}/toggle-active`)
    return res.data
  },
  getAllAppointments: async (params?: any) => {
    const res = await api.get<ApiResponse>('/admin/appointments', { params })
    return res.data
  }
}

export const settingsApi = {
  getSettings: async () => {
    const res = await api.get<ApiResponse<AppSettings>>('/settings')
    return res.data.data
  },
  updateSettings: async (data: Partial<AppSettings>) => {
    const res = await api.put<ApiResponse<AppSettings>>('/settings', data)
    return res.data.data
  }
}
