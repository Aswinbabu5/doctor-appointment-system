import { AppointmentService } from '../services/appointmentService.js';
import { parseParamId } from '../utils/params.js';
import { z } from 'zod';

export const bookAppointmentSchema = z.object({
  body: z.object({
    slotId: z.number().int().positive('Valid slotId is required'),
    notes: z.string().optional()
  })
});

export const rescheduleSchema = z.object({
  body: z.object({
    newSlotId: z.number().int().positive('Valid newSlotId is required')
  })
});

export const cancelSchema = z.object({
  body: z.object({
    reason: z.string().min(3, 'Cancellation reason is required')
  })
});

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
    reason: z.string().optional()
  })
});

export class AppointmentController {
  static async bookAppointment(req, res, next) {
    try {
      const { slotId, notes } = req.body;
      const appointment = await AppointmentService.bookAppointment({
        patientId: req.user.id,
        slotId,
        notes
      });

      res.status(201).json({
        success: true,
        message: 'Appointment booked successfully',
        data: appointment
      });
    } catch (error) {
      next(error);
    }
  }

  static async rescheduleAppointment(req, res, next) {
    try {
      const appointmentId = parseParamId(req.params.id, 'appointmentId');
      const { newSlotId } = req.body;

      const updated = await AppointmentService.rescheduleAppointment({
        appointmentId,
        newSlotId,
        requestedByUserId: req.user.id
      });

      res.status(200).json({
        success: true,
        message: 'Appointment rescheduled successfully',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }

  static async cancelAppointment(req, res, next) {
    try {
      const appointmentId = parseParamId(req.params.id, 'appointmentId');
      const { reason } = req.body;

      const updated = await AppointmentService.cancelAppointment({
        appointmentId,
        reason,
        cancelledByUserId: req.user.id,
        role: req.user.role
      });

      res.status(200).json({
        success: true,
        message: 'Appointment cancelled successfully',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const appointmentId = parseParamId(req.params.id, 'appointmentId');
      const { status, reason } = req.body;

      const updated = await AppointmentService.updateStatus(
        appointmentId,
        status,
        req.user.id,
        reason
      );

      res.status(200).json({
        success: true,
        message: `Appointment status updated to ${status}`,
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPatientAppointments(req, res, next) {
    try {
      const { status } = req.query;
      const appointments = await AppointmentService.getPatientAppointments(req.user.id, status);
      res.status(200).json({
        success: true,
        data: appointments
      });
    } catch (error) {
      next(error);
    }
  }

  static async getDoctorAppointments(req, res, next) {
    try {
      const doctorId = req.user.doctorProfile?.id;
      if (!doctorId) {
        return res.status(403).json({ success: false, message: 'Doctor profile required' });
      }

      const { status, date } = req.query;
      const appointments = await AppointmentService.getDoctorAppointments(doctorId, status, date);
      res.status(200).json({
        success: true,
        data: appointments
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAppointmentById(req, res, next) {
    try {
      const appointmentId = parseParamId(req.params.id, 'appointmentId');
      const appointment = await AppointmentService.getAppointmentById(appointmentId, req.user);
      res.status(200).json({
        success: true,
        data: appointment
      });
    } catch (error) {
      next(error);
    }
  }
}
