import {
  deleteUserById,
  fetchAllUsers,
  getUserById,
  updateUserById,
} from '#controllers/users.controller.js';
import {
  authenticateToken,
  requireRole,
} from '#middlewares/auth.middleware.js';
import express from 'express';

const router = express.Router();

router.use(authenticateToken);

router.get('/', requireRole('admin'), fetchAllUsers);

router.get('/:id', getUserById);

router.put('/:id', updateUserById);

router.delete('/:id', requireRole('admin'), deleteUserById);

export default router;
