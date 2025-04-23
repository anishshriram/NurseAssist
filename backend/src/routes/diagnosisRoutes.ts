import { Router } from 'express';
import { performDiagnosis } from '../controllers/diagnosisController';
import { protect } from '../middleware/authMiddleware'; 

const router = Router();

// POST /api/diagnosis
// Body: { sex, age: { value, unit? }, evidence: [{ id, choice_id, source? }], extras? }
// X-Interview-ID header
// protect BEFORE the controller 
router.post('/', protect, performDiagnosis);

// other diagnosis-related routes here later
// router.post('/explain', protect, explainDiagnosis); 

export default router;
