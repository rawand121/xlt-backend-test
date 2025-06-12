import 'dotenv/config';
import connectToDatabase from '../connections/mongo';

const startDatabase = async () => {
  await connectToDatabase();
};

export default startDatabase;
