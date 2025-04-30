import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import pool from '../utils/db';
import { z } from 'zod';
import * as patientModel from '../models/patientModel';

/**
 * Schema for validating patient creation request
 */
const createPatientSchema = z.object({
    name: z.string().min(1, { message: 'Patient name is required' }),
    age: z.number().int().positive({ message: 'Age must be a positive number' }),
    gender: z.string().min(1, { message: 'Gender is required' }),
    medical_history: z.string().optional(),
    doctor_id: z.number().int().positive().optional()
});

/**
 * Create a new patient
 */
export const createPatient = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        // Get the nurse's ID from the authenticated user
        const nurseId = req.user?.userId;
        if (!nurseId) {
            return res.status(401).json({ message: 'Unauthorized. User ID not found.' });
        }

        // Validate the request body
        const patientData = createPatientSchema.parse(req.body);
        
        // Add the nurse_id to the patient data
        const newPatient = {
            ...patientData,
            nurse_id: nurseId
        };
        
        // Create the patient in the database
        const patientId = await patientModel.createPatient(pool, newPatient);
        
        res.status(201).json({
            message: 'Patient created successfully',
            patient_id: patientId
        });
        
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: error.errors
            });
        }
        next(error);
    }
};

/**
 * Get all patients assigned to the logged-in nurse
 */
export const getNursePatients = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        // Get the nurse's ID from the authenticated user
        const nurseId = req.user?.userId;
        if (!nurseId) {
            return res.status(401).json({ message: 'Unauthorized. User ID not found.' });
        }
        
        // Query the database for patients assigned to this nurse
        const result = await pool.query(
            `SELECT p.id, p.name, p.age, p.gender, p.medical_history,
                    p.nurse_id, p.doctor_id, p.created_at
            FROM patients p
            WHERE p.nurse_id = $1
            ORDER BY p.name`,
            [nurseId]
        );
        
        res.status(200).json(result.rows);
        
    } catch (error) {
        next(error);
    }
};

/**
 * Get a patient by ID
 */
export const getPatientById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        // Get the nurse's ID from the authenticated user
        const nurseId = req.user?.userId;
        if (!nurseId) {
            return res.status(401).json({ message: 'Unauthorized. User ID not found.' });
        }
        
        const patientId = parseInt(req.params.id, 10);
        if (isNaN(patientId)) {
            return res.status(400).json({ message: 'Invalid patient ID.' });
        }
        
        // Query the database for the patient, ensuring the nurse has access
        const result = await pool.query(
            `SELECT p.id, p.name, p.age, p.gender, p.medical_history,
                    p.nurse_id, p.doctor_id, p.created_at
            FROM patients p
            WHERE p.id = $1 AND p.nurse_id = $2`,
            [patientId, nurseId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Patient not found or not assigned to you.' });
        }
        
        res.status(200).json(result.rows[0]);
        
    } catch (error) {
        next(error);
    }
};

/**
 * Get all patients 
 * This is a temporary endpoint just to make testing easier
 */
export const getAllPatients = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Query the database for all patients
        const result = await pool.query(
            `SELECT p.id, p.name, p.age, p.gender, p.medical_history,
                    p.nurse_id, p.doctor_id, p.created_at
            FROM patients p
            ORDER BY p.name`
        );
        
        res.status(200).json(result.rows);
        
    } catch (error) {
        next(error);
    }
};
