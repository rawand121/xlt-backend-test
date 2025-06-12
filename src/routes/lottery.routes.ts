import { Router } from 'express';
import {
  createLottery,
  getLotteries,
  getMyLotteries,
  uploadImage,
  getLotteryById,
  retrieveNotFinishedLotteries,
  getPurchasedLotteriesByUser,
  updateLottery,
  deleteLottery,
  getLotteryActivities,
} from '../controllers/lottery.controller';
import {
  createLotteryValidation,
  updateLotteryValidation,
} from '../validations/lottery.validation';
import storage from '../utils/multer';
import { isAuth } from '../middlewares/auth';
import { isAdmin } from '../middlewares/isAdmin';

const router = Router();

router.post('/', isAdmin, createLotteryValidation, createLottery);
router.get('/all', getLotteries);
router.get('/mylotteries', isAuth, getMyLotteries);
router.get('/notfinished', retrieveNotFinishedLotteries);
router.get('/mypurchases', isAuth, getPurchasedLotteriesByUser);
router.get('/:id', getLotteryById);
router.get('/:id/activities', getLotteryActivities);
router.post('/upload', storage.single('image'), uploadImage);
router.put('/:id', isAdmin, updateLotteryValidation, updateLottery);
router.delete('/:id', isAdmin, deleteLottery);

export default router;
