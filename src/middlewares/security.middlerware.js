/* eslint-disable linebreak-style */
/* eslint-disable no-unused-vars */
/* eslint-disable linebreak-style */
import aj from '#config/arcjet.js';
import { slidingWindow } from '@arcjet/node';
import logger from '#config/logger.js';

const securityMiddleware = async (req, res, next) => {
  try {
    const role = req.user?.role || 'guest';

    let limit;
    let message;

    switch (role) {
      case 'admin':
        limit = 20;
        message = 'Admin request has been exceeded (limit: 20 requests per 2s)';
        break;
      case 'user':
        limit = 10;
        message = 'Admin request has been exceeded (limit: 10 requests per 2s)';
        break;
      case 'guest':
        limit = 5;
        message = 'Admin request has been exceeded (limit: 5 requests per 2s)';
        break;
    }
    const client = aj.withRule(
      slidingWindow({
        mode: 'LIVE',
        interval: '1m',
        max: limit,
        name: `${role}-rate-limit`,
      })
    );
    const decision = await client.protect(req);
    if (decision.isDenied() && decision.reason.isBot()) {
      logger.warn('Bot detected', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
      });
      return res
        .status(403)
        .json({ error: 'Forbidden', message: 'Bot access is forbidden' });
    }

    if (decision.isDenied() && decision.reason.isShield()) {
      logger.warn('Request blocked by shield', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method,
      });
      return res
        .status(403)
        .json({ error: 'Forbidden', message: 'Access is forbidden' });
    }
    if (decision.isDenied() && decision.reason.isRateLimit()) {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method,
      });
    }
    next();
  } catch (error) {
    console.error('security middleware error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'something went wrong with security middleware',
    });
  }
};

export default securityMiddleware;
