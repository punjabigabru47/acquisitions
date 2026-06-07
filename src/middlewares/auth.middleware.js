import logger from '#config/logger.js';
import { cookies } from '#utils/cookies.js';
import { jwtToken } from '#utils/jwt.js';

export const authenticateToken = (req, res, next) => {
  try {
    const token = cookies.get(req, 'token');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token is required',
      });
    }

    req.user = jwtToken.verify(token);
    next();
  } catch (error) {
    logger.error('Error authenticating token', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token',
    });
  }
};

export const requireRole = role => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    logger.info(`Checking ${role} access for user role: ${userRole}`);

    if (userRole !== role) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource',
      });
    }

    next();
  };
};
