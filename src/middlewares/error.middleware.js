import env from '#config/env.js';
import logger from '#config/logger.js';

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
};

export const errorHandler = (error, req, res, _next) => {
  const statusCode = error.statusCode || error.status || 500;
  const isProduction = env.NODE_ENV === 'production';

  logger.error('Unhandled application error', {
    message: error.message,
    method: req.method,
    path: req.originalUrl,
    stack: error.stack,
  });

  res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500 && isProduction
        ? 'Internal server error'
        : error.message || 'Internal server error',
    ...(isProduction ? {} : { stack: error.stack }),
  });
};
