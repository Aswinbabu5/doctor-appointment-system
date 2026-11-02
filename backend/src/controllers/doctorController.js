import { DoctorService } from '../services/doctorService.js';
import { parseParamId } from '../utils/params.js';
import { z } from 'zod';

export const updateDoctorSchema = z.object({
  body: z.object({
    specialization: z.string().optional(),
    qualifications: z.string().optional(),
    experienceYears: z.number().int().min(0).optional(),
    consultationFee: z.number().min(0).optional(),
    bio: z.string().optional(),
    avatarUrl: z.string().optional()
  })
});

export class DoctorController {
  static async getApprovedDoctors(req, res, next) {
    try {
      const result = await DoctorService.getApprovedDoctors(req.query);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getDoctorById(req, res, next) {
    try {
      const id = parseParamId(req.params.id, 'doctorId');
      const doctor = await DoctorService.getDoctorById(id);
      res.status(200).json({
        success: true,
        data: doctor
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateDoctorProfile(req, res, next) {
    try {
      const doctorId = req.user.doctorProfile?.id;
      if (!doctorId) {
        return res.status(403).json({
          success: false,
          message: 'Doctor profile required'
        });
      }

      const doctor = await DoctorService.updateDoctorProfile(doctorId, req.body);
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: doctor
      });
    } catch (error) {
      next(error);
    }
  }

  static async uploadDocument(req, res, next) {
    try {
      const doctorId = req.user.doctorProfile?.id;
      if (!doctorId) {
        return res.status(403).json({
          success: false,
          message: 'Doctor profile required'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a file to upload'
        });
      }

      const documentType = req.body.documentType || 'CERTIFICATE';
      const doc = await DoctorService.uploadDocument(doctorId, req.file, documentType);

      res.status(201).json({
        success: true,
        message: 'Document uploaded successfully',
        data: doc
      });
    } catch (error) {
      next(error);
    }
  }
}
