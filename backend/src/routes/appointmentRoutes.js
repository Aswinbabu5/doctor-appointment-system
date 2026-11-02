import { Router } from 'express';
import {
  AppointmentController,
  bookAppointmentSchema,
  rescheduleSchema,
  cancelSchema,
  updateStatusSchema
} from '../controllers/appointmentController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

// Patient appointments
router.post('/book', authenticate, requireRole('USER'), validate(bookAppointmentSchema), AppointmentController.bookAppointment);
router.get('/patient', authenticate, requireRole('USER'), AppointmentController.getPatientAppointments);

// Doctor appointments
router.get('/doctor', authenticate, requireRole('DOCTOR'), AppointmentController.getDoctorAppointments);

// Reschedule and cancel
router.post('/:id/reschedule', authenticate, validate(rescheduleSchema), AppointmentController.rescheduleAppointment);
router.post('/:id/cancel', authenticate, validate(cancelSchema), AppointmentController.cancelAppointment);

// Doctor or Admin status update (e.g. IN_PROGRESS, COMPLETED, NO_SHOW)
router.patch('/:id/status', authenticate, requireRole('DOCTOR', 'ADMIN'), validate(updateStatusSchema), AppointmentController.updateStatus);

// Single appointment details
router.get('/:id', authenticate, AppointmentController.getAppointmentById);

export default router;
