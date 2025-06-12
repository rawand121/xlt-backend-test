import multer from 'multer';
import httpStatus from 'http-status';
import { AppError } from './errorHandler';
import { isExtensionAllowed, isFileSizeExceeded } from './functions';

const fileFilter = (req: any, file: any, callback: any) => {
  if (!isExtensionAllowed(file.originalname)) {
    callback(
      new AppError('The file shoule be image type', httpStatus.BAD_REQUEST),
      false,
    );
  } else if (isFileSizeExceeded(file.size)) {
    callback(
      new AppError('The file should not exceed 5mb', httpStatus.BAD_REQUEST),
      false,
    );
  } else {
    callback(null, true);
  }
};

const storage = multer.memoryStorage();

export default multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
