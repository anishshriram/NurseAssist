import { Request, Response } from 'express';
import { getAllConditions, getConditionById } from '../models/conditionModel';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import pool from '../utils/db';

/**
 * Get all medical conditions
 * @route GET /api/conditions
 * @access Private
 */
export const getAllConditionsController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const conditions = await getAllConditions(pool);
    
    res.status(200).json(conditions);
  } catch (error) {
    console.error('Error in getAllConditionsController:', error);
    res.status(500).json({ message: 'Failed to retrieve conditions' });
  }
};

/**
 * Get condition by ID
 * @route GET /api/conditions/:id
 * @access Private
 */
export const getConditionByIdController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const conditionId = parseInt(req.params.id);
    
    if (isNaN(conditionId)) {
      res.status(400).json({ message: 'Invalid condition ID' });
      return;
    }
    
    const condition = await getConditionById(pool, conditionId);
    
    if (!condition) {
      res.status(404).json({ message: 'Condition not found' });
      return;
    }
    
    res.status(200).json(condition);
  } catch (error) {
    console.error(`Error in getConditionByIdController:`, error);
    res.status(500).json({ message: 'Failed to retrieve condition' });
  }
};
