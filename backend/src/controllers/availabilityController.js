import { AvailabilityService } from '../services/availabilityService.js';
import { parseParamId } from '../utils/params.js';
import { z } from 'zod';

export const createSlotsSchema = z.object({
  body: z.object({
    slots: z.array(z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
      startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Start time must be formatted as HH:mm'),
      endTime: z.string().regex(/^\d{2}:\d{2}$/, 'End time must be formatted as HH:mm')
    })).min(1, 'At least one slot is required')
  })
});

export class AvailabilityController {
  static async createSlots(req, res, next) {
    try {
      const doctorId = req.user.doctorProfile?.id;
      if (!doctorId) {
        return res.status(403).json({ success: false, message: 'Doctor profile required' });
      }

      const slots = await AvailabilityService.createSlots(doctorId, req.body.slots);
      res.status(201).json({
        success: true,
        message: `${slots.length} availability slot(s) published successfully`,
        data: slots
      });
    } catch (error) {
      next(error);
    }
  }

  static async getDoctorSlots(req, res, next) {
    try {
      const doctorId = parseParamId(req.params.doctorId, 'doctorId');
      const { startDate, endDate, availableOnly } = req.query;

      const slots = await AvailabilityService.getDoctorSlots(doctorId, {
        startDate,
        endDate,
        availableOnly: availableOnly === 'true'
      });

      res.status(200).json({
        success: true,
        data: slots
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMySlots(req, res, next) {
    try {
      const doctorId = req.user.doctorProfile?.id;
      if (!doctorId) {
        return res.status(403).json({ success: false, message: 'Doctor profile required' });
      }

      const { startDate, endDate } = req.query;
      const slots = await AvailabilityService.getDoctorSlots(doctorId, {
        startDate,
        endDate,
        availableOnly: false
      });

      res.status(200).json({
        success: true,
        data: slots
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteSlot(req, res, next) {
    try {
      const slotId = parseParamId(req.params.id, 'slotId');
      const doctorId = req.user.doctorProfile?.id;
      if (!doctorId) {
        return res.status(403).json({ success: false, message: 'Doctor profile required' });
      }

      const result = await AvailabilityService.deleteSlot(slotId, doctorId);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }
}
