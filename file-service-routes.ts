import { Router } from 'express';
import { 
  uploadFile,
  getFile,
  updateFile,
  deleteFile,
  listFiles
} from '../controllers/fileController';
import { validateFileUpload, validateFileUpdate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// File operations
router.post('/:partnerId/upload', validateFileUpload, uploadFile);
router.get('/:partnerId/:fileId', getFile);
router.put('/:partnerId/:fileId', validateFileUpdate, updateFile);
router.delete('/:partnerId/:fileId', deleteFile);
router.get('/:partnerId', listFiles);

export const FileRouter = router;