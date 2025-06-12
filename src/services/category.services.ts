import { AppError } from '../utils/errorHandler';
import httpStatus from 'http-status';
import logger from '../configs/winston.logger';
import { supabaseAdmin } from '../connections/database';

export const createCategoryService = async (
  name: string,
  name_ku: string,
  name_ar: string,
) => {
  if (!name) {
    throw new AppError('Name is required', httpStatus.BAD_REQUEST);
  }

  const { error: createError } = await supabaseAdmin.from('categories').insert({
    name_en: name,
    name_ku,
    name_ar,
  });

  if (createError) {
    logger.error('Error creating category', createError.message);
    throw new AppError(
      'Failed to create admin',
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  return true;
};

export const findCategoriesService = async () => {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('id, name_en, name_ku, name_ar, created_at')
    .eq('is_deleted', false);

  if (error || !data) {
    logger.error('Categories are not exist');
    throw new AppError('Categories are Not found', httpStatus.BAD_REQUEST);
  }

  return data;
};

export const deleteCategoryService = async (id: string) => {
  const { error: deleteError } = await supabaseAdmin
    .from('categories')
    .update({ is_deleted: true })
    .eq('id', id);

  if (deleteError) {
    logger.error('Error deleting category', deleteError.message);
    throw new AppError(
      'Failed to delete category',
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  return true;
};

export const updateCategoryService = async (
  id: string,
  name: string,
  name_ku: string,
  name_ar: string,
) => {
  if (!name) {
    throw new AppError('Name is required', httpStatus.BAD_REQUEST);
  }

  const { error: updateError } = await supabaseAdmin
    .from('categories')
    .update({ name_en: name, name_ku, name_ar })
    .eq('id', id);

  if (updateError) {
    logger.error('Error updating category', updateError.message);
    throw new AppError(
      'Failed to update category',
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  return true;
};
