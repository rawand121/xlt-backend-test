import { Router } from 'express';

import adminRoutes from './admin.routes';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import categoryRoutes from './category.routes';
import lotteryRoutes from './lottery.routes';
import checkoutRoutes from './checkout.routes';

const router = Router();

router.use('/admins', adminRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/lotteries', lotteryRoutes);
router.use('/checkout', checkoutRoutes);

export default router;
