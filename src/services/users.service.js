import { db } from '#config/database.js';
import logger from '#config/logger.js';
import { users } from '#models/user.model.js';
import { eq } from 'drizzle-orm';

export const getUsers = async () => {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users);
    return allUsers;
  } catch (error) {
    logger.error('Error getting users', error);
    throw error;
  }
};

export const getUser = async id => {
  try {
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user;
  } catch (error) {
    logger.error('Error getting user', error);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const allowedFields = ['name', 'email', 'role'];
    const updateData = Object.fromEntries(
      Object.entries(userData).filter(
        ([key, value]) => allowedFields.includes(key) && value !== undefined
      )
    );

    if (Object.keys(updateData).length === 0) {
      throw new Error('No fields to update');
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    return updatedUser;
  } catch (error) {
    logger.error('Error updating user', error);
    throw error;
  }
};

export const deleteUser = async id => {
  try {
    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      });

    return deletedUser;
  } catch (error) {
    logger.error('Error deleting user', error);
    throw error;
  }
};
