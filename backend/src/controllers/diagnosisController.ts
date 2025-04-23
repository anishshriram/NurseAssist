import { Request, Response, NextFunction } from 'express';
import { infermedicaService } from '../services/infermedicaService';
import { z } from 'zod';
// Zod! https://zod.dev/?id=basic-usage

// /evidence
const evidenceSchema = z.object({
    id: z.string().min(1), // Infermedica symptom/risk factor ID (e.g., 's_123', 'risk_5')
    choice_id: z.enum(['present', 'absent', 'unknown']),
    source: z.string().optional(), // Optional source information
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
