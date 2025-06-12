import 'dotenv/config';
import winston, { format } from 'winston';
import envVar from './envVars';

const customFormat = format.printf(({ level, timestampt, message, stack }) => {
  return `${timestampt} - ${level}: ${stack || message}`;
});

const winstonLogger = winston.createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    customFormat,
    envVar.NODE_ENV === 'development' ? format.colorize() : format.uncolorize(),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: format.json(),
    }),
    new winston.transports.File({
      filename: 'logs/info.log',
      level: 'info',
      format: format.json(),
    }),
  ],
});

export default winstonLogger;
