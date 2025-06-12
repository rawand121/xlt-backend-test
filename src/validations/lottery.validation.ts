import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from '../utils/errorHandler';
import httpStatus from 'http-status';

export const createLotteryValidation = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const bodyData = req.body;

  const schema = Joi.object({
    name_en: Joi.string().required().messages({
      'any.required': 'Name is required',
      'string.empty': 'Name cannot be empty',
    }),
    name_ku: Joi.string(),
    name_ar: Joi.string(),
    content_en: Joi.string().required().messages({
      'any.required': 'Content is required',
      'string.empty': 'Content cannot be empty',
    }),
    content_ar: Joi.string(),
    content_ku: Joi.string(),
    price_per_ticket: Joi.number().required().messages({
      'any.required': 'Price is required',
      'number.empty': 'Price cannot be empty',
    }),
    deadline: Joi.date().required().messages({
      'any.required': 'Deadline is required',
      'date.empty': 'Deadline cannot be empty',
    }),
    category: Joi.string().required().messages({
      'any.required': 'Category is required',
      'string.empty': 'Category cannot be empty',
    }),
    image: Joi.string().required().messages({
      'any.required': 'Image is required',
      'string.empty': 'Image cannot be empty',
    }),
  });

  const { error } = schema.validate(bodyData);

  if (error) {
    return next(new AppError(error.details[0].message, httpStatus.BAD_REQUEST));
  }

  next();
};

export const updateLotteryValidation = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const bodyData = req.body;

  const schema = Joi.object({
    name_en: Joi.string().allow(null, ''),
    name_ku: Joi.string().allow(null, ''),
    name_ar: Joi.string().allow(null, ''),
    content_en: Joi.string().allow(null, ''),
    content_ar: Joi.string().allow(null, ''),
    content_ku: Joi.string().allow(null, ''),
    deadline: Joi.date().allow(null),
    category_id: Joi.string(),
    image: Joi.string(),
  });

  const { error } = schema.validate(bodyData);

  if (error) {
    return next(new AppError(error.details[0].message, httpStatus.BAD_REQUEST));
  }

  next();
};
