// /home/adilh/classes/NurseAssist/backend/src/routes/symptomRoutes.ts
import { Router } from 'express';
import { searchSymptoms } from '../controllers/symptomController';

const router = Router();

// GET /api/symptoms/search?phrase=headache&age=30&sex=female
// Requires X-Interview-ID header
router.get('/search', searchSymptoms);

// Add other symptom/evidence related routes here later (e.g., POST /evidence)

export default router;
