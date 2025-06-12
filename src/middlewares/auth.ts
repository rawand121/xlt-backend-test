import jwt from 'jsonwebtoken';
import { AppError } from '../utils/errorHandler';
import httpStatus from 'http-status';
import { Request, Response, NextFunction } from 'express';

export const isAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { JWT_SECRET } = process.env;

    if (!JWT_SECRET) {
      throw new AppError(
        'JWT_SECRET is not set',
        httpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const token = req.cookies.xltUserAccessToken;

    if (!token) {
      throw new AppError(
        'Authorization token is missing',
        httpStatus.UNAUTHORIZED,
      );
    }

    try {
      // Verify and attach user data to request
      const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
      req.user = decoded;
      next();
    } catch (error) {
      // Check for token expiration
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('Token has expired', httpStatus.UNAUTHORIZED);
      }
      throw new AppError('Invalid token', httpStatus.UNAUTHORIZED);
    }
  } catch (error) {
    next(error);
  }
};
