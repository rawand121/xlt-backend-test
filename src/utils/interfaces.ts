import mongoose from 'mongoose';
import { JwtPayload } from 'jsonwebtoken';

export interface userInterface {
  _id: mongoose.Types.ObjectId;
  first_name: string;
  last_name: string;
  phone: string;
  isDeleted: boolean;
  isDeactivated: boolean;
  role: string;
}

export interface userTokenPayload {
  id: string;
  iat: number;
  exp: number;
}

export interface refreshTokenPayloadInterface extends JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

export interface RateLimiterRes {
  msBeforeNext: number; // Time in milliseconds until the next available attempt
  remainingPoints: number; // Remaining points for the user in the current window
  consumedPoints: number; // Points consumed so far
  isFirstInDuration: boolean; // True if this is the first action within the time window
}
