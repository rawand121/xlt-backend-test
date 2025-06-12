import { Request, Response, NextFunction } from 'express';
import { RateLimiterMongo } from 'rate-limiter-flexible';
import mongoose from 'mongoose';
import 'dotenv/config';
import { AppError } from '../utils/errorHandler';
import httpStatus from 'http-status';
import { RateLimiterRes } from '../utils/interfaces';
import envVar from '../configs/envVars';

if (
  !envVar.MAXATTEMPTSPERDAYBYIP ||
  !envVar.MAXATTEMPTSPERDAYBYEMAIL ||
  !envVar.MAXATTEMPTSBYIPINTENMINUTES
) {
  throw new AppError(
    'The limitters variables are not defined',
    httpStatus.INTERNAL_SERVER_ERROR,
  );
}
const MaxAttemptsPerDayByIP = envVar.MAXATTEMPTSPERDAYBYIP;
const MaxAttemptsByIPInTenMinutes = envVar.MAXATTEMPTSBYIPINTENMINUTES;
const MaxAttemptsPerDayByEmail = envVar.MAXATTEMPTSPERDAYBYEMAIL;

const limitterByIpInDay = new RateLimiterMongo({
  storeClient: mongoose.connection,
  points: +MaxAttemptsPerDayByIP,
  duration: 60 * 60 * 24,
  blockDuration: 60 * 60 * 24,
  dbName: 'auth-limitter',
});

const limitterByIpInTenMinutes = new RateLimiterMongo({
  storeClient: mongoose.connection,
  points: +MaxAttemptsByIPInTenMinutes,
  duration: 60 * 10,
  blockDuration: 60 * 60 * 24,
  dbName: 'auth-limitter',
});

const limitterByEmailInDay = new RateLimiterMongo({
  storeClient: mongoose.connection,
  points: +MaxAttemptsPerDayByEmail,
  duration: 60 * 60 * 24,
  blockDuration: 60 * 60 * 24,
  dbName: 'auth-limitter',
});

const authLimitter = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const email = req.body.email;

    if (!ipAddress) {
      throw new AppError(
        'IP address is missing',
        httpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const emailIpKey = `${email}_${ipAddress}`;

    try {
      // Explicitly specify types for Promise.all and handle null
      const limiterResults = await Promise.all([
        limitterByEmailInDay.get(email),
        limitterByIpInDay.get(ipAddress),
        limitterByIpInTenMinutes.get(emailIpKey),
      ]);

      // Cast limiter results to ensure TypeScript recognizes the type
      const [emailLimitRes, ipDayLimitRes, ipMinutesLimitRes] =
        limiterResults as [
          RateLimiterRes | null,
          RateLimiterRes | null,
          RateLimiterRes | null,
        ];

      // Calculate retry seconds
      const retrySeconds = Math.max(
        checkLimit(emailLimitRes, +MaxAttemptsPerDayByEmail),
        checkLimit(ipDayLimitRes, +MaxAttemptsPerDayByIP),
        checkLimit(ipMinutesLimitRes, +MaxAttemptsByIPInTenMinutes),
      );

      if (retrySeconds > 0) {
        res.set('Retry-After', String(retrySeconds));
        throw new AppError(
          `Too many attempts. Please try again in ${retrySeconds} seconds`,
          httpStatus.TOO_MANY_REQUESTS,
        );
      }
    } catch (limiterError) {
      if (limiterError instanceof AppError) {
        throw limiterError;
      }
      console.error('Rate limiter error:', limiterError);
    }

    return next();
  } catch (error) {
    next(error);
  }
};

// Function to check limit
const checkLimit = (
  result: RateLimiterRes | null,
  maxAttempts: number,
): number => {
  if (result && result.consumedPoints >= maxAttempts) {
    return Math.floor(result.msBeforeNext / 1000) || 1;
  }
  return 0;
};

export { limitterByEmailInDay, limitterByIpInDay, limitterByIpInTenMinutes };

export default authLimitter;
