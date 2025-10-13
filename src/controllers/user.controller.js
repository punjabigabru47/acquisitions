/* eslint-disable linebreak-style */
/* eslint-disable linebreak-style */
import logger from '#config/logger.js';
import { getAllUsers, getUserById } from '#services/users.services.js';
import { db } from '#config/database.js';
import { users } from '#models/user.model.js';
import { eq } from 'drizzle-orm';

// Controller to fetch all users
export const fetchAllUsers = async (req, res, next) => {
  try {
    logger.info('Fetching all users from the database...');
    const AllUsers = await getAllUsers();
    res.status(200).json({
      message: 'Successfully retrieved all users',
      users: AllUsers,
      count: AllUsers.length,
    });
  } catch (error) {
    logger.error('Error in fetchAllUsers controller:', error);
    res.status(500).json({ error: 'Internal Server Error' });
    next(error);
  }
};

// Controller to fetch a user by ID
export const fetchUserById = async (req, res, next) => {
  const { id } = req.params; // Extract user ID from request parameters

  logger.info(`Fetching user with ID: ${id}`); // Log the ID being fetched

  try {
    const user = await getUserById(id); // Call the service to get user by ID

    if (!user) {
      logger.warn(`User with ID: ${id} not found`); // Log if user not found
      return res.status(404).json({ error: 'User not found' }); // Respond with 404 if user not found
    }
    // If user is found, respond with user data
    res.status(200).json({
      message: 'Successfully retrieved user',
      user,
    });
  } catch (error) {
    logger.error('Error in fetchUserById controller:', error);
    res.status(500).json({ error: 'Internal Server Error' });
    next(error);
  }
};

// Controller to update a user by ID
export const updateUserById = async (req, res, next) => {
  try {
    const { id } = req.params; // Extract user ID from request parameters
    const updates = req.body; // Extract updates from request body

    logger.info(`updating user with ID: ${id}`); // Log the ID being updated

    //check if user exists
    const existingUser = await getUserById(id);
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    //check for duplicate email if email is being updated
    if (updates.email && existingUser.email !== updates.email) {
      const [emailUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, updates.email))
        .limit(1);
      if (emailUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }
    //add updatedAt timestamp
    updates.updatedAt = new Date();
    // Call the service to update user by ID
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });
    // Return the updated user
    res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    logger.error('Error in updateUserById controller:', error);
    res.status(500).json({ error: 'Internal Server Error' });
    next(error);
  }
};

// Controller to delete a user by ID
export const deleteUserById = async (req, res, next) => {
  try {
    const { id } = req.params; // Extract user ID from request parameters
    logger.info(`Deleting user with ID: ${id}`); // Log the ID being deleted

    // Step 1: Check if user exists
    const existingUser = await getUserById(id);
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
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
    res.status(200).json({
      message: `User with ID ${id} deleted successfully`,
      user: deletedUser,
    });
  } catch (error) {
    logger.error('Error in deleteUserById controller:', error);
    res.status(500).json({ error: 'Internal Server Error' });
    next(error);
  }
};
