import express from 'express';
import { 
  getAllApiLogsController, 
  getApiLogByIdController,
  getApiLogsByDiagnosisIdController 
} from '../controllers/apiLogController';
import { protect as authenticateUser } from '../middleware/authMiddleware';

const router = express.Router();

// Protect all routes - require authentication
router.use(authenticateUser);

// GET /api/logs - Get all API logs (admin only)
router.get('/', getAllApiLogsController);

// GET /api/logs/:id - Get a specific API log by ID (admin only)
router.get('/:id', getApiLogByIdController);

// GET /api/logs/diagnosis/:diagnosisId - Get API logs for a specific diagnosis
router.get('/diagnosis/:diagnosisId', getApiLogsByDiagnosisIdController);

export default router;
