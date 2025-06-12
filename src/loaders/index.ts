import fs from 'fs';
import path from 'path';
import winstonLogger from '../configs/winston.logger';
import serverLoader from './express';
import databaseLoader from './database';
import client from '../connections/redis';

const loader = async (app: any) => {
  await serverLoader(app);
  winstonLogger.info('Server has loaded successfully.');

  await client.connect();
  winstonLogger.info('Redis has connected successfully.');

  await databaseLoader();
  winstonLogger.info('Database has loaded successfully.');

  if (!fs.existsSync(path.join(__dirname, '../../uploads'))) {
    fs.mkdirSync(path.join(__dirname, '../../uploads'));
  }
};

export default loader;
