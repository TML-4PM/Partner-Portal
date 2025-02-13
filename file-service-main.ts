import express from 'express';
import { json } from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import { validatePartnerId, validateFileMetadata, validatePermissions } from '../../../shared/utils/validation';
import { handleServiceError, ServiceError } from '../../../shared/utils/communication';
import { FileRouter } from './routes/fileRoutes';
import { connectDatabase } from './database';
import { setupStorage } from './storage';

const app = express();

// Middleware
app.use(cors());
app.use(json({ limit: '50mb' }));
app.use(morgan('combined'));

// Connect to MongoDB
connectDatabase()
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

// Initialize storage
setupStorage()
  .then(() => console.log('Storage initialized'))
  .catch(err => {
    console.error('Failed to initialize storage:', err);
    process.exit(1);
  });

// Routes
app.use('/files', FileRouter);

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

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`File service running on port ${PORT}`);
});