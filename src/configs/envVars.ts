const envVar = {
  PORT: process.env.PORT || 4000,
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || '',
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '15m',
  JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION || '7d',
  NODE_ENV: process.env.NODE_ENV || 'development',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  MAXATTEMPTSPERDAYBYEMAIL: process.env.MAXATTEMPTSPERDAYBYEMAIL || 15,
  MAXATTEMPTSPERDAYBYIP: process.env.MAXATTEMPTSPERDAYBYIP || 10,
  MAXATTEMPTSBYIPINTENMINUTES: process.env.MAXATTEMPTSBYIPINTENMINUTES || 10,
  MONGO_URI: process.env.MONGO_URI || '',
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
  OTP_IQ_API_KEY: process.env.OTP_IQ_API_KEY || '',
};

export default envVar;
