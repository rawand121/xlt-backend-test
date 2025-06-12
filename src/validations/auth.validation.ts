import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from '../utils/errorHandler';
import httpStatus from 'http-status';

export const loginValidation = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const bodyData = req.body;

  const schema = Joi.object({
    password: Joi.string().required().messages({
      'any.required': 'Password is required',
      'string.min': 'Password must be at least 8 characters long',
    }),
    email: Joi.string().email().required().messages({
      'any.required': 'Email is required',
      'string.email': 'Invalid email format',
    }),
  });

  const { error } = schema.validate(bodyData);

  if (error) {
    return next(new AppError(error.details[0].message, httpStatus.BAD_REQUEST));
  }

  next();
};

export const refreshTokenValidation = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const bodyData = req.body;

  const schema = Joi.object({
    refreshToken: Joi.string().required().messages({
      'any.required': 'Refresh token is required',
    }),
  });

  const { error } = schema.validate(bodyData);

  if (error) {
    return next(new AppError(error.details[0].message, httpStatus.BAD_REQUEST));
  }

  next();
};
