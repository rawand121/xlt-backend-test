import { AppError } from '../utils/errorHandler';
import httpStatus from 'http-status';
import logger from '../configs/winston.logger';
import { supabaseAdmin } from '../connections/database';

export const createCheckoutService = async (
  quantity: number,
  lotteryId: string,
  user: any,
) => {
  const currentTime = new Date().toISOString();

  const activityItem = {
    qty: quantity,
    created_at: currentTime,
  };

  const { data: alreadyPurchasedData, error: alreadyPurchasedError } =
    await supabaseAdmin
      .from('purchases')
      .select('*, lotteries (*)')
      .eq('user_id', user.id)
      .eq('lottery_id', lotteryId)
      .gt('lotteries.deadline', currentTime)
      .single();

  if (alreadyPurchasedError && alreadyPurchasedError.code !== 'PGRST116') {
    logger.error('Error checking purchase', alreadyPurchasedError.message);
    throw new AppError('Failed to find purchase', httpStatus.BAD_REQUEST);
  }

  if (alreadyPurchasedData) {
    const updatedActivities = Array.isArray(alreadyPurchasedData.activities)
      ? [...alreadyPurchasedData.activities, activityItem]
      : [activityItem];

    const { error: updateError } = await supabaseAdmin
      .from('purchases')
      .update({
        quantity: quantity + alreadyPurchasedData.quantity,
        activities: updatedActivities,
      })
      .eq('id', alreadyPurchasedData.id);

    if (updateError) {
      logger.error('Error updating purchase', updateError.message);
      throw new AppError(
        'Failed to update purchase',
        httpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  } else {
    const { data: foundLottery, error: foundLotteryError } = await supabaseAdmin
      .from('lotteries')
      .select('*')
      .eq('id', lotteryId)
      .gt('deadline', currentTime)
      .single();

    if (!foundLottery || foundLotteryError) {
      logger.error('Lottery not found', foundLotteryError?.message);
      throw new AppError('Lottery not found', httpStatus.BAD_REQUEST);
    }

    const { error: createError } = await supabaseAdmin
      .from('purchases')
      .insert({
        quantity,
        lottery_id: lotteryId,
        user_id: user.id,
        activities: [activityItem], // initialize history on first purchase
      });

    if (createError) {
      logger.error('Error creating purchase', createError.message);
      throw new AppError(
        'Failed to create purchase',
        httpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  return true;
};

export const getCheckoutsByLotteryIdService = async (id: string) => {
  const { data, error } = await supabaseAdmin
    .from('purchases')
    .select('*, lotteries (*), users (*)')
    .eq('lottery_id', id);
  // .order('created_at', { ascending: false });

  if (error) {
    console.log({ error });

    logger.error('Error fetching purchases', error.message);
    throw new AppError('Failed to fetch purchases', httpStatus.BAD_REQUEST);
  }

  return data;
};
