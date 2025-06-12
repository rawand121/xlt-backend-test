import { Router } from 'express';
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller';
import { createCategoryValidation } from '../validations/category.validation';
import { isAdmin } from '../middlewares/isAdmin';

const router = Router();

router.post('/', isAdmin, createCategoryValidation, createCategory);
router.get('/', isAdmin, getCategories);
router.put('/:id', isAdmin, updateCategory);
router.delete('/:id', isAdmin, deleteCategory);

export default router;
