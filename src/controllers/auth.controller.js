import logger from '#config/logger.js';
import { formatValidationErrors } from '#utils/format.js';
import { signUpSchema } from '#validations/auth.validations.js';

export const signUp = async (req, res, next) => {
  try {
    const validationResult = signUpSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationErrors(validationResult.error),
      });
    }

    const { name, email, role } = validationResult.data;

    // auth service

    logger.info(`User registered successfully: ${email}`);
    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: 1,
        name,
        email,
        role,
      },
    });
  } catch (error) {
    logger.error('Error signing up', error);

    if (error.message === 'user with this email already exists') {
      return res.status(409).json({
        message: 'User with this email already exists',
      });
    }
    next(error);
  }
};
