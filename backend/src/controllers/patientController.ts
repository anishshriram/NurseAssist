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
    age: z.union([
        z.number().int().positive(),
        z.string().transform(val => parseInt(val, 10))
    ]),
    gender: z.string().min(1, { message: 'Gender is required' }),
    medical_history: z.string().optional(),
    doctor_id: z.union([
        z.number().int().positive(),
        z.string().transform(val => parseInt(val, 10))
    ]).optional(),
    nurse_id: z.union([
        z.number().int().positive(),
        z.string().transform(val => parseInt(val, 10))
    ])
});

/**
 * Create a new patient
 */
export const createPatient = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        // Admin users need to be authenticated but we'll use the nurse_id from the request body
        // instead of the logged-in user's ID
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized. User ID not found.' });
        }

        console.log('Patient creation request body:', req.body);
        
        // Validate the request body and get patient data
        let patientData;
        try {
            patientData = createPatientSchema.parse(req.body);
            console.log('Validated patient data:', patientData);
        } catch (validationError) {
            console.error('Patient validation error:', validationError);
            throw validationError; // Re-throw to be caught by the outer try/catch
        }
        
        // Use the provided data directly (nurse_id is now required in the schema)
        const newPatient = {
            ...patientData
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
        const userEmail = req.user?.email;
        
        console.log(`Getting patients for nurse: ${userEmail} with ID: ${nurseId}`);
        
        if (!nurseId) {
            return res.status(401).json({ message: 'Unauthorized. User ID not found.' });
        }
        
        // First, check if any patients exist for this nurse
        const countResult = await pool.query(
            `SELECT COUNT(*) FROM patients WHERE nurse_id = $1`,
            [nurseId]
        );
        
        const patientCount = parseInt(countResult.rows[0].count, 10);
        console.log(`Found ${patientCount} patients assigned to nurse ID ${nurseId}`);
        
        // Query the database for ALL patients to see what's in the database
        const allPatientsResult = await pool.query(
            `SELECT p.id, p.name, p.nurse_id, p.doctor_id 
             FROM patients p 
             ORDER BY p.name`
        );
        
        console.log(`Total patients in database: ${allPatientsResult.rows.length}`);
        console.log('All nurse_id values in patients table:', allPatientsResult.rows.map(p => p.nurse_id));
        
        // Query the database for patients assigned to this nurse
        const result = await pool.query(
            `SELECT p.id, p.name, p.age, p.gender, p.medical_history,
                    p.nurse_id, p.doctor_id, p.created_at
            FROM patients p
            WHERE p.nurse_id = $1
            ORDER BY p.name`,
            [nurseId]
        );
        
        console.log(`Returning ${result.rows.length} patients to nurse ${userEmail}`);
        
        res.status(200).json(result.rows);
        
    } catch (error) {
        console.error('Error in getNursePatients:', error);
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

/**
 * Schema for validating patient update request
 */
const updatePatientSchema = z.object({
    name: z.string().min(1, { message: 'Patient name is required' }).optional(),
    age: z.number().int().positive({ message: 'Age must be a positive number' }).optional(),
    gender: z.string().min(1, { message: 'Gender is required' }).optional(),
    medical_history: z.string().optional(),
    nurse_id: z.number().int().positive({ message: 'Nurse ID must be a positive number' }).optional(),
    doctor_id: z.number().int().positive().optional().nullable()
});

/**
 * Update an existing patient
 */
export const updatePatient = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        // Get the user's ID from the authenticated user
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized. User ID not found.' });
        }

        // Check if the user is an admin (we might want to limit this to admins)
        // This would require checking the user's role, which we don't have access to here yet
        // For now, we'll just check if the patient exists and proceed

        const patientId = parseInt(req.params.id, 10);
        if (isNaN(patientId)) {
            return res.status(400).json({ message: 'Invalid patient ID.' });
        }

        // Validate the request body
        const patientData = updatePatientSchema.parse(req.body);
        
        // Update the patient in the database
        const updatedPatient = await patientModel.updatePatient(pool, patientId, patientData);
        
        if (!updatedPatient) {
            return res.status(404).json({ message: 'Patient not found or no fields to update.' });
        }
        
        res.status(200).json({
            message: 'Patient updated successfully',
            patient: updatedPatient
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
 * Delete a patient
 */
export const deletePatient = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        // Get the user's ID from the authenticated user
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized. User ID not found.' });
        }

        // For now, we don't verify if the user is an admin, but in a real app,
        // you would want to restrict deletion to admins only

        const patientId = parseInt(req.params.id, 10);
        if (isNaN(patientId)) {
            return res.status(400).json({ message: 'Invalid patient ID.' });
        }
        
        // Delete the patient
        const deleteResult = await patientModel.deletePatient(pool, patientId);
        
        if (!deleteResult) {
            return res.status(404).json({ message: 'Patient not found.' });
        }
        
        res.status(200).json({
            message: 'Patient deleted successfully'
        });
        
    } catch (error) {
        console.error('Error deleting patient:', error);
        next(error);
    }
};
