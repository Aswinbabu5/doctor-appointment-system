import { prisma } from '../config/db.js';

export class PrescriptionService {
  static async createPrescription({ appointmentId, doctorId, diagnosis, clinicalNotes, followUpDate, items }) {
    return await prisma.$transaction(async (tx) => {
      const appt = await tx.appointment.findUnique({
        where: { id: appointmentId },
        include: { prescription: true }
      });

      if (!appt) {
        const error = new Error('Appointment not found');
        error.status = 404;
        throw error;
      }

      if (appt.doctorId !== doctorId) {
        const error = new Error('Forbidden: Only the consulting doctor can issue this prescription');
        error.status = 403;
        throw error;
      }

      if (appt.prescription) {
        const error = new Error('A prescription has already been created for this appointment');
        error.status = 409;
        throw error;
      }

      // Automatically transition appointment to COMPLETED if not already
      if (appt.status !== 'COMPLETED') {
        await tx.appointment.update({
          where: { id: appointmentId },
          data: {
            status: 'COMPLETED',
            completedAt: new Date()
          }
        });

        await tx.appointmentHistory.create({
          data: {
            appointmentId,
            previousStatus: appt.status,
            newStatus: 'COMPLETED',
            changeReason: 'Prescription issued and consultation marked completed'
          }
        });
      }

      const prescription = await tx.prescription.create({
        data: {
          appointmentId,
          patientId: appt.patientId,
          doctorId,
          diagnosis,
          clinicalNotes: clinicalNotes || null,
          followUpDate: followUpDate ? new Date(followUpDate) : null,
          items: {
            create: items.map(item => ({
              medicineName: item.medicineName,
              dosage: item.dosage,
              frequency: item.frequency,
              duration: item.duration,
              instructions: item.instructions || null
            }))
          }
        },
        include: {
          items: true,
          appointment: true,
          doctor: {
            include: { user: { select: { username: true } } }
          }
        }
      });

      // Notify patient of new digital prescription
      await tx.notification.create({
        data: {
          userId: appt.patientId,
          appointmentId: appt.id,
          type: 'CONSULTATION_COMPLETED',
          title: 'Prescription Available',
          message: `Dr. ${prescription.doctor.user.username} has completed your consultation and issued your digital prescription.`
        }
      });

      return prescription;
    });
  }

  static async getAppointmentPrescription(appointmentId, user) {
    const prescription = await prisma.prescription.findUnique({
      where: { appointmentId },
      include: {
        items: true,
        doctor: {
          include: {
            user: { select: { username: true, email: true } }
          }
        },
        patient: {
          select: { id: true, username: true, email: true, phone: true }
        },
        appointment: true
      }
    });

    if (!prescription) {
      const error = new Error('No prescription found for this appointment');
      error.status = 404;
      throw error;
    }

    // Role-based privacy checks
    if (user.role === 'USER' && prescription.patientId !== user.id) {
      const error = new Error('Forbidden: You can only view your own prescriptions');
      error.status = 403;
      throw error;
    }

    if (user.role === 'DOCTOR' && user.doctorProfile && prescription.doctorId !== user.doctorProfile.id) {
      const error = new Error('Forbidden: You can only view prescriptions issued by yourself');
      error.status = 403;
      throw error;
    }

    return prescription;
  }

  static async getPatientPrescriptions(patientId) {
    return await prisma.prescription.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        doctor: {
          include: {
            user: { select: { username: true, email: true } }
          }
        },
        appointment: {
          select: {
            appointmentNumber: true,
            scheduledDate: true,
            startTime: true
          }
        }
      }
    });
  }
}
