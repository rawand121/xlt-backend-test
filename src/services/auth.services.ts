import { supabaseAdmin } from '../connections/database';
import { AppError } from '../utils/errorHandler';
import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import {
  limitterByEmailInDay,
  limitterByIpInDay,
  limitterByIpInTenMinutes,
} from '../middlewares/auth-limitters';
import envVar from '../configs/envVars';
import { REFRESH_TOKEN } from '../utils/enums';
import bcrypt from 'bcrypt';
import { parseDuration } from '../utils/functions';

export const createAccessTokenService = async (userData: any) => {
  if (!envVar.JWT_SECRET) {
    throw new AppError(
      'No JWT_SECRET Provided in .env',
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  const role = 'admin';

  const payload = { id: userData.id, role: role };
  return jwt.sign(payload, envVar.JWT_SECRET, {
    expiresIn: envVar.JWT_EXPIRATION,
  });
};

export const createRefreshTokenService = async (userData: any) => {
  if (!envVar.JWT_REFRESH_SECRET) {
    throw new AppError(
      'No JWT_REFRESH_SECRET Provided in .env',
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  const role = 'admin';

  const userDynamicId = userData.id;

  const payload = { id: userDynamicId, role };
  const refreshToken = jwt.sign(payload, envVar.JWT_REFRESH_SECRET, {
    expiresIn: envVar.JWT_REFRESH_EXPIRATION,
  });

  const expiresAt = new Date(
    Date.now() + parseDuration(envVar.JWT_REFRESH_EXPIRATION),
  ).toISOString();

  // store in your Supabase “tokens” table
  const { data, error } = await supabaseAdmin.from('tokens').insert([
    {
      admin_id: payload.id,
      token: refreshToken,
      type: REFRESH_TOKEN,
      blacklisted: false,
      expires_at: expiresAt,
    },
  ]);
  console.log({ data, payload, error });

  if (error) {
    throw new AppError(
      `Failed to save refresh token: ${error.message}`,
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  return refreshToken;
};

export const createAccessTokenServiceUser = async (userData: any) => {
  if (!envVar.JWT_SECRET) {
    throw new AppError(
      'No JWT_SECRET Provided in .env',
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  const role = 'user';

  const payload = { id: userData.id, role: role };
  return jwt.sign(payload, envVar.JWT_SECRET, {
    expiresIn: envVar.JWT_EXPIRATION,
  });
};

export const createRefreshTokenServiceUser = async (userData: any) => {
  if (!envVar.JWT_REFRESH_SECRET) {
    throw new AppError(
      'No JWT_REFRESH_SECRET Provided in .env',
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  const role = 'user';

  const userDynamicId = userData.id;

  const payload = { id: userDynamicId, role };
  const refreshToken = jwt.sign(payload, envVar.JWT_REFRESH_SECRET, {
    expiresIn: envVar.JWT_REFRESH_EXPIRATION,
  });

  const expiresAt = new Date(
    Date.now() + parseDuration(envVar.JWT_REFRESH_EXPIRATION),
  ).toISOString();

  // store in your Supabase “tokens” table
  const { error } = await supabaseAdmin.from('tokens').insert([
    {
      user_id: payload.id,
      token: refreshToken,
      type: REFRESH_TOKEN,
      blacklisted: false,
      expires_at: expiresAt,
    },
  ]);

  if (error) {
    throw new AppError(
      `Failed to save refresh token: ${error.message}`,
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  return refreshToken;
};

export const verifyTokenService = async (token: string, secret: string) => {
  let decoded: any;

  try {
    decoded = jwt.verify(token, secret) as { id: string };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err: any) {
    throw new AppError('Invalid token', httpStatus.UNAUTHORIZED);
  }

  // ensure it's not been blacklisted
  const { data, error } = await supabaseAdmin
    .from('tokens')
    .select('*')
    .eq('admin_id', decoded.id)
    .eq('blacklisted', false)
    .eq('token', token)
    .single();

  if (error || !data) {
    console.log({ error });
    throw new AppError('Invalid or revoked token', httpStatus.UNAUTHORIZED);
  }

  return { ...data, id: data.admin_id };
};

export const verifyTokenServiceUser = async (token: string, secret: string) => {
  let decoded: any;

  try {
    decoded = jwt.verify(token, secret) as { id: string };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err: any) {
    throw new AppError('Invalid token', httpStatus.UNAUTHORIZED);
  }

  // ensure it's not been blacklisted
  const { data, error } = await supabaseAdmin
    .from('tokens')
    .select('*')
    .eq('user_id', decoded.id)
    .eq('blacklisted', false)
    .eq('token', token)
    .single();

  if (error || !data) {
    throw new AppError('Invalid or revoked token', httpStatus.UNAUTHORIZED);
  }

  return { ...data, id: data.user_id };
};

export const loginService = async (
  email: string,
  password: string,
  ipAddress: string,
) => {
  const { data: userRow, error } = await supabaseAdmin
    .from('admins')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    await Promise.allSettled([
      limitterByIpInDay.consume(ipAddress),
      limitterByIpInTenMinutes.consume(ipAddress),
      limitterByEmailInDay.consume(email),
    ]).catch(console.error);

    throw new AppError('Invalid email or password', httpStatus.UNAUTHORIZED);
  }

  const arePasswordsMatch = await bcrypt.compare(password, userRow.password!);

  if (!arePasswordsMatch) {
    await Promise.allSettled([
      limitterByIpInDay.consume(ipAddress),
      limitterByIpInTenMinutes.consume(ipAddress),
      limitterByEmailInDay.consume(email),
    ]).catch(console.error);

    throw new AppError('Invalid email or password', httpStatus.UNAUTHORIZED);
  }

  // success: return the Supabase user and session object
  return userRow;
};

export const findTheUserService = async (userId: string) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    throw new AppError(
      'Failed to fetch user profile',
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  return data;
};

export const findTheAdminService = async (adminId: string) => {
  const { data, error } = await supabaseAdmin
    .from('admins')
    .select('*')
    .eq('id', adminId)
    .single();

  if (error) {
    throw new AppError(
      'Failed to fetch admin profile',
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  return data;
};
