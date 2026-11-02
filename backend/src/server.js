import app from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/db.js';
import { JobWorker } from './services/jobWorker.js';
import logger from './utils/logger.js';

const PORT = env.PORT || 5001;

async function bootstrap() {
  try {
    await prisma.$connect();
    logger.info('Connected to MySQL database via Prisma');

    const server = app.listen(PORT, () => {
      logger.info(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
      logger.info(`API Base URL: http://localhost:${PORT}/api/v1`);
    });

    const jobWorkerInterval = JobWorker.start(30000);

    const shutdown = async (signal) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      clearInterval(jobWorkerInterval);
      server.close(async () => {
        await prisma.$disconnect();
        logger.info('Database disconnected. Process exited.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
