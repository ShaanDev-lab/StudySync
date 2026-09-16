import { Router, Request, Response } from 'express';
import { UserModel } from '../models/userModel.js';

const router = Router();

router.post('/sync', async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    const userId = await UserModel.sync({ name, email });
    res.json({ userId });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
