import { prisma } from '../config/db.js';

export class AdminService {
  static async getDashboardMetrics() {
    const [
      totalPatients,
      totalDoctors,
      pendingDoctors,
      totalAppointments,
      completedAppointments,
      cancelledAppointments,
      revenueResult,
      recentAppointments
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.doctor.count({ where: { approvalStatus: 'APPROVED' } }),
      prisma.doctor.count({ where: { approvalStatus: 'PENDING' } }),
      prisma.appointment.count(),
      prisma.appointment.count({ where: { status: 'COMPLETED' } }),
      prisma.appointment.count({ where: { status: 'CANCELLED' } }),
      prisma.appointment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: {
          doctorFee: true,
          commissionAmount: true,
          totalAmount: true
        }
      }),
      prisma.appointment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: { select: { username: true, email: true } },
          doctor: { include: { user: { select: { username: true } } } }
        }
      })
    ]);

    return {
      metrics: {
        totalPatients,
        totalDoctors,
        pendingDoctors,
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        totalCommissionEarned: revenueResult._sum.commissionAmount || 0,
        totalVolume: revenueResult._sum.totalAmount || 0
      },
      recentAppointments
    };
  }

  static async getPendingDoctors() {
    return await prisma.doctor.findMany({
      where: { approvalStatus: 'PENDING' },
      include: {
        user: { select: { id: true, username: true, email: true, phone: true, createdAt: true } },
        documents: true
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  static async approveDoctor(doctorId) {
    const doctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        approvalStatus: 'APPROVED',
        approvedAt: new Date(),
        rejectionReason: null
      },
      include: { user: true }
    });

    // Notify doctor
    await prisma.notification.create({
      data: {
        userId: doctor.userId,
        type: 'APPROVAL_UPDATE',
        title: 'Profile Approved!',
        message: 'Congratulations! Your medical profile has been verified and approved by the admin. You may now publish availability slots and receive bookings.'
      }
    });

    return doctor;
  }

  static async rejectDoctor(doctorId, reason) {
    const doctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        approvalStatus: 'REJECTED',
        rejectedAt: new Date(),
        rejectionReason: reason
      },
      include: { user: true }
    });

    // Notify doctor
    await prisma.notification.create({
      data: {
        userId: doctor.userId,
        type: 'APPROVAL_UPDATE',
        title: 'Profile Application Status',
        message: `Your medical profile application was reviewed and could not be approved. Reason: ${reason}`
      }
    });

    return doctor;
  }

  static async toggleUserActive(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    if (user.role === 'ADMIN') {
      const error = new Error('Cannot toggle status of admin user');
      error.status = 400;
      throw error;
    }

    return await prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive }
    });
  }

  static async getAllUsers({ role, search, page = 1, limit = 20 }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 20);
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { username: { contains: search } },
        { email: { contains: search } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: { doctorProfile: true }
      }),
      prisma.user.count({ where })
    ]);

    return {
      users: users.map(({ passwordHash: _, ...u }) => u),
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  }

  static async getAllAppointments({ status, doctorId, patientId, date, page = 1, limit = 20 }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 20);
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (status) where.status = status;
    if (doctorId) where.doctorId = parseInt(doctorId, 10);
    if (patientId) where.patientId = parseInt(patientId, 10);
    if (date) where.scheduledDate = new Date(date);

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { scheduledTimestamp: 'desc' },
        include: {
          patient: { select: { username: true, email: true, phone: true } },
          doctor: { include: { user: { select: { username: true, email: true } } } },
          slot: true
        }
      }),
      prisma.appointment.count({ where })
    ]);

    return {
      appointments,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  }
}
