import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from '../utils/errorHandler';
import httpStatus from 'http-status';

export const createCheckoutValidation = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const bodyData = req.body;

  const schema = Joi.object({
    quantity: Joi.number().required().messages({
      'any.required': 'Quantity is required',
    }),
    lotteryId: Joi.number().required().messages({
      'any.required': 'Lottery ID is required',
    }),
  });

  const { error } = schema.validate(bodyData);

  if (error) {
    return next(new AppError(error.details[0].message, httpStatus.BAD_REQUEST));
  }

  next();
};
