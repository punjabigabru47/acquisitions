/* eslint-disable linebreak-style */
import logger from '#config/logger.js';
import { users } from '#models/user.model.js';
import { db } from '#config/database.js';
import { eq } from 'drizzle-orm';

//get all users
export const getAllUsers = async () => {
  try {
    const AllUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users);
    return AllUsers;
  } catch (error) {
    logger.error('Error fetching users:', error);
    throw error;
  }
};

//get user by id
export const getUserById = async id => {
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
    logger.error('Error fetching user by ID:', error);
    throw error;
  }
};

// update user by id
export const updateUserById = async (id, updates) => {
  try {
    // first check if user exists
    const existingUser = await getUserById(id);

    //check if email is being updated and if it already exists
    if (updates.email && existingUser.email !== updates.email) {
      const [emailUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, updates.email))
        .limit(1);
      if (emailUser) {
        throw new Error('Email already in use');
      }
    }
    // add updatedAt timestamp
    updates.updatedAt = new Date();

    //  Update user in the database
    await db.update(users).set(updates).where(eq(users.id, id));
    const [updatedUser] = await db.select().from(users).where(eq(users.id, id));
    return updatedUser;
  } catch (error) {
    logger.error('Error updating user by ID:', error);
    throw error;
  }
};

// delete user by id
export const deleteUserById = async id => {
  try {
    // Step 1: Check if user exists
    const existingUser = await getUserById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Step 2: Delete user from the database and return deleted record
    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    // Step 3: Return deleted user info or confirmation
    return {
      message: `User with ID ${id} deleted successfully`,
      deletedUser, // return deleted data as well
    };
  } catch (error) {
    logger.error('Error deleting user by ID:', error);
    throw error;
  }
};
