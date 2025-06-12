import { Request, Response, NextFunction } from 'express';
import winstonLogger from '../configs/winston.logger';
import { errorHandler } from './errorHandler';

// Explicitly define the type of `fn` as a function that accepts Request, Response, and NextFunction, and returns a Promise.
const catchAsync =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error: any) => {
      winstonLogger.error('Something went wrong', { error });
      console.log({ error });
      errorHandler(error, req, res, next);
    });
  };

export default catchAsync;
