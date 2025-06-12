import { AppError } from '../utils/errorHandler';
import httpStatus from 'http-status';
import logger from '../configs/winston.logger';
import { isPossiblePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';
import { supabaseAdmin } from '../connections/database';
import bcrypt from 'bcrypt';

export const createAdminService = async (
  full_name: string,
  password: string,
  phone: string,
  email: string,
  confirmPassword: string,
) => {
  if (!isPossiblePhoneNumber(phone, 'IQ') || !isValidPhoneNumber(phone, 'IQ')) {
    throw new AppError('Phone number is invalid', httpStatus.BAD_REQUEST);
  }

  if (password !== confirmPassword) {
    throw new AppError('Passwords do not match', httpStatus.BAD_REQUEST);
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  const { error: createError } = await supabaseAdmin.from('admins').insert({
    email,
    password: hashedPassword,
    full_name,
    phone,
  });

  if (createError) {
    logger.error('Error creating admin', createError.message);
    throw new AppError(
      'Failed to create admin',
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  return true;
};

export const findAdminByEmailService = async (email: string) => {
  const { data, error } = await supabaseAdmin
    .from('admins')
    .select('*')
    .ilike('email', email.toLowerCase()) // or .eq() if no case-insensitive search needed
    .single(); // since we expect one user only

  if (error || !data) {
    logger.error('User is not exist');
    throw new AppError('User is Not found', httpStatus.BAD_REQUEST);
  }

  return data;
};

export const findAdminsService = async () => {
  const { data, error } = await supabaseAdmin
    .from('admins')
    .select('id, full_name, email, phone, is_deleted, created_at')
    .eq('is_deleted', false);

  if (error) {
    logger.error('Error fetching admins', error.message);
    throw new AppError(
      'Failed to fetch admins',
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  return data;
};

export const updateAdminService = async (
  id: string,
  full_name: string,
  password: string,
  phone: string,
  confirmPassword: string,
) => {
  let hashedPassword;
  if (
    phone &&
    (!isPossiblePhoneNumber(phone, 'IQ') || !isValidPhoneNumber(phone, 'IQ'))
  ) {
    throw new AppError('Phone number is invalid', httpStatus.BAD_REQUEST);
  }

  if (password) {
    console.log('PASSWORD HAS CHANGED', password);

    if (password !== confirmPassword) {
      throw new AppError('Passwords do not match', httpStatus.BAD_REQUEST);
    }

    const salt = await bcrypt.genSalt(12);
    hashedPassword = await bcrypt.hash(password, salt);
  }

  console.log({ hashedPassword });

  const { error: updateError } = await supabaseAdmin
    .from('admins')
    .update({
      full_name,
      phone,
      password: hashedPassword,
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

export const deleteAdminService = async (id: string) => {
  const { error: deleteError } = await supabaseAdmin
    .from('admins')
    .update({ is_deleted: true })
    .eq('id', id);

  if (deleteError) {
    logger.error('Error deleting user', deleteError.message);
    throw new AppError(
      'Failed to delete user',
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  return true;
};
