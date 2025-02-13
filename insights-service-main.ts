import express from 'express';
import { json } from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import { InsightsRouter } from './routes/insightsRoutes';
import { initializePostgres } from './database';
import { startAnalysisWorker } from './workers/analysisWorker';
import { handleServiceError } from '../../../shared/utils/communication';

const app = express();

// Middleware
app.use(cors());
app.use(json());
app.use(morgan('combined'));

// Initialize database
initializePostgres()
  .then(() => {
    console.log('Connected to PostgreSQL');
    // Start background analysis worker
    return startAnalysisWorker();
  })
  .then(() => {
    console.log('Analysis worker started');
  })
  .catch(err => {
    console.error('Failed to initialize services:', err);
    process.exit(1);
  });

// Routes
app.use('/insights', InsightsRouter);

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

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(`Insights service running on port ${PORT}`);
});