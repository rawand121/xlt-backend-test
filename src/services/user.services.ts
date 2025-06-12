import { AppError } from '../utils/errorHandler';
import httpStatus from 'http-status';
import logger from '../configs/winston.logger';
import { isPossiblePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';
import { supabaseAdmin } from '../connections/database';
import { generateCode } from '../utils/functions';
import client from '../connections/redis';
import clientOtp from '../configs/clientOtp';

export const createUserService = async (
  full_name: string,
  phone: string,
  email: string,
  birthdate: string,
) => {
  if (!isPossiblePhoneNumber(phone, 'IQ') || !isValidPhoneNumber(phone, 'IQ')) {
    throw new AppError('Phone number is invalid', httpStatus.BAD_REQUEST);
  }

  const { error: createError } = await supabaseAdmin.from('users').insert({
    email,
    full_name,
    is_deleted: false,
    phone,
    birthdate: new Date(birthdate).toISOString(),
  });

  if (createError) {
    logger.error('Error creating user', createError.message);
    throw new AppError(
      `Failed to create user ${createError.message}`,
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  return true;
};

export const findUsersService = async () => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('is_deleted', false);

  if (error) {
    logger.error('Error fetching users', error.message);
    throw new AppError(
      'Failed to fetch users',
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  return data;
};

export const updateUserService = async (
  id: string,
  full_name: string,
  phone: string,
  is_deleted: boolean,
) => {
  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({
      full_name,
      phone,
      is_deleted,
    })
    .eq('id', id);

  if (updateError) {
    logger.error('Error updating user', updateError.message);
    throw new AppError(
      'Failed to update user',
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  return true;
};

export const sendOtpService = async (phone: string, isLogin: string | null) => {
  if (!isPossiblePhoneNumber(phone, 'IQ') || !isValidPhoneNumber(phone, 'IQ')) {
    throw new AppError('Phone number is invalid', httpStatus.BAD_REQUEST);
  }
  const modifiedPhone = phone.replace(/^(\+9640|\+964|0)/, '');

  if (isLogin === 'true') {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('phone', `0${modifiedPhone}`)
      .single();

    if (!user) {
      throw new AppError(
        'No user found with this phone number',
        httpStatus.NOT_FOUND,
      );
    }
  }

  try {
    const send = await clientOtp.sendSMS({
      phoneNumber: `964${modifiedPhone}`,
      smsType: 'verification',
    });

    if (!send || !send.verificationCode) {
      throw new AppError(
        'Failed to send OTP',
        httpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const code = send.verificationCode;

    // Store in Redis under a unique key
    const redisKey = `verify:${phone}`;
    await client.set(redisKey, code, { EX: 300 }); // Expires in 5 minutes

    return { success: true };
  } catch (error) {
    console.error('Redis error:', error);
    throw new AppError('Failed to send OTP', httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const verifyCodeService = async (phoneNumber: string, code: string) => {
  if (!phoneNumber || !code) {
    throw new AppError(
      'Phone number and code are required',
      httpStatus.BAD_REQUEST,
    );
  }

  if (
    !isPossiblePhoneNumber(phoneNumber, 'IQ') ||
    !isValidPhoneNumber(phoneNumber, 'IQ')
  ) {
    throw new AppError('Phone number is invalid', httpStatus.BAD_REQUEST);
  }

  const redisKey = `verify:${phoneNumber}`;
  const storedCode = await client.get(redisKey);

  if (!storedCode) {
    throw new AppError('Code expired or not found', httpStatus.BAD_REQUEST);
  }

  if (storedCode !== code) {
    throw new AppError('Invalid code', httpStatus.BAD_REQUEST);
  }

  await client.del(redisKey);

  return true;
};
