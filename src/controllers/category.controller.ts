import { Request, Response } from 'express';
import catchAsync from '../utils/asyncHandller';
import {
  createCategoryService,
  deleteCategoryService,
  findCategoriesService,
  updateCategoryService,
} from '../services/category.services';

export const createCategory = catchAsync(
  async (req: Request, res: Response) => {
    const { name, name_ku, name_ar } = req.body;

    const user = await createCategoryService(name, name_ku, name_ar);

    res.status(201).json({ user });
  },
);

export const getCategories = catchAsync(async (req: Request, res: Response) => {
  const categories = await findCategoriesService();

  res.status(201).json({ categories });
});

export const updateCategory = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, name_ku, name_ar } = req.body;

    const user = await updateCategoryService(id, name, name_ku, name_ar);

    res.status(201).json({ user });
  },
);

export const deleteCategory = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    await deleteCategoryService(id);

    res.status(201).json({ message: 'Category deleted successfully' });
  },
);
