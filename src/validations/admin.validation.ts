import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from '../utils/errorHandler';
import httpStatus from 'http-status';

export const createAdminValidation = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const bodyData = req.body;

  const schema = Joi.object({
    full_name: Joi.string().required().messages({
      'any.required': 'Full Name is required',
      'string.empty': 'Full Name cannot be empty',
    }),
    phone: Joi.string().required().messages({
      'any.required': 'Phone is required',
      'string.empty': 'Phone cannot be empty',
    }),
    email: Joi.string().email().required().messages({
      'any.required': 'Email is required',
      'string.email': 'Invalid email format',
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required',
      'string.empty': 'Password cannot be empty',
    }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.required': 'Confirm Password is required',
        'string.empty': 'Confirm Password cannot be empty',
        'any.only': 'Passwords do not match', // Note: 'any.only' is the error for .valid(...)
      }),
  });

  const { error } = schema.validate(bodyData);

  if (error) {
    return next(new AppError(error.details[0].message, httpStatus.BAD_REQUEST));
  }

  next();
};

export const updateAdminValidation = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const bodyData = req.body;

  const schema = Joi.object({
    full_name: Joi.string(),
    is_deleted: Joi.boolean(),
    phone: Joi.string(),
    password: Joi.string().allow(''),
    confirmPassword: Joi.string().allow(''),
  });

  const { error } = schema.validate(bodyData);

  if (error) {
    return next(new AppError(error.details[0].message, httpStatus.BAD_REQUEST));
  }

  next();
};
