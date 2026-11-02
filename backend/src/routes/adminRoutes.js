import { Router } from 'express';
import { AdminController, rejectDoctorSchema } from '../controllers/adminController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

router.use(authenticate, requireRole('ADMIN'));

router.get('/metrics', AdminController.getDashboardMetrics);
router.get('/doctors/pending', AdminController.getPendingDoctors);
router.patch('/doctors/:id/approve', AdminController.approveDoctor);
router.patch('/doctors/:id/reject', validate(rejectDoctorSchema), AdminController.rejectDoctor);
router.patch('/users/:id/toggle-active', AdminController.toggleUserActive);
router.get('/users', AdminController.getAllUsers);
router.get('/appointments', AdminController.getAllAppointments);

export default router;
