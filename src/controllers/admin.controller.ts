import { Request, Response } from 'express';
import catchAsync from '../utils/asyncHandller';
import {
  createAdminService,
  findAdminByEmailService,
  findAdminsService,
  updateAdminService,
  deleteAdminService,
} from '../services/admin.services';

export const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const { full_name, phone, password, email, confirmPassword } = req.body;

  const user = await createAdminService(
    full_name,
    password,
    phone,
    email,
    confirmPassword,
  );

  res.status(201).json({ user });
});

export const getAdminByEmail = catchAsync(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    const admins = await findAdminByEmailService(email);

    res.status(201).json({ admins });
  },
);

export const getAdmins = catchAsync(async (req: Request, res: Response) => {
  const admins = await findAdminsService();

  res.status(201).json({ admins });
});

export const updateAdmin = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { full_name, phone, password, confirmPassword } = req.body;

  const user = await updateAdminService(
    id,
    full_name,
    password,
    phone,
    confirmPassword,
  );

  res.status(201).json({ user });
});

export const deleteAdmin = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  await deleteAdminService(id);

  res.status(201).json({ message: 'Admin deleted successfully' });
});
