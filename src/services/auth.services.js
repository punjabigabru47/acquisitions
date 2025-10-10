/* eslint-disable linebreak-style */
import { eq } from 'drizzle-orm';
import { db } from '#config/database.js';
import logger from '#config/logger.js';
import bcrypt from 'bcrypt';
import { users } from '#models/user.model.js';

export const hashPassword = async password => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    logger.error(`Error hashing password: ${error.message}`);
    throw new Error('Password hashing failed');
  }
};

//create user function
export const createUser = async ({ name, email, password, role = 'user' }) => {
  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existingUser.length > 0) {
      throw new Error('User already exists');
    }
    const hashedPassword = await hashedPassword(password);
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        role,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      });
    logger.info(`User created with email: ${users.email}`);
    return newUser;
  } catch (error) {
    logger.error(`Error creating user: ${error.message}`);
    throw new Error('User creation failed');
  }
};
