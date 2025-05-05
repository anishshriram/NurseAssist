import express from 'express';
import { getAllConditionsController, getConditionByIdController } from '../controllers/conditionController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Get all conditions
router.get('/', getAllConditionsController);

// Get condition by ID
router.get('/:id', getConditionByIdController);

export default router;
