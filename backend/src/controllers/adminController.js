import { AdminService } from '../services/adminService.js';
import { parseParamId } from '../utils/params.js';
import { z } from 'zod';

export const rejectDoctorSchema = z.object({
  body: z.object({
    reason: z.string().min(5, 'Rejection reason must be at least 5 characters')
  })
});

export class AdminController {
  static async getDashboardMetrics(req, res, next) {
    try {
      const data = await AdminService.getDashboardMetrics();
      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPendingDoctors(req, res, next) {
    try {
      const doctors = await AdminService.getPendingDoctors();
      res.status(200).json({
        success: true,
        data: doctors
      });
    } catch (error) {
      next(error);
    }
  }

  static async approveDoctor(req, res, next) {
    try {
      const doctorId = parseParamId(req.params.id, 'doctorId');
      const doctor = await AdminService.approveDoctor(doctorId);
      res.status(200).json({
        success: true,
        message: 'Doctor approved successfully',
        data: doctor
      });
    } catch (error) {
      next(error);
    }
  }

  static async rejectDoctor(req, res, next) {
    try {
      const doctorId = parseParamId(req.params.id, 'doctorId');
      const { reason } = req.body;
      const doctor = await AdminService.rejectDoctor(doctorId, reason);
      res.status(200).json({
        success: true,
        message: 'Doctor application rejected',
        data: doctor
      });
    } catch (error) {
      next(error);
    }
  }

  static async toggleUserActive(req, res, next) {
    try {
      const userId = parseParamId(req.params.id, 'userId');
      const user = await AdminService.toggleUserActive(userId);
      res.status(200).json({
        success: true,
        message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
        data: {
          id: user.id,
          email: user.email,
          isActive: user.isActive
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllUsers(req, res, next) {
    try {
      const result = await AdminService.getAllUsers(req.query);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllAppointments(req, res, next) {
    try {
      const result = await AdminService.getAllAppointments(req.query);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }
}
