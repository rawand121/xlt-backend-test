import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from '../utils/errorHandler';
import httpStatus from 'http-status';

export const createCategoryValidation = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const bodyData = req.body;

  const schema = Joi.object({
    name: Joi.string().required().messages({
      'any.required': 'Name is required',
      'string.empty': 'Name cannot be empty',
    }),
    name_ku: Joi.string().required().messages({
      'any.required': 'Name (Kurdish) is required',
      'string.empty': 'Name (Kurdish) cannot be empty',
    }),
    name_ar: Joi.string().required().messages({
      'any.required': 'Name (Arabic) is required',
      'string.empty': 'Name (Arabic) cannot be empty',
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
    name: Joi.string(),
    name_ku: Joi.string(),
    name_ar: Joi.string(),
    is_deleted: Joi.boolean(),
  });

  const { error } = schema.validate(bodyData);

  if (error) {
    return next(new AppError(error.details[0].message, httpStatus.BAD_REQUEST));
  }

  next();
};
