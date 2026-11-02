import { Router } from 'express';
import { PrescriptionController, createPrescriptionSchema } from '../controllers/prescriptionController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

// Doctor creates prescription
router.post('/', authenticate, requireRole('DOCTOR'), validate(createPrescriptionSchema), PrescriptionController.createPrescription);

// View prescription for appointment
router.get('/appointment/:appointmentId', authenticate, PrescriptionController.getAppointmentPrescription);

// Patient view all prescriptions
router.get('/patient', authenticate, requireRole('USER'), PrescriptionController.getMyPrescriptions);

export default router;
