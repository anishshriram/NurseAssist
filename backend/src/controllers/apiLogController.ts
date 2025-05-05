import { Request, Response } from 'express';
import { Pool } from 'pg';
import { 
  getAllApiLogs, 
  getApiLogById,
  getApiLogsByDiagnosisId 
} from '../models/apiLogModel';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { z } from 'zod';

// Schema for get API log by ID validation
const getApiLogByIdSchema = z.object({
  id: z.string().transform(val => parseInt(val, 10)).refine(val => !isNaN(val), {
    message: 'ID must be a valid number'
  })
});

// Schema for get API logs by diagnosis ID validation
const getApiLogsByDiagnosisIdSchema = z.object({
  diagnosisId: z.string().transform(val => parseInt(val, 10)).refine(val => !isNaN(val), {
    message: 'Diagnosis ID must be a valid number'
  })
});

/**
 * Get all API logs
 * @param {AuthenticatedRequest} req The request object
 * @param {Response} res The response object
 * @returns The API logs or an error
 */
export async function getAllApiLogsController(req: AuthenticatedRequest, res: Response) {
  // Import the pool
  const pool = require('../utils/db');
  
  try {
    // Only admin users should be able to view all API logs
    if (req.user?.role !== 'Admin' && req.user?.role !== undefined) {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }

    const logs = await getAllApiLogs(pool);
    return res.status(200).json(logs);
  } catch (error) {
    console.error('Error in getAllApiLogsController:', error);
    return res.status(500).json({ error: 'Failed to fetch API logs' });
  }
}

/**
 * Get an API log by its ID
 * @param {AuthenticatedRequest} req The request object
 * @param {Response} res The response object
 * @returns The API log or an error
 */
export async function getApiLogByIdController(req: AuthenticatedRequest, res: Response) {
  // Import the pool
  const pool = require('../utils/db');
  
  try {
    // Only admin users should be able to view API logs
    if (req.user?.role !== 'Admin' && req.user?.role !== undefined) {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }

    // Validate the ID parameter
    const validationResult = getApiLogByIdSchema.safeParse({ id: req.params.id });
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid ID format',
        details: validationResult.error.format()
      });
    }

    const { id } = validationResult.data;
    const log = await getApiLogById(pool, id);

    if (!log) {
      return res.status(404).json({ error: `API log with ID ${id} not found` });
    }

    return res.status(200).json(log);
  } catch (error) {
    console.error('Error in getApiLogByIdController:', error);
    return res.status(500).json({ error: 'Failed to fetch API log' });
  }
}

/**
 * Get API logs for a specific diagnosis
 * @param {AuthenticatedRequest} req The request object
 * @param {Response} res The response object
 * @returns The API logs for the diagnosis or an error
 */
export async function getApiLogsByDiagnosisIdController(req: AuthenticatedRequest, res: Response) {
  // Import the pool
  const pool = require('../utils/db');
  
  try {
    // Only admin, doctors, and nurses should be able to view API logs for a diagnosis
    if (!['Admin', 'Doctor', 'Nurse'].includes(req.user?.role || '')) {
      return res.status(403).json({ error: 'Access denied. Authenticated users only.' });
    }

    // Validate the diagnosis ID parameter
    const validationResult = getApiLogsByDiagnosisIdSchema.safeParse({ 
      diagnosisId: req.params.diagnosisId 
    });
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid diagnosis ID format',
        details: validationResult.error.format()
      });
    }

    const { diagnosisId } = validationResult.data;
    const logs = await getApiLogsByDiagnosisId(pool, diagnosisId);

    return res.status(200).json(logs);
  } catch (error) {
    console.error('Error in getApiLogsByDiagnosisIdController:', error);
    return res.status(500).json({ error: 'Failed to fetch API logs for diagnosis' });
  }
}
