import { OTPiqClient } from 'otpiq';
import envVar from './envVars';

const clientOtp = new OTPiqClient({
  apiKey: envVar.OTP_IQ_API_KEY,
});

export default clientOtp;
