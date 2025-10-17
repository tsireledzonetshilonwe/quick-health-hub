import { Router } from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getMe,
  updateMe,
} from '../controllers/user.controller';

const router = Router();

router.get('/', getUsers);
router.post('/', createUser);
router.get('/me', getMe);
router.put('/me', updateMe);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
