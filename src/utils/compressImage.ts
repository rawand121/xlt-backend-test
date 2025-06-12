import sharp from 'sharp';
import { AppError } from './errorHandler';
import httpStatus from 'http-status';

const compressImage = async (buffer: Buffer, outputPath: string) => {
  try {
    await sharp(buffer).webp({ quality: 80 }).toFile(outputPath);
  } catch (error: any) {
    throw new AppError(error.message, httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export default compressImage;
