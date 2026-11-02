import { NotificationService } from '../services/notificationService.js';
import { parseParamId } from '../utils/params.js';

export class NotificationController {
  static async getNotifications(req, res, next) {
    try {
      const { unreadOnly } = req.query;
      const result = await NotificationService.getUserNotifications(
        req.user.id,
        unreadOnly === 'true'
      );

      res.status(200).json({
        success: true,
        data: result.notifications,
        unreadCount: result.unreadCount
      });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req, res, next) {
    try {
      const id = parseParamId(req.params.id, 'notificationId');
      await NotificationService.markAsRead(id, req.user.id);
      res.status(200).json({
        success: true,
        message: 'Notification marked as read'
      });
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(req, res, next) {
    try {
      await NotificationService.markAllAsRead(req.user.id);
      res.status(200).json({
        success: true,
        message: 'All notifications marked as read'
      });
    } catch (error) {
      next(error);
    }
  }
}
