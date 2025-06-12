import { Request, Response } from 'express';
import {
  createAccessTokenServiceUser,
  createRefreshTokenServiceUser,
  loginService,
  verifyTokenServiceUser,
  findTheAdminService,
} from '../services/auth.services';
import catchAsync from '../utils/asyncHandller';
import { AppError } from '../utils/errorHandler';
import httpStatus from 'http-status';
import envVar from '../configs/envVars';
import {
  createAccessTokenService,
  createRefreshTokenService,
  verifyTokenService,
  findTheUserService,
} from '../services/auth.services';
import { supabaseAdmin } from '../connections/database';

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const ipAddress = req.socket.remoteAddress;

  if (!ipAddress) {
    throw new AppError('IP address is missing', httpStatus.BAD_REQUEST);
  }

  const user = await loginService(email, password, ipAddress);

  if (!user) {
    throw new AppError('No user found', httpStatus.NOT_FOUND);
  }

  const [accessToken, refreshToken] = await Promise.all([
    createAccessTokenService(user),
    createRefreshTokenService(user),
  ]);

  // Set cookies
  res.cookie('xltAccessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // use HTTPS in production
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie('xltRefreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Send response
  res.status(httpStatus.OK).json({
    success: true,
  });
});

export const handleSession = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.xltRefreshToken;

  if (!refreshToken) {
    throw new AppError('Refresh token is missing', httpStatus.UNAUTHORIZED);
  }

  if (!envVar.JWT_REFRESH_SECRET) {
    throw new AppError(
      'JWT REFRESH SECRET is missing',
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  const tokenData = await verifyTokenService(
    refreshToken,
    envVar.JWT_REFRESH_SECRET,
  );

  const [newAccessToken, newRefreshToken] = await Promise.all([
    createAccessTokenService(tokenData),
    createRefreshTokenService(tokenData),
  ]);

  await supabaseAdmin.from('tokens').delete().eq('token', refreshToken);

  // Set new tokens in cookies
  res.cookie('xltAccessToken', newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie('xltRefreshToken', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Session refreshed successfully',
  });
});

export const handleSessionForUser = catchAsync(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies.xltUserRefreshToken;

    if (!refreshToken) {
      throw new AppError('Refresh token is missing', httpStatus.UNAUTHORIZED);
    }

    if (!envVar.JWT_REFRESH_SECRET) {
      throw new AppError(
        'JWT REFRESH SECRET is missing',
        httpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const tokenData = await verifyTokenServiceUser(
      refreshToken,
      envVar.JWT_REFRESH_SECRET,
    );

    const [newAccessToken, newRefreshToken] = await Promise.all([
      createAccessTokenServiceUser(tokenData),
      createRefreshTokenServiceUser(tokenData),
    ]);

    await supabaseAdmin.from('tokens').delete().eq('token', refreshToken);

    res.cookie('xltUserAccessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('xltUserRefreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(httpStatus.OK).json({
      success: true,
      message: 'Session refreshed successfully',
    });
  },
);

export const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const user: any = req.user;

  if (!user) {
    throw new AppError('User is missing', httpStatus.UNAUTHORIZED);
  }

  const userData = await findTheUserService(user.id);

  res.status(httpStatus.OK).json({
    success: true,
    userData,
  });
});

export const getMyAdminProfile = catchAsync(
  async (req: Request, res: Response) => {
    const admin: any = req.user;

    if (!admin) {
      throw new AppError('admin is missing', httpStatus.UNAUTHORIZED);
    }

    const adminData = await findTheAdminService(admin.id);

    res.status(httpStatus.OK).json({
      success: true,
      adminData,
    });
  },
);

export const logoutUser = catchAsync(async (req: Request, res: Response) => {
  // Clear cookies (set same options as when they were set)
  res.clearCookie('xltUserAccessToken', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  res.clearCookie('xltUserRefreshToken', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

export const logoutAdmin = catchAsync(async (req: Request, res: Response) => {
  // Clear cookies (set same options as when they were set)
  res.clearCookie('xltAccessToken', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  res.clearCookie('xltRefreshToken', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});
