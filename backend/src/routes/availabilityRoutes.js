import { Router } from 'express';
import { AvailabilityController, createSlotsSchema } from '../controllers/availabilityController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { requireRole, requireApprovedDoctor } from '../middlewares/roleMiddleware.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

// Public: view slots for doctor
router.get('/doctor/:doctorId', AvailabilityController.getDoctorSlots);

// Doctor only: manage own slots
router.post('/', authenticate, requireApprovedDoctor, validate(createSlotsSchema), AvailabilityController.createSlots);
router.get('/mine', authenticate, requireRole('DOCTOR'), AvailabilityController.getMySlots);
router.delete('/:id', authenticate, requireRole('DOCTOR'), AvailabilityController.deleteSlot);

export default router;
