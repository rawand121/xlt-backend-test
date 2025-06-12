import { Router } from 'express';
import {
  createCheckout,
  getPurchasesByLotteryId,
} from '../controllers/checkout.controller';
import { createCheckoutValidation } from '../validations/checkout.validation';
import { isAuth } from '../middlewares/auth';
import { isAdmin } from '../middlewares/isAdmin';

const router = Router();

router.post('/', isAuth, createCheckoutValidation, createCheckout);
router.get('/:id', isAdmin, getPurchasesByLotteryId);
// router.post('/status', handleSession);
// router.get('/me', getMyProfile);

export default router;
