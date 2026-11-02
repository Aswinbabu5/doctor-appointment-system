import { Router } from 'express';
import { DoctorController, updateDoctorSchema } from '../controllers/doctorController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { upload } from '../middlewares/upload.js';

const router = Router();

// Public doctor directory
router.get('/', DoctorController.getApprovedDoctors);
router.get('/:id', DoctorController.getDoctorById);

// Doctor protected routes
router.put('/profile', authenticate, requireRole('DOCTOR'), validate(updateDoctorSchema), DoctorController.updateDoctorProfile);
router.post('/documents', authenticate, requireRole('DOCTOR'), upload.single('document'), DoctorController.uploadDocument);

export default router;
