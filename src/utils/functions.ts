import fs from 'fs';

export const isExtensionAllowed = (fileName: string) => {
  const validExtensions = /\.(jpg|jpeg|png)$/i;
  return validExtensions.test(fileName);
};

export const isFileSizeExceeded = (fileSize: number) => {
  const maxFileSize = 5 * 1024 * 1024; // 5mb
  return fileSize > maxFileSize;
};

export const isFileExist = (filePath: string) => {
  return fs.existsSync(filePath);
};

/**
 * Helper to parse strings like "7d", "24h" into milliseconds
 * (you can replace with your own env parser)
 */
export const parseDuration = (str: string): number => {
  const match = /^(\d+)([smhd])$/.exec(str);
  if (!match) return 0;
  const [, num, unit] = match;
  const n = parseInt(num, 10);
  switch (unit) {
    case 's':
      return n * 1_000;
    case 'm':
      return n * 60_000;
    case 'h':
      return n * 3_600_000;
    case 'd':
      return n * 86_400_000;
    default:
      return 0;
  }
};

export const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
};
