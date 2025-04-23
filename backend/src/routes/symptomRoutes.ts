import { Router } from 'express';
import { searchSymptoms } from '../controllers/symptomController';

const router = Router();

// rest api I need to run: GET /api/symptoms/search?phrase=headache&age=30&sex=female
// interview Id is required, generate a random uuid
router.get('/search', searchSymptoms);

// access evidence via /evidence later

export default router;
