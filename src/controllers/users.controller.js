import logger from '#config/logger.js';
import {
  deleteUser,
  getUser,
  getUsers,
  updateUser,
} from '#services/users.service.js';
import { formatValidationErrors } from '#utils/format.js';
import {
  updateUserSchema,
  userIdSchema,
} from '#validations/users.validation.js';

export const fetchAllUsers = async (req, res, next) => {
  try {
    logger.info('Getting users...');

    const allUsers = await getUsers();
    res.status(200).json({
      success: true,
      message: 'Users fetched successfully',
      data: allUsers,
      total: allUsers.length,
    });
  } catch (error) {
    logger.error('Error getting users', error);
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    logger.info('Getting user...');

    const paramsValidation = userIdSchema.safeParse(req.params);

    if (!paramsValidation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: formatValidationErrors(paramsValidation.error),
      });
    }

    const { id } = paramsValidation.data;

    const user = await getUser(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User fetched successfully',
      data: user,
    });
  } catch (error) {
    logger.error('Error getting user', error);
    next(error);
  }
};

export const updateUserById = async (req, res, next) => {
  try {
    logger.info('Updating user...');

    const paramsValidation = userIdSchema.safeParse(req.params);

    if (!paramsValidation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: formatValidationErrors(paramsValidation.error),
      });
    }

    const bodyValidation = updateUserSchema.safeParse(req.body);

    if (!bodyValidation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: formatValidationErrors(bodyValidation.error),
      });
    }

    const { id } = paramsValidation.data;

    const user = await updateUser(id, bodyValidation.data);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    logger.error('Error updating user', error);

    if (error.message === 'No fields to update') {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
      });
    }

    next(error);
  }
};

export const deleteUserById = async (req, res, next) => {
  try {
    logger.info('Deleting user...');

    const paramsValidation = userIdSchema.safeParse(req.params);

    if (!paramsValidation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: formatValidationErrors(paramsValidation.error),
      });
    }

    const { id } = paramsValidation.data;

    const user = await deleteUser(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: user,
    });
  } catch (error) {
    logger.error('Error deleting user', error);
    next(error);
  }
};
