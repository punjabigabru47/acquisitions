/* eslint-disable linebreak-style */
import logger from '#config/logger.js';
import { signUpSchema } from '#validations/auth.validations.js';
import { formatValidationErrors } from '#utils/format.js';
import { createUser } from '#services/auth.services.js';
import { jwtToken } from '#utils/jwt.js';
import { cookies } from '#utils/cookies.js';

export const signUp = async (req, res) => {
  try {
    const validationResult = signUpSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'validation failed',
        details: formatValidationErrors(validationResult.error),
      });
    }

    // Simulate user creation logic
    const { name, email, role, password } = validationResult.data;

    //authService.createUser(name, email, role);
    const user = createUser({ name, email, password, role });

    const token = jwtToken.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    cookies.set(res, 'token', token);

    logger.info(`user created: ${email} with role: ${role}`);
    return res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Error in signUp', error);

    if (error.message === 'User already exists') {
      return res.status(409).json({ error: 'Email already in use' });
    }
  }
};
