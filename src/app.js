import logger from '#config/logger.js';
import {
  errorHandler,
  notFoundHandler,
} from '#middlewares/error.middleware.js';
import securityMiddleware from '#middlewares/security.middleware.js';
import authRoutes from '#routes/auth.routes.js';
import usersRoutes from '#routes/users.routes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();

// helmet for security headers.
app.use(helmet());

// express.json for parsing json bodies.
app.use(express.json());

// express.urlencoded for parsing urlencoded bodies.
app.use(express.urlencoded({ extended: true }));

// morgan for monitoring http requests and debug.
app.use(
  morgan('combined', {
    stream: { write: message => logger.info(message.trim()) },
  })
);

// cors for cross-origin requests.
app.use(cors());

//cookie parser for parsing cookies.
app.use(cookieParser());

// security middleware for rate limiting and bot detection.
app.use(securityMiddleware);

app.get('/', (req, res) => {
  logger.info('Hello acquisitions');
  res.status(200).send('Hello acquisitions');
});

// auth routes..
app.use('/api/auth', authRoutes);

// users routes..
app.use('/api/users', usersRoutes);

// health check route.
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// api routes..
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the Acquisitions API',
  });
});

// handle unknown routes and application errors.
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
