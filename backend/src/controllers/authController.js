import { AuthService } from '../services/authService.js';
import { z } from 'zod';

export const registerUserSchema = z.object({
  body: z.object({
    username: z.string().min(2, 'Full name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional()
  })
});

export const registerDoctorSchema = z.object({
  body: z.object({
    username: z.string().min(2, 'Full name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional(),
    specialization: z.string().min(2, 'Specialization is required'),
    qualifications: z.string().min(2, 'Qualifications are required'),
    medicalRegNumber: z.string().min(2, 'Medical registration number is required'),
    experienceYears: z.coerce.number().int().min(0, 'Experience years must be positive'),
    consultationFee: z.coerce.number().min(0, 'Consultation fee must be non-negative'),
    bio: z.string().optional()
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
  })
});

export class AuthController {
  static async registerUser(req, res, next) {
    try {
      const result = await AuthService.registerUser(req.body);
      res.status(201).json({
        success: true,
        message: 'Account registered successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async registerDoctor(req, res, next) {
    try {
      const result = await AuthService.registerDoctor(req.body);
      res.status(201).json({
        success: true,
        message: 'Doctor account registered successfully and is pending admin approval',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req, res, next) {
    try {
      const user = await AuthService.getMe(req.user.id);
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }
}
