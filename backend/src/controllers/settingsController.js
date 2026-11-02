import { SettingsService } from '../services/settingsService.js';
import { z } from 'zod';

export const updateSettingsSchema = z.object({
  body: z.object({
    appName: z.string().min(2).optional(),
    logoUrl: z.string().optional(),
    commissionType: z.enum(['PERCENTAGE', 'FIXED']).optional(),
    commissionValue: z.number().min(0).optional(),
    currency: z.string().optional(),
    currencySymbol: z.string().optional(),
    supportEmail: z.string().email().optional(),
    cancellationCutoffHours: z.number().int().min(0).optional()
  })
});

export class SettingsController {
  static async getSettings(req, res, next) {
    try {
      const settings = await SettingsService.getSettings();
      res.status(200).json({
        success: true,
        data: settings
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateSettings(req, res, next) {
    try {
      const settings = await SettingsService.updateSettings(req.body);
      res.status(200).json({
        success: true,
        message: 'Settings updated successfully',
        data: settings
      });
    } catch (error) {
      next(error);
    }
  }
}
