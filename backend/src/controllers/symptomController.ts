import { Request, Response, NextFunction } from 'express';
import { infermedicaService } from '../services/infermedicaService';
import { z } from 'zod'; 

// https://zod.dev/?id=basic-usage

// query parameters
const searchSchema = z.object({
    phrase: z.string().min(1, { message: 'Search phrase cannot be empty' }),
    age: z.coerce.number().int().gte(18, { message: 'Age must be 18 or greater' }).lte(130, { message: 'Age seems unrealistic' }),
    sex: z.enum(['male', 'female'], { errorMap: () => ({ message: "Sex must be 'male' or 'female'" }) }),
    // interviewId: z.string().uuid({ message: 'Valid Interview ID header (X-Interview-ID) is required' })
});

export const searchSymptoms = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const queryData = searchSchema.parse(req.query);

        const interviewId = req.headers['x-interview-id'] as string;
        if (!interviewId) {
            return res.status(400).json({ message: 'Missing X-Interview-ID header' });
        }

        console.log(`Searching symptoms for phrase: "${queryData.phrase}", age: ${queryData.age}, sex: ${queryData.sex}, interview: ${interviewId}`);

        const results = await infermedicaService.searchSymptoms(
            queryData.phrase,
            queryData.age,
            queryData.sex,
            interviewId
        );

        res.status(200).json(results);

    } catch (error) {
         if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Validation failed', errors: error.errors });
        }
        console.error('Error in searchSymptoms controller:', error);
        next(error);
    }
};
