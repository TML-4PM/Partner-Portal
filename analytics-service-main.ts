import express from 'express';
import { json } from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import { AnalyticsRouter } from './routes/analyticsRoutes';
import { initializeKafka } from './kafka';
import { connectRedis } from './redis';
import { handleServiceError } from '../../../shared/utils/communication';

const app = express();

// Middleware
app.use(cors());
app.use(json());
app.use(morgan('combined'));

// Initialize connections
Promise.all([
  initializeKafka(),
  connectRedis()
])
.then(() => {
  console.log('All services initialized');
})
.catch(err => {
  console.error('Failed to initialize services:', err);
  process.exit(1);
});

// Routes
app.use('/analytics', AnalyticsRouter);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  const response = handleServiceError(err);
  res.status(response.status).json(response.body);
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Analytics service running on port ${PORT}`);
});