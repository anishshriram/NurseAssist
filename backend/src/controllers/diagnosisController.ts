import { Request, Response, NextFunction } from 'express';
import { infermedicaService } from '../services/infermedicaService';
import { z } from 'zod';
import pool from '../utils/db';
import * as diagnosisModel from '../models/diagnosisModel';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
// Zod! https://zod.dev/?id=basic-usage

// /evidence
const evidenceSchema = z.object({
    id: z.string().min(1), // symptom/risk factor ID 
    choice_id: z.enum(['present', 'absent', 'unknown']),
    source: z.string().optional(), 
});

// /diagnosis
const diagnosisRequestSchema = z.object({
    sex: z.enum(['male', 'female']),
    age: z.object({
        value: z.number().int().gte(0), // age?
        unit: z.enum(['year', 'month']).optional().default('year'),
    }),
    evidence: z.array(evidenceSchema).min(1, { message: 'At least one evidence item is required' }),
    extras: z.object({
        disable_groups: z.boolean().optional(),
        enable_explanations: z.boolean().optional(),
    }).optional(),
});

export const performDiagnosis = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // validate
        const diagnosisData = diagnosisRequestSchema.parse(req.body);

        // get interview id from header
        const interviewId = req.headers['x-interview-id'] as string;
        if (!interviewId) {
            return res.status(400).json({ message: 'Missing X-Interview-ID header' });
        }

        console.log(`Performing diagnosis for interview: ${interviewId}, age: ${diagnosisData.age.value}, sex: ${diagnosisData.sex}, evidence count: ${diagnosisData.evidence.length}`);

        const results = await infermedicaService.getDiagnosis(diagnosisData, interviewId);

        res.status(200).json(results);

    } catch (error) {
        if (error instanceof z.ZodError) {
            // error
            return res.status(400).json({ message: 'Validation failed', errors: error.errors });
        }
        console.error(`Error in performDiagnosis controller for interview ${req.headers['x-interview-id']}:`, error);
        next(error);
    }
};

// Schema for validating the diagnosis submission from the nurse
const saveDiagnosisSchema = z.object({
    patient_id: z.number().int().positive(),
    condition_id: z.string().min(1),
    condition_name: z.string().min(1),
    confidence_score: z.number().min(0).max(100),
    critical_flag: z.boolean().optional().default(false),
    symptoms: z.array(z.object({
        infermedica_id: z.string().min(1),
        name: z.string().min(1),
        severity: z.enum(['mild', 'moderate', 'severe']),
        duration: z.string().optional()
    }))
});

/**
 * Save a diagnosis from Infermedica results
 * This is called when a nurse confirms a diagnosis after the symptom interview
 */
export const saveDiagnosis = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        // Validate the request body
        const diagnosisData = saveDiagnosisSchema.parse(req.body);
        
        // Check if confidence score meets threshold (e.g., 5%)
        const CONFIDENCE_THRESHOLD = 5.0;
        if (diagnosisData.confidence_score < CONFIDENCE_THRESHOLD) {
            return res.status(400).json({ 
                message: `Diagnosis confidence score (${diagnosisData.confidence_score}%) is below the threshold of ${CONFIDENCE_THRESHOLD}%` 
            });
        }
        
        // Get the nurse's ID from the authenticated user
        const nurseId = req.user?.userId;
        if (!nurseId) {
            return res.status(401).json({ message: 'Unauthorized. User ID not found.' });
        }
        
        // Save the diagnosis
        const diagnosis_id = await diagnosisModel.saveDiagnosis(
            pool,
            { 
                ...diagnosisData,
                nurse_id: nurseId,
                doctor_confirmation: false
            },
            diagnosisData.symptoms
        );
        
        res.status(201).json({ 
            message: 'Diagnosis saved successfully', 
            diagnosis_id 
        });
        
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Validation failed', errors: error.errors });
        }
        next(error);
    }
};

/**
 * Get all diagnoses for a specific patient
 */
export const getPatientDiagnoses = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const patient_id = parseInt(req.params.id, 10);
        
        if (isNaN(patient_id)) {
            return res.status(400).json({ message: 'Invalid patient ID' });
        }
        
        const diagnoses = await diagnosisModel.getDiagnosesByPatientId(pool, patient_id);
        
        res.status(200).json(diagnoses);
        
    } catch (error) {
        next(error);
    }
};

/**
 * Get all diagnoses for patients assigned to a doctor
 */
export const getDoctorDiagnoses = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        // Get the doctor's ID from the authenticated user
        const doctorId = req.user?.userId;
        if (!doctorId) {
            return res.status(401).json({ message: 'Unauthorized. User ID not found.' });
        }
        
        const diagnoses = await diagnosisModel.getDiagnosesForDoctor(pool, doctorId);
        
        res.status(200).json(diagnoses);
        
    } catch (error) {
        next(error);
    }
};

/**
 * Confirm or reject a diagnosis (doctor function)
 */
export const confirmDiagnosis = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const diagnosis_id = parseInt(req.params.id, 10);
        const { confirmed } = req.body;
        
        if (isNaN(diagnosis_id)) {
            return res.status(400).json({ message: 'Invalid diagnosis ID' });
        }
        
        if (typeof confirmed !== 'boolean') {
            return res.status(400).json({ message: 'Confirmed status must be a boolean' });
        }
        
        // TODO: Check if the user is a doctor
        // const isDoctor = req.user?.role === 'Doctor';
        // if (!isDoctor) {
        //   return res.status(403).json({ message: 'Only doctors can confirm diagnoses' });
        // }
        
        const success = await diagnosisModel.confirmDiagnosis(pool, diagnosis_id, confirmed);
        
        if (!success) {
            return res.status(404).json({ message: 'Diagnosis not found' });
        }
        
        res.status(200).json({ 
            message: confirmed ? 'Diagnosis confirmed' : 'Diagnosis rejected', 
            diagnosis_id 
        });
        
    } catch (error) {
        next(error);
    }
};
