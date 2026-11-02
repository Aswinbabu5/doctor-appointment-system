import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', authenticate, NotificationController.getNotifications);
router.patch('/:id/read', authenticate, NotificationController.markAsRead);
router.post('/read-all', authenticate, NotificationController.markAllAsRead);

export default router;
