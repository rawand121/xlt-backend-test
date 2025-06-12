import { AppError } from '../utils/errorHandler';
import httpStatus from 'http-status';
import logger from '../configs/winston.logger';
import { supabaseAdmin } from '../connections/database';
import sharp from 'sharp';

export const createLotteryService = async (
  name: string,
  name_ku: string,
  name_ar: string,
  content_en: string,
  content_ar: string,
  content_ku: string,
  price_per_ticket: number,
  deadline: Date,
  category: string,
  image: string,
  user_id: string,
) => {
  const { data: userData } = await supabaseAdmin
    .from('admins')
    .select('*')
    .eq('id', user_id)
    .single();

  if (!userData) {
    logger.error('User not found');
    throw new AppError('User not found', httpStatus.BAD_REQUEST);
  }

  const { error: createError } = await supabaseAdmin.from('lotteries').insert({
    name_en: name,
    name_ku,
    name_ar,
    content_en,
    content_ar,
    content_ku,
    price_per_ticket,
    deadline,
    category_id: +category,
    image,
  });

  if (createError) {
    console.log({ createError });

    logger.error('Error creating lottery', createError.message);
    throw new AppError(
      'Failed to create lottery',
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  return true;
};

export const findLotteriesService = async () => {
  const { data, error } = await supabaseAdmin
    .from('lotteries')
    .select(
      'id, name_en, name_ku, name_ar, content_en, content_ku, content_ar, price_per_ticket, deadline,image, category_id, image, created_at, purchases (id, user_id, quantity), category_id (*)',
    )
    .eq('is_deleted', false);

  if (error || !data) {
    console.log({ error });

    logger.error('Lotteries are not exist');
    throw new AppError('Lotteries are Not found', httpStatus.BAD_REQUEST);
  }

  return data;
};

export const findLotteryByIdService = async (id: string) => {
  const { data, error } = await supabaseAdmin
    .from('lotteries')
    .select(
      'id, name_en, name_ku, name_ar, content_en, content_ku, content_ar, price_per_ticket, is_deleted, image, deadline, category_id, image, created_at, purchases (id, user_id, quantity)',
    )
    .eq('id', id)
    .eq('is_deleted', false)
    .single();

  if (error || !data) {
    logger.error('Lottery not found');
    throw new AppError('Lottery not found', httpStatus.BAD_REQUEST);
  }

  return data;
};

export const deleteLotteryService = async (id: string) => {
  const { error: deleteError } = await supabaseAdmin
    .from('lotteries')
    .update({ is_deleted: true })
    .eq('id', id);

  if (deleteError) {
    logger.error('Error deleting lottery', deleteError.message);
    throw new AppError(
      'Failed to delete lottery',
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  return true;
};

export const uploadFileThroughSharp = async (file: Express.Multer.File) => {
  const fileName = `image-${Date.now()}-${file.originalname}.webp`;

  try {
    // Compress and convert to WebP format into buffer
    const processedBuffer = await sharp(file.buffer)
      .webp({ quality: 80 })
      .toBuffer();

    // Upload to Supabase bucket (bucket name: 'images')
    const { data, error } = await supabaseAdmin.storage
      .from('images')
      .upload(fileName, processedBuffer, {
        contentType: 'image/webp',
        upsert: true, // Optional: overwrite if name exists
      });

    if (error || !data) {
      console.error('Supabase upload error:', error);
      throw new Error('Failed to upload image to storage');
    }

    // Get public URL of uploaded image
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('images')
      .getPublicUrl(data.path);

    if (!publicUrlData) {
      throw new Error('Failed to get public URL of image');
    }

    // Return the public URL to send back to UI
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Processing/upload error:', error);
    throw error;
  }
};

export const findMyLotteriesService = async (token: string) => {
  const { data: userData, error: userError } = await supabaseAdmin
    .from('tokens')
    .select('*')
    .eq('token', token)
    .single();

  if (userError || !userData) {
    logger.error('User not found');
    throw new AppError('User not found', httpStatus.BAD_REQUEST);
  }

  const { data, error } = await supabaseAdmin
    .from('lotteries')
    .select(
      'id, name_en, name_ku, name_ar, content_en, content_ku, content_ar, is_deleted, price_per_ticket, image, deadline, category_id, purchases (id, user_id, quantity)',
    )
    .eq('author_id', userData.user_id)
    .eq('is_deleted', false);

  if (error || !data.length) {
    console.log({ error });

    logger.error('Lotteries are not exist');
    throw new AppError('Lotteries are Not found', httpStatus.BAD_REQUEST);
  }

  return data;
};

export const retrieveNotFinishedLotteriesService = async () => {
  const currentTime = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('lotteries')
    .select(
      'id, name_en, name_ku, name_ar, content_en, content_ku, content_ar, price_per_ticket, deadline, category_id, created_at, image, purchases (id, user_id, quantity)',
    )
    .is('is_deleted', false)
    .gt('deadline', currentTime);

  if (error || !data.length) {
    console.log({ error });

    logger.error('Lotteries are not exist', error);
    throw new AppError('Lotteries are Not found', httpStatus.BAD_REQUEST);
  }

  return data;
};

export const retrieveFinishedLotteriesService = async () => {
  const currentTime = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from('lotteries')
    .select(
      'id, name_en, name_ku, name_ar, content_en, content_ku, content_ar, price_per_ticket, deadline, category_id',
    )
    .is('is_deleted', false)
    .lt('deadline', currentTime);

  if (error || !data.length) {
    logger.error('Lotteries are not exist');
    throw new AppError('Lotteries are Not found', httpStatus.BAD_REQUEST);
  }

  return data;
};

export const getPurchasedLotteriesByUserService = async (user: any) => {
  const { data, error } = await supabaseAdmin
    .from('purchases')
    .select(
      `
      id,
      lottery_id,
      user_id,
      quantity,
      created_at,
      activities,
      lotteries!inner ( * )
    `,
    )
    .eq('user_id', user.id)
    .eq('lotteries.is_deleted', false);

  if (error) {
    logger.error({ error });
    throw new AppError('Purchases are Not found', httpStatus.BAD_REQUEST);
  }

  return data;
};

export const updateLotteryService = async (
  id: string,
  name_en: string,
  name_ar: string,
  name_ku: string,
  content_en: string,
  content_ar: string,
  content_ku: string,
  category_id: number,
  image: string,
  deadline: Date,
) => {
  const currentDate = new Date().toISOString();
  const { error: updateError } = await supabaseAdmin
    .from('lotteries')
    .update({
      name_en,
      name_ar,
      name_ku,
      content_en,
      content_ar,
      content_ku,
      category_id,
      image,
      deadline,
    })
    .eq('id', id)
    .gte('deadline', currentDate);

  if (updateError) {
    logger.error('Error updating lottery', updateError.message);
    throw new AppError(
      'Failed to update lottery',
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  return true;
};

export const getLotteryActivitiesService = async (id: string) => {
  const { data, error } = await supabaseAdmin
    .from('purchases')
    .select('*, lotteries (*)')
    .eq('lottery_id', id)
    .single();

  if (error || !data) {
    logger.error('Activities not found');
    throw new AppError('Activities not found', httpStatus.BAD_REQUEST);
  }

  return data.activities;
};
