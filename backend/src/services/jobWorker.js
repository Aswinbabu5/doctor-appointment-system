import { prisma } from '../config/db.js';
import logger from '../utils/logger.js';

export class JobWorker {
  static isRunning = false;

  static async processPendingJobs() {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      const now = new Date();
      // Fetch up to 20 pending jobs scheduled for <= now
      const pendingJobs = await prisma.notificationJob.findMany({
        where: {
          status: 'PENDING',
          scheduledFor: { lte: now }
        },
        include: {
          appointment: {
            include: {
              doctor: { include: { user: true } },
              patient: true
            }
          }
        },
        take: 20
      });

      for (const job of pendingJobs) {
        try {
          await prisma.notificationJob.update({
            where: { id: job.id },
            data: { status: 'PROCESSING', attempts: { increment: 1 } }
          });

          // Deliver in-app notification reminder
          const timeMsg = job.type === 'REMINDER_24H' ? 'in 24 hours' :
                          job.type === 'REMINDER_1H' ? 'in 1 hour' :
                          job.type === 'REMINDER_15M' ? 'in 15 minutes' : 'soon';

          await prisma.notification.create({
            data: {
              userId: job.userId,
              appointmentId: job.appointmentId,
              type: job.type,
              title: `Upcoming Consultation Reminder (${timeMsg})`,
              message: `Reminder: You have a scheduled consultation with Dr. ${job.appointment.doctor.user.username} ${timeMsg} at ${job.appointment.startTime}.`
            }
          });

          await prisma.notificationJob.update({
            where: { id: job.id },
            data: { status: 'SENT', executedAt: new Date() }
          });
        } catch (jobErr) {
          logger.error(`Error processing job ${job.id}:`, jobErr);
          const reachedMax = job.attempts + 1 >= job.maxAttempts;
          await prisma.notificationJob.update({
            where: { id: job.id },
            data: {
              status: reachedMax ? 'FAILED' : 'PENDING',
              lastError: jobErr.message
            }
          });
        }
      }
    } catch (err) {
      logger.error('Job worker poll cycle failed:', err);
    } finally {
      this.isRunning = false;
    }
  }

  static start(intervalMs = 30000) {
    logger.info(`Starting Notification Job Worker (interval: ${intervalMs}ms)`);
    // Run initial tick immediately
    this.processPendingJobs();
    const intervalId = setInterval(() => {
      this.processPendingJobs();
    }, intervalMs);

    return intervalId;
  }
}
