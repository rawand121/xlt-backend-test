import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from '../utils/errorHandler';
import httpStatus from 'http-status';

export const createUserValidation = (
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
    birthdate: Joi.date().required().messages({
      'any.required': 'Birthdate is required',
      'date.empty': 'Birthdate cannot be empty',
    }),
    gender: Joi.string()
      .required()
      .messages({
        'any.required': 'Gender is required',
        'string.empty': 'Gender cannot be empty',
        'any.allowOnly': 'Gender must be either male or female',
      })
      .allow('male', 'female'),
  });

  const { error } = schema.validate(bodyData);

  if (error) {
    return next(new AppError(error.details[0].message, httpStatus.BAD_REQUEST));
  }

  next();
};

export const updateUserValidation = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const bodyData = req.body;

  const schema = Joi.object({
    full_name: Joi.string(),
    is_deleted: Joi.boolean(),
    phone: Joi.string(),
  });

  const { error } = schema.validate(bodyData);

  if (error) {
    return next(new AppError(error.details[0].message, httpStatus.BAD_REQUEST));
  }

  next();
};

export const sendOtpRegisterValidation = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const bodyData = req.body;

  const schema = Joi.object({
    phone: Joi.string().required().messages({
      'any.required': 'Phone is required',
      'string.empty': 'Phone cannot be empty',
    }),
  });

  const { error } = schema.validate(bodyData);

  if (error) {
    return next(new AppError(error.details[0].message, httpStatus.BAD_REQUEST));
  }

  next();
};

export const verifyTheCodeValidation = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const bodyData = req.body;

  const schema = Joi.object({
    code: Joi.string().required().messages({
      'any.required': 'Code is required',
      'string.empty': 'Code cannot be empty',
    }),
    phone: Joi.string().required().messages({
      'any.required': 'Phone is required',
      'string.empty': 'Phone cannot be empty',
    }),
  });

  const { error } = schema.validate(bodyData);

  if (error) {
    return next(new AppError(error.details[0].message, httpStatus.BAD_REQUEST));
  }

  next();
};
