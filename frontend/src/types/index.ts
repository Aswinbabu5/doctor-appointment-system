export type Role = 'USER' | 'DOCTOR' | 'ADMIN'
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type AppointmentStatus = 'BOOKED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
export type CommissionType = 'PERCENTAGE' | 'FIXED'

export interface User {
  id: number
  email: string
  username: string
  phone?: string
  role: Role
  isActive: boolean
  createdAt: string
  doctorProfile?: DoctorProfile | null
}

export interface DoctorDocument {
  id: number
  doctorId?: number
  originalName: string
  fileKey: string
  filePath: string
  mimeType: string
  fileSize: number
  documentType: string
  createdAt: string
}

export interface DoctorProfile {
  id: number
  userId: number
  specialization: string
  qualifications: string
  medicalRegNumber: string
  experienceYears: number
  consultationFee: number | string
  bio?: string | null
  avatarUrl?: string | null
  approvalStatus: ApprovalStatus
  rejectionReason?: string | null
  approvedAt?: string | null
  rejectedAt?: string | null
  createdAt?: string
  user?: {
    id?: number
    username: string
    email: string
    phone?: string
    isActive?: boolean
  }
  documents?: DoctorDocument[]
  availabilitySlots?: AvailabilitySlot[]
}

export interface Doctor extends DoctorProfile {
  user: {
    id: number
    username: string
    email: string
    phone?: string
    isActive?: boolean
    createdAt?: string
  };
}

export interface AvailabilitySlot {
  id: number
  doctorId: number
  date: string
  startTime: string
  endTime: string
  startTimestamp: string
  endTimestamp: string
  durationMinutes: number
  isBooked: boolean
  isCancelled?: boolean
  doctor?: DoctorProfile
  appointment?: {
    id: number
    appointmentNumber: string
    status: AppointmentStatus
    patient: {
      id: number
      username: string
      phone?: string
      email?: string
    }
  } | null
}

export interface Appointment {
  id: number
  appointmentNumber: string
  patientId: number
  doctorId: number
  slotId: number
  scheduledDate: string
  startTime: string
  endTime: string
  scheduledTimestamp: string
  status: AppointmentStatus
  doctorFee: number | string
  commissionType: CommissionType
  commissionRate: number | string
  commissionAmount: number | string
  totalAmount: number | string
  notes?: string | null
  cancellationReason?: string | null
  cancelledAt?: string | null
  completedAt?: string | null
  createdAt: string
  doctor: {
    id: number
    specialization: string
    qualifications: string
    consultationFee: number | string
    user: {
      id?: number
      username: string
      email: string
      phone?: string
    }
  }
  patient: {
    id: number
    username: string
    email: string
    phone?: string
  }
  slot?: AvailabilitySlot
  prescription?: Prescription | null
}

export interface PrescriptionItem {
  id?: number
  medicineName: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string | null
}

export interface Prescription {
  id: number
  appointmentId: number
  patientId: number
  doctorId: number
  diagnosis: string
  clinicalNotes?: string | null
  followUpDate?: string | null
  createdAt: string
  items: PrescriptionItem[]
  doctor: {
    id?: number
    specialization?: string
    user: {
      id?: number
      username: string
      email?: string
      phone?: string
    }
  }
  patient?: {
    id: number
    username: string
    email: string
    phone?: string
  }
  appointment: {
    id?: number
    appointmentNumber: string
    scheduledDate: string
    startTime: string
  }
}

export interface NotificationItem {
  id: number
  userId: number
  appointmentId?: number | null
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
}

export interface AppSettings {
  id: number
  appName: string
  logoUrl?: string | null
  commissionType: CommissionType
  commissionValue: number | string
  currency: string
  currencySymbol: string
  supportEmail: string
  cancellationCutoffHours: number
}

export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data: T
  doctors?: Doctor[]
  users?: User[]
  appointments?: Appointment[]
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  errors?: Array<{ field: string; message: string }>
}
