import { prisma } from '../config/db.js';

export class NotificationService {
  static async createNotification({ userId, appointmentId, type, title, message }) {
    return await prisma.notification.create({
      data: {
        userId,
        appointmentId: appointmentId || null,
        type,
        title,
        message
      }
    });
  }

  static async getUserNotifications(userId, unreadOnly = false) {
    const where = { userId };
    if (unreadOnly) {
      where.isRead = false;
    }

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 50
      }),
      prisma.notification.count({
        where: { userId, isRead: false }
      })
    ]);

    return { notifications, unreadCount };
  }

  static async markAsRead(id, userId) {
    return await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true, readAt: new Date() }
    });
  }

  static async markAllAsRead(userId) {
    return await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() }
    });
  }
}
