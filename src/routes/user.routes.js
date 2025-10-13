/* eslint-disable linebreak-style */
import {
  fetchAllUsers,
  fetchUserById,
  updateUserById,
  deleteUserById,
} from '#controllers/user.controller.js';
import express from 'express';
const router = express.Router();

router.get('/', fetchAllUsers);

router.get('/:id', fetchUserById);

router.put('/:id', updateUserById);

router.delete('/:id', deleteUserById);

export default router;
