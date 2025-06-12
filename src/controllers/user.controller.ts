import { Request, Response } from 'express';
import catchAsync from '../utils/asyncHandller';
import {
  createUserService,
  findUsersService,
  updateUserService,
  sendOtpService,
  verifyCodeService,
} from '../services/user.services';
import httpStatus from 'http-status';
import { AppError } from '../utils/errorHandler';
import { supabaseAdmin } from '../connections/database';
import {
  createAccessTokenServiceUser,
  createRefreshTokenServiceUser,
} from '../services/auth.services';

export const createUser = catchAsync(async (req: Request, res: Response) => {
  const { full_name, phone, email, birthdate } = req.body;

  const user = await createUserService(full_name, phone, email, birthdate);
  const [accessToken, refreshToken] = await Promise.all([
    createAccessTokenServiceUser(user),
    createRefreshTokenServiceUser(user),
  ]);

  // Set cookies
  res.cookie('xltUserAccessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // use HTTPS in production
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie('xltUserRefreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Send response
  res.status(httpStatus.OK).json({
    success: true,
    accessToken,
    user,
  });
});

export const getUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await findUsersService();

  res.status(201).json({ users });
});

export const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { full_name, phone, is_deleted } = req.body;

  const user = await updateUserService(id, full_name, phone, is_deleted);

  res.status(httpStatus.CREATED).json({ user });
});

export const sendOtp = catchAsync(async (req: Request, res: Response) => {
  const { login } = req.query;
  const { phone } = req.body;

  const response = await sendOtpService(phone, login as string);

  if (!response) {
    throw new AppError('Failed to send OTP', httpStatus.INTERNAL_SERVER_ERROR);
  }

  res.status(httpStatus.CREATED).json({ message: 'OTP sent successfully' });
});

export const verifyCode = catchAsync(async (req: Request, res: Response) => {
  const { isLogin } = req.query;
  const { code, phone } = req.body;

  const response = await verifyCodeService(phone, code);

  if (!response) {
    throw new AppError(
      'Failed to verify OTP',
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  if (isLogin) {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();

    if (!user) {
      throw new AppError('User not found', httpStatus.NOT_FOUND);
    }

    const [accessToken, refreshToken] = await Promise.all([
      createAccessTokenServiceUser(user),
      createRefreshTokenServiceUser(user),
    ]);

    // Set cookies
    res.cookie('xltUserAccessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // use HTTPS in production
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('xltUserRefreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Send response
    res.status(httpStatus.OK).json({
      success: true,
      accessToken,
      user,
    });
  } else {
    res.status(httpStatus.CREATED).json({ verified: true });
  }
});
