import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import * as userModel from '../models/userModel';

/**
 * Get all doctors
 * This endpoint returns all users with role "Doctor"
 */
export const getAllDoctors = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const doctors = await userModel.getAllDoctors();
    
    res.status(200).json(doctors);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all nurses
 * This endpoint returns all users with role "Nurse"
 */
export const getAllNurses = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const nurses = await userModel.getAllNurses();
    
    res.status(200).json(nurses);
  } catch (error) {
    next(error);
  }
};
