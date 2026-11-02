import { Router } from 'express';
import { SettingsController, updateSettingsSchema } from '../controllers/settingsController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

// Public: get system settings (app name, commission type, currency)
router.get('/', SettingsController.getSettings);

// Admin only: update settings
router.put('/', authenticate, requireRole('ADMIN'), validate(updateSettingsSchema), SettingsController.updateSettings);

export default router;
