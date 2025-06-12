import { AppError } from '../utils/errorHandler';
import httpStatus from 'http-status';
import { Request, Response, NextFunction } from 'express';
import envVar from '../configs/envVars';
import jwt from 'jsonwebtoken';

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.xltAccessToken;

    if (!token) {
      throw new AppError('Missing access token', httpStatus.UNAUTHORIZED);
    }

    const userData: any = jwt.verify(token, envVar.JWT_SECRET);

    if (!userData || userData.role !== 'admin') {
      throw new AppError('Unauthorized request', httpStatus.UNAUTHORIZED);
    }

    // Attach the user data to the request (optional)
    req.user = userData;

    next();
  } catch (err) {
    next(err);
  }
};

export const fetchAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { JWT_SECRET } = process.env;

    if (!JWT_SECRET) {
      throw new AppError(
        'JWT_SECRET is not set',
        httpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const token = req.cookies.xltAccessToken;

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
