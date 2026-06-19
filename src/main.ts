import { env } from './infrastructure/config/env';
import { logger } from './infrastructure/logger/logger';
import { prisma } from './infrastructure/database/prisma/client';
import { buildDependencies } from './container';
import { createApp } from './presentation/http/app';

async function bootstrap(): Promise<void> {
  const app = createApp(buildDependencies());

  const server = app.listen(env.PORT, () => {
    logger.info(`HTTP server listening on port ${env.PORT}`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Received ${signal}, shutting down`);
    server.close();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.error({ err }, 'Fatal error during bootstrap');
  process.exit(1);
});
