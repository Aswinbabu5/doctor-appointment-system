import { prisma } from '../config/db.js';
import { calculateFeeBreakdown } from '../utils/feeCalculator.js';

export class AppointmentService {
  static generateAppointmentNumber() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'DOC-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  static async bookAppointment({ patientId, slotId, notes }) {
    // Fetch active app settings for commission
    const settings = await prisma.appSetting.findFirst() || {
      commissionType: 'PERCENTAGE',
      commissionValue: 10,
      cancellationCutoffHours: 24
    };

    // Atomic transaction for double-booking prevention
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch slot with lock/isolation
      const slot = await tx.availabilitySlot.findUnique({
        where: { id: slotId },
        include: {
          doctor: {
            include: { user: true }
          }
        }
      });

      if (!slot) {
        const error = new Error('Selected availability slot does not exist');
        error.status = 404;
        throw error;
      }

      if (slot.isBooked || slot.isCancelled) {
        const error = new Error('This time slot has already been booked by another patient. Please select another slot.');
        error.status = 409;
        throw error;
      }

      if (slot.doctor.approvalStatus !== 'APPROVED') {
        const error = new Error('Doctor is not currently approved for consultations');
        error.status = 400;
        throw error;
      }

      if (slot.startTimestamp <= new Date()) {
        const error = new Error('Cannot book an appointment for a past time slot');
        error.status = 400;
        throw error;
      }

      // Check if patient already has an active appointment in this exact slot
      const existingPatientAppt = await tx.appointment.findFirst({
        where: {
          patientId,
          slotId,
          status: { in: ['BOOKED', 'IN_PROGRESS'] }
        }
      });

      if (existingPatientAppt) {
        const error = new Error('You already have an appointment scheduled for this time slot');
        error.status = 409;
        throw error;
      }

      // Calculate fee breakdown
      const feeDetails = calculateFeeBreakdown({
        doctorFee: slot.doctor.consultationFee,
        commissionType: settings.commissionType,
        commissionValue: settings.commissionValue
      });

      // Mark slot as booked
      await tx.availabilitySlot.update({
        where: { id: slotId },
        data: { isBooked: true }
      });

      const appointmentNumber = AppointmentService.generateAppointmentNumber();

      // Create appointment record
      const appointment = await tx.appointment.create({
        data: {
          appointmentNumber,
          patientId,
          doctorId: slot.doctorId,
          slotId: slot.id,
          scheduledDate: slot.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          scheduledTimestamp: slot.startTimestamp,
          status: 'BOOKED',
          doctorFee: feeDetails.doctorFee,
          commissionType: feeDetails.commissionType,
          commissionRate: feeDetails.commissionRate,
          commissionAmount: feeDetails.commissionAmount,
          totalAmount: feeDetails.totalAmount,
          notes: notes || null
        },
        include: {
          doctor: {
            include: { user: true }
          },
          patient: true,
          slot: true
        }
      });

      // Log status transition history
      await tx.appointmentHistory.create({
        data: {
          appointmentId: appointment.id,
          previousStatus: null,
          newStatus: 'BOOKED',
          changeReason: 'Initial appointment booking',
          changedByUserId: patientId
        }
      });

      // In-app notification for patient
      await tx.notification.create({
        data: {
          userId: patientId,
          appointmentId: appointment.id,
          type: 'BOOKING_CONFIRMATION',
          title: 'Appointment Confirmed',
          message: `Your appointment with Dr. ${slot.doctor.user.username} is scheduled for ${appointment.startTime} on ${new Date(slot.date).toLocaleDateString()}.`
        }
      });

      // In-app notification for doctor
      await tx.notification.create({
        data: {
          userId: slot.doctor.userId,
          appointmentId: appointment.id,
          type: 'BOOKING_CONFIRMATION',
          title: 'New Consultation Booked',
          message: `Patient ${appointment.patient.username} has booked an appointment for ${appointment.startTime} on ${new Date(slot.date).toLocaleDateString()}.`
        }
      });

      // Schedule reminder jobs: 24h, 1h, 15m
      const scheduledMs = slot.startTimestamp.getTime();
      const jobs = [
        { type: 'REMINDER_24H', beforeHours: 24 },
        { type: 'REMINDER_1H', beforeHours: 1 },
        { type: 'REMINDER_15M', beforeHours: 0.25 }
      ];

      for (const j of jobs) {
        const runAt = new Date(scheduledMs - j.beforeHours * 60 * 60 * 1000);
        if (runAt > new Date()) {
          await tx.notificationJob.create({
            data: {
              appointmentId: appointment.id,
              userId: patientId,
              type: j.type,
              scheduledFor: runAt,
              status: 'PENDING'
            }
          });
        }
      }

      return appointment;
    });

    return result;
  }

  static async rescheduleAppointment({ appointmentId, newSlotId, requestedByUserId }) {
    const settings = await prisma.appSetting.findFirst() || { cancellationCutoffHours: 24 };
    const cutoffHours = settings.cancellationCutoffHours || 24;

    return await prisma.$transaction(async (tx) => {
      const appt = await tx.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          doctor: { include: { user: true } },
          patient: true
        }
      });

      if (!appt) {
        const error = new Error('Appointment not found');
        error.status = 404;
        throw error;
      }

      if (appt.status !== 'BOOKED') {
        const error = new Error(`Cannot reschedule an appointment in ${appt.status} status`);
        error.status = 400;
        throw error;
      }

      // Check 24-hour cutoff rule
      const now = new Date().getTime();
      const scheduledTime = appt.scheduledTimestamp.getTime();
      const hoursUntilAppt = (scheduledTime - now) / (1000 * 60 * 60);

      if (hoursUntilAppt < cutoffHours) {
        const error = new Error(`Rescheduling is restricted within ${cutoffHours} hours of the scheduled time. Remaining time: ${Math.max(0, hoursUntilAppt.toFixed(1))} hours.`);
        error.status = 400;
        throw error;
      }

      // Check new slot availability
      const newSlot = await tx.availabilitySlot.findUnique({
        where: { id: newSlotId }
      });

      if (!newSlot || newSlot.doctorId !== appt.doctorId) {
        const error = new Error('New slot does not exist or does not belong to the same doctor');
        error.status = 400;
        throw error;
      }

      if (newSlot.isBooked || newSlot.isCancelled) {
        const error = new Error('The selected new time slot is not available');
        error.status = 409;
        throw error;
      }

      if (newSlot.startTimestamp <= new Date()) {
        const error = new Error('Cannot reschedule to a past time slot');
        error.status = 400;
        throw error;
      }

      // Release old slot
      await tx.availabilitySlot.update({
        where: { id: appt.slotId },
        data: { isBooked: false }
      });

      // Book new slot
      await tx.availabilitySlot.update({
        where: { id: newSlotId },
        data: { isBooked: true }
      });

      // Invalidate existing pending reminder jobs
      await tx.notificationJob.updateMany({
        where: {
          appointmentId: appt.id,
          status: 'PENDING'
        },
        data: { status: 'CANCELLED' }
      });

      // Update appointment
      const updated = await tx.appointment.update({
        where: { id: appt.id },
        data: {
          slotId: newSlot.id,
          scheduledDate: newSlot.date,
          startTime: newSlot.startTime,
          endTime: newSlot.endTime,
          scheduledTimestamp: newSlot.startTimestamp
        },
        include: {
          doctor: { include: { user: true } },
          slot: true
        }
      });

      // History
      await tx.appointmentHistory.create({
        data: {
          appointmentId: appt.id,
          previousStatus: 'BOOKED',
          newStatus: 'BOOKED',
          changeReason: `Rescheduled to ${newSlot.startTime} on ${new Date(newSlot.date).toLocaleDateString()}`,
          changedByUserId: requestedByUserId
        }
      });

      // Schedule new reminder jobs
      const scheduledMs = newSlot.startTimestamp.getTime();
      const jobs = [
        { type: 'REMINDER_24H', beforeHours: 24 },
        { type: 'REMINDER_1H', beforeHours: 1 },
        { type: 'REMINDER_15M', beforeHours: 0.25 }
      ];

      for (const j of jobs) {
        const runAt = new Date(scheduledMs - j.beforeHours * 60 * 60 * 1000);
        if (runAt > new Date()) {
          await tx.notificationJob.create({
            data: {
              appointmentId: appt.id,
              userId: appt.patientId,
              type: j.type,
              scheduledFor: runAt,
              status: 'PENDING'
            }
          });
        }
      }

      // Notifications
      await tx.notification.create({
        data: {
          userId: appt.patientId,
          appointmentId: appt.id,
          type: 'RESCHEDULE_CONFIRMATION',
          title: 'Appointment Rescheduled',
          message: `Your appointment with Dr. ${appt.doctor.user.username} has been rescheduled to ${newSlot.startTime} on ${new Date(newSlot.date).toLocaleDateString()}.`
        }
      });

      return updated;
    });
  }

  static async cancelAppointment({ appointmentId, reason, cancelledByUserId, role }) {
    const settings = await prisma.appSetting.findFirst() || { cancellationCutoffHours: 24 };
    const cutoffHours = settings.cancellationCutoffHours || 24;

    return await prisma.$transaction(async (tx) => {
      const appt = await tx.appointment.findUnique({
        where: { id: appointmentId },
        include: { doctor: { include: { user: true } } }
      });

      if (!appt) {
        const error = new Error('Appointment not found');
        error.status = 404;
        throw error;
      }

      if (['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(appt.status)) {
        const error = new Error(`Cannot cancel appointment already in ${appt.status} status`);
        error.status = 400;
        throw error;
      }

      // Check 24-hour cutoff rule for patients (doctors/admins can cancel anytime)
      if (role === 'USER') {
        const now = new Date().getTime();
        const scheduledTime = appt.scheduledTimestamp.getTime();
        const hoursUntilAppt = (scheduledTime - now) / (1000 * 60 * 60);

        if (hoursUntilAppt < cutoffHours) {
          const error = new Error(`Cancellation is restricted within ${cutoffHours} hours of the appointment time.`);
          error.status = 400;
          throw error;
        }
      }

      // Release slot
      await tx.availabilitySlot.update({
        where: { id: appt.slotId },
        data: { isBooked: false }
      });

      // Cancel pending jobs
      await tx.notificationJob.updateMany({
        where: {
          appointmentId: appt.id,
          status: 'PENDING'
        },
        data: { status: 'CANCELLED' }
      });

      // Update appointment status
      const updated = await tx.appointment.update({
        where: { id: appt.id },
        data: {
          status: 'CANCELLED',
          cancellationReason: reason,
          cancelledAt: new Date()
        }
      });

      // Log history
      await tx.appointmentHistory.create({
        data: {
          appointmentId: appt.id,
          previousStatus: appt.status,
          newStatus: 'CANCELLED',
          changeReason: reason || 'Cancelled by user',
          changedByUserId: cancelledByUserId
        }
      });

      // Notify other party
      const notifyUserId = role === 'USER' ? appt.doctor.userId : appt.patientId;
      await tx.notification.create({
        data: {
          userId: notifyUserId,
          appointmentId: appt.id,
          type: 'SYSTEM',
          title: 'Appointment Cancelled',
          message: `Appointment ${appt.appointmentNumber} has been cancelled. Reason: ${reason || 'No reason specified'}`
        }
      });

      return updated;
    });
  }

  static async updateStatus(appointmentId, newStatus, changedByUserId, reason = null) {
    const validTransitions = {
      BOOKED: ['IN_PROGRESS', 'CANCELLED', 'NO_SHOW'],
      IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: [],
      NO_SHOW: []
    };

    return await prisma.$transaction(async (tx) => {
      const appt = await tx.appointment.findUnique({
        where: { id: appointmentId }
      });

      if (!appt) {
        const error = new Error('Appointment not found');
        error.status = 404;
        throw error;
      }

      const allowed = validTransitions[appt.status] || [];
      if (!allowed.includes(newStatus)) {
        const error = new Error(`Invalid status transition from ${appt.status} to ${newStatus}`);
        error.status = 400;
        throw error;
      }

      const updateData = { status: newStatus };
      if (newStatus === 'COMPLETED') {
        updateData.completedAt = new Date();
      }

      const updated = await tx.appointment.update({
        where: { id: appointmentId },
        data: updateData
      });

      await tx.appointmentHistory.create({
        data: {
          appointmentId,
          previousStatus: appt.status,
          newStatus,
          changeReason: reason || `Status updated to ${newStatus}`,
          changedByUserId
        }
      });

      return updated;
    });
  }

  static async getPatientAppointments(patientId, statusFilter = null) {
    const where = { patientId };
    if (statusFilter) {
      where.status = statusFilter;
    }

    return await prisma.appointment.findMany({
      where,
      orderBy: { scheduledTimestamp: 'desc' },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                username: true,
                email: true,
                phone: true
              }
            }
          }
        },
        slot: true,
        prescription: {
          include: { items: true }
        }
      }
    });
  }

  static async getDoctorAppointments(doctorId, statusFilter = null, date = null) {
    const where = { doctorId };
    if (statusFilter) {
      where.status = statusFilter;
    }
    if (date) {
      where.scheduledDate = new Date(date);
    }

    return await prisma.appointment.findMany({
      where,
      orderBy: { scheduledTimestamp: 'asc' },
      include: {
        patient: {
          select: {
            id: true,
            username: true,
            email: true,
            phone: true
          }
        },
        slot: true,
        prescription: {
          include: { items: true }
        }
      }
    });
  }

  static async getAppointmentById(appointmentId, user) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: {
          select: { id: true, username: true, email: true, phone: true }
        },
        doctor: {
          include: {
            user: { select: { username: true, email: true, phone: true } }
          }
        },
        slot: true,
        prescription: {
          include: { items: true }
        },
        history: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!appointment) {
      const error = new Error('Appointment not found');
      error.status = 404;
      throw error;
    }

    // Access authorization check
    if (user.role === 'USER' && appointment.patientId !== user.id) {
      const error = new Error('Forbidden: You can only view your own appointments');
      error.status = 403;
      throw error;
    }

    if (user.role === 'DOCTOR' && user.doctorProfile && appointment.doctorId !== user.doctorProfile.id) {
      const error = new Error('Forbidden: You can only view your own doctor appointments');
      error.status = 403;
      throw error;
    }

    return appointment;
  }
}
