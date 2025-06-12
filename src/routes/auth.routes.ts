import { Router } from 'express';
import {
  login,
  handleSession,
  getMyProfile,
  handleSessionForUser,
  getMyAdminProfile,
  logoutUser,
  logoutAdmin,
} from '../controllers/auth.controller';
import { loginValidation } from '../validations/auth.validation';
import { isAuth } from '../middlewares/auth';
import { fetchAdmin } from '../middlewares/isAdmin';

const router = Router();

router.post('/login', loginValidation, login);
router.post('/status', handleSession);
router.post('/status/user', handleSessionForUser);
router.get('/me', isAuth, getMyProfile);
router.get('/me-admin', fetchAdmin, getMyAdminProfile);
router.post('/logout', logoutUser);
router.post('/logout-admin', logoutAdmin);

export default router;
