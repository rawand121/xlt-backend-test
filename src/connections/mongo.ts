import mongoose from 'mongoose';
import logger from '../configs/winston.logger';
import envVar from '../configs/envVars';

const connecttToDatabase = async () => {
  try {
    if (!envVar.MONGO_URI) {
      throw new Error('MONGO_URI is not defined');
    }

    const database = await mongoose.connect(envVar.MONGO_URI);
    logger.info(`Database connected to ${database.connection.name}`);
  } catch (error) {
    logger.error({ error });
  }
};

export default connecttToDatabase;
