import express from 'express';
import logger from '#config/logger.js';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan('combined', {
    stream: { write: message => logger.info(message.trim()) },
  })
);
app.use(helmet());

app.get('/', (req, res) => {
  logger.info('hello from the acquisitions!');
  res.status(200).send('Hello from the acquisitions!');
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/api', (req, res) => {
  res.status(200).send('Hello from the acquisitions API!');
});

// Import and use routes
import authRoutes from '#routes/auth.routes.js';
app.use('/api/auth', authRoutes); // Use auth routes with /api/auth sign-up, sign-in, sign-out
export default app;
