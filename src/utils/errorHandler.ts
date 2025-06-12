import { NextFunction, Request, Response } from 'express';
import logger from '../configs/winston.logger';
import envVar from '../configs/envVars';

// Custom error classes for different types of errors
class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Centralized error handler middleware
const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  // Log the error
  logger.error({
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode || 500,
    path: req.path,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Determine the status code
  const statusCode = err.statusCode || 500;

  // Prepare the error response
  const errorResponse = {
    status: 'error',
    statusCode: statusCode,
    message: err.isOperational ? err.message : 'Something went wrong',
    ...(envVar.NODE_ENV === 'development' && { stack: err.stack }),
  };
  // Send error response
  res.status(statusCode).json(errorResponse);
};

export { AppError, errorHandler };
