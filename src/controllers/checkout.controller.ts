import { Request, Response } from 'express';
import catchAsync from '../utils/asyncHandller';
import {
  createCheckoutService,
  getCheckoutsByLotteryIdService,
} from '../services/checkout.services';

export const createCheckout = catchAsync(
  async (req: Request, res: Response) => {
    const { quantity, lotteryId } = req.body;
    const user = req.user;

    await createCheckoutService(quantity, lotteryId, user);

    res.status(201).json({ success: true });
  },
);

export const getPurchasesByLotteryId = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const checkouts = await getCheckoutsByLotteryIdService(id);

    res.status(200).json({ checkouts });
  },
);
