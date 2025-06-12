import 'dotenv/config';
import express from 'express';

import loader from './loaders/index';
import winstonLogger from './configs/winston.logger';
import envVar from './configs/envVars';

const PORT = envVar.PORT || 4000;

/**
 * Gracefully shuts down the server and exits the process.
 * @param {any} server - The server instance to close.
 * @param {number} exitCode - The process exit code (0 for success, 1 for error).
 */
const exitHandler = (server: any, exitCode: number) => {
  if (server) {
    server.close(() => {
      winstonLogger.info('Server closed');
      process.exit(exitCode);
    });
  } else {
    process.exit(exitCode);
  }
};

/**
 * Handles unexpected errors and shuts down the server gracefully.
 * @param {any} server - The server instance to close.
 * @returns {Function} - The error handler function.
 */
const unexpectedErrorHandler = (server: any) => {
  return (error: any) => {
    winstonLogger.error('Unexpected Error:', error);
    exitHandler(server, 1);
  };
};

const startServer = async () => {
  const app = express();
  await loader(app);

  const server = app.listen(PORT, () => {
    winstonLogger.info(`Server is running on port ${PORT}`);
  });

  // Handle server errors
  server.on('error', (error) => {
    winstonLogger.error('Server Error:', error);
    exitHandler(server, 1);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', unexpectedErrorHandler(server));

  // Handle unhandled promise rejections
  process.on('unhandledRejection', unexpectedErrorHandler(server));

  // Handle SIGTERM (e.g., container or service shutdown)
  process.on('SIGTERM', () => {
    winstonLogger.info('SIGTERM received. Shutting down gracefully...');
    exitHandler(server, 0);
  });

  // Optional: Handle SIGINT (e.g., Ctrl+C during development)
  process.on('SIGINT', () => {
    winstonLogger.info('SIGINT received. Shutting down gracefully...');
    exitHandler(server, 0);
  });
};

startServer();
