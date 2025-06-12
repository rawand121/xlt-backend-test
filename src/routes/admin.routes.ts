import { Router } from 'express';
import {
  createAdmin,
  deleteAdmin,
  // getAdminByEmail,
  getAdmins,
  updateAdmin,
} from '../controllers/admin.controller';
import {
  createAdminValidation,
  updateAdminValidation,
  // getAdminByEmailValidation,
} from '../validations/admin.validation';
import { isAdmin } from '../middlewares/isAdmin';

const router = Router();

router.post('/', isAdmin, createAdminValidation, createAdmin);
router.get('/', isAdmin, getAdmins);
router.put('/:id', isAdmin, updateAdminValidation, updateAdmin);
router.delete('/:id', isAdmin, deleteAdmin);

export default router;
