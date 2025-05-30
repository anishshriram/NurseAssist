import { Router } from 'express';
import { searchSymptoms } from '../controllers/symptomController';
import { protect } from '../middleware/authMiddleware'; 

const router = Router();

// rest api I need to run: GET /api/symptoms/search?phrase=headache&age=30&sex=female
// interview Id is required, generate a random uuid
router.get('/search', protect, searchSymptoms);

// Special demo route that doesn't require authentication for the demo dashboard
router.get('/search/demo', searchSymptoms);

// access evidence via /evidence later

export default router;
