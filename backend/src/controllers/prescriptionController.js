import { PrescriptionService } from '../services/prescriptionService.js';
import { parseParamId } from '../utils/params.js';
import { z } from 'zod';

export const createPrescriptionSchema = z.object({
  body: z.object({
    appointmentId: z.number().int().positive(),
    diagnosis: z.string().min(2, 'Diagnosis is required'),
    clinicalNotes: z.string().optional(),
    followUpDate: z.string().optional(),
    items: z.array(z.object({
      medicineName: z.string().min(1, 'Medicine name is required'),
      dosage: z.string().min(1, 'Dosage is required (e.g. 500mg)'),
      frequency: z.string().min(1, 'Frequency is required (e.g. 1-0-1)'),
      duration: z.string().min(1, 'Duration is required (e.g. 5 days)'),
      instructions: z.string().optional()
    })).min(1, 'At least one medication item is required')
  })
});

export class PrescriptionController {
  static async createPrescription(req, res, next) {
    try {
      const doctorId = req.user.doctorProfile?.id;
      if (!doctorId) {
        return res.status(403).json({ success: false, message: 'Doctor profile required' });
      }

      const { appointmentId, diagnosis, clinicalNotes, followUpDate, items } = req.body;
      const prescription = await PrescriptionService.createPrescription({
        appointmentId,
        doctorId,
        diagnosis,
        clinicalNotes,
        followUpDate,
        items
      });

      res.status(201).json({
        success: true,
        message: 'Prescription created and consultation marked completed successfully',
        data: prescription
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAppointmentPrescription(req, res, next) {
    try {
      const appointmentId = parseParamId(req.params.appointmentId, 'appointmentId');
      const prescription = await PrescriptionService.getAppointmentPrescription(appointmentId, req.user);
      res.status(200).json({
        success: true,
        data: prescription
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyPrescriptions(req, res, next) {
    try {
      const prescriptions = await PrescriptionService.getPatientPrescriptions(req.user.id);
      res.status(200).json({
        success: true,
        data: prescriptions
      });
    } catch (error) {
      next(error);
    }
  }
}
