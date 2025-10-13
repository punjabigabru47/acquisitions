/* eslint-disable linebreak-style */
import logger from '#config/logger.js';
import { signUpSchema, signInSchema } from '#validations/auth.validations.js';
import { formatValidationErrors } from '#utils/format.js';
import { createUser, findUserByEmail } from '#services/auth.services.js';
import { jwtToken } from '#utils/jwt.js';
import { cookies } from '#utils/cookies.js';
import bcrypt from 'bcrypt';

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
    const user = await createUser({ name, email, password, role });

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

//signin controller
export const signIn = async (req, res) => {
  try {
    // validate input using zod schema
    const validationResult = signInSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'validation failed',
        details: formatValidationErrors(validationResult.error),
      });
    }
    const { email, password } = validationResult.data; // Extract validated data

    //find user by email
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'user not found' });
    }

    //compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'invalid credentials' });
    }

    //generate jwt token
    const token = jwtToken.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    //set token in httpOnly cookie
    cookies.set(res, 'token', token);

    //log and send response
    logger.info(`user signed in: ${email} with role: ${user.role} `);
    return res.status(200).json({
      message: 'Sign-in successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Error in signIn', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

//signout controller
export const signOut = async (req, res) => {
  try {
    cookies.clear(res, 'token');
    logger.info('User signed out');
    return res.status(200).json({ message: 'Sign-out successful' });
  } catch (error) {
    logger.error('Error in signOut', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
