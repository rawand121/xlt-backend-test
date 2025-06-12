import { createClient } from 'redis';
import winstonLogger from '../configs/winston.logger';

const client = createClient();

client.on('error', (err) => winstonLogger.error('Redis Client Error', err));

export default client;
