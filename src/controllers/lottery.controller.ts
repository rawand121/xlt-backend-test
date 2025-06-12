import { Request, Response } from 'express';
import catchAsync from '../utils/asyncHandller';
import {
  createLotteryService,
  findLotteryByIdService,
  findLotteriesService,
  uploadFileThroughSharp,
  findMyLotteriesService,
  retrieveNotFinishedLotteriesService,
  retrieveFinishedLotteriesService,
  getPurchasedLotteriesByUserService,
  updateLotteryService,
  deleteLotteryService,
  getLotteryActivitiesService,
} from '../services/lottery.services';
import httpStatus from 'http-status';

export const createLottery = catchAsync(async (req: Request, res: Response) => {
  const userDecoded: any = req.user;
  const {
    name_en,
    name_ku,
    name_ar,
    content_en,
    content_ar,
    content_ku,
    price_per_ticket,
    deadline,
    category,
    image,
  } = req.body;

  const user = await createLotteryService(
    name_en,
    name_ku,
    name_ar,
    content_en,
    content_ar,
    content_ku,
    price_per_ticket,
    deadline,
    category,
    image,
    userDecoded.id,
  );

  res.status(201).json({ user });
});

export const getLotteries = catchAsync(async (req: Request, res: Response) => {
  const lotteries = await findLotteriesService();

  res.status(200).json({ lotteries });
});

export const getLotteryById = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const lottery = await findLotteryByIdService(id);

    res.status(200).json({ lottery });
  },
);

export const uploadImage = catchAsync(async (req: Request, res: Response) => {
  const uploadFile = await uploadFileThroughSharp(req.file!);

  res.status(httpStatus.OK).json({
    success: true,
    uploadFile,
  });
});

export const getMyLotteries = catchAsync(
  async (req: Request, res: Response) => {
    const token = req.cookies.xltUserRefreshToken;
    const lotteries = await findMyLotteriesService(token);

    res.status(200).json({ lotteries });
  },
);

export const retrieveNotFinishedLotteries = catchAsync(
  async (req: Request, res: Response) => {
    const lotteries = await retrieveNotFinishedLotteriesService();

    res.status(200).json({ lotteries });
  },
);

export const retrieveFinishedLotteries = catchAsync(
  async (req: Request, res: Response) => {
    const lotteries = await retrieveFinishedLotteriesService();

    res.status(200).json({ lotteries });
  },
);

export const getPurchasedLotteriesByUser = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const lotteries = await getPurchasedLotteriesByUserService(user);

    res.status(200).json({ lotteries });
  },
);

export const updateLottery = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    name_en,
    name_ar,
    name_ku,
    content_en,
    content_ar,
    content_ku,
    category_id,
    image,
    deadline,
  } = req.body;

  const lottery = await updateLotteryService(
    id,
    name_en,
    name_ar,
    name_ku,
    content_en,
    content_ar,
    content_ku,
    category_id,
    image,
    deadline,
  );

  res.status(200).json({ lottery });
});

export const deleteLottery = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await deleteLotteryService(id);
  res.status(200).json({ message: 'Lottery deleted successfully' });
});

export const getLotteryActivities = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const activities = await getLotteryActivitiesService(id);
    res.status(200).json({ activities });
  },
);
