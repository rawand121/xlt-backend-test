import { AppError } from '../utils/errorHandler';
import httpStatus from 'http-status';
import { Request, Response, NextFunction } from 'express';
import envVar from '../configs/envVars';
import jwt from 'jsonwebtoken';

/**
 * Middleware to check if the requesting admin is the same as the target admin in the request.
 * Assumes access token is passed in `Authorization` header as: Bearer <token>
 */
export const isSameAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(
        'Missing or invalid authorization header',
        httpStatus.UNAUTHORIZED,
      );
    }

    const token = authHeader.split(' ')[1];
    const userData: any = jwt.verify(token, envVar.JWT_SECRET);

    if (!userData?.id) {
      throw new AppError('Unauthorized request', httpStatus.UNAUTHORIZED);
    }

    const requestingAdminId = userData.id;
    const targetAdminId = req.params.id || req.body.id;
    console.log({ userData, targetAdminId, requestingAdminId });

    if (!targetAdminId) {
      throw new AppError(
        'Target admin ID not provided',
        httpStatus.BAD_REQUEST,
      );
    }

    if (+requestingAdminId !== +targetAdminId) {
      throw new AppError(
        'You are not allowed to perform this action on another admin.',
        httpStatus.FORBIDDEN,
      );
    }

    // Attach the authenticated user to the request (optional, for later use)
    req.user = userData.user;

    next();
  } catch (err) {
    next(err);
  }
};
