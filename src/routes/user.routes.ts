import { Router } from 'express';
import {
  createUser,
  getUsers,
  updateUser,
  sendOtp,
  verifyCode,
} from '../controllers/user.controller';
import {
  createUserValidation,
  updateUserValidation,
  sendOtpRegisterValidation,
  verifyTheCodeValidation,
} from '../validations/user.validation';

const router = Router();

router.post('/', createUserValidation, createUser);
router.get('/', getUsers);
router.put('/:id', updateUserValidation, updateUser);
router.post('/send_otp', sendOtpRegisterValidation, sendOtp);
router.post('/verify_code', verifyTheCodeValidation, verifyCode);

export default router;
