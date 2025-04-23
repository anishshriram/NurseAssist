import { Router } from 'express';
import { performDiagnosis } from '../controllers/diagnosisController';

const router = Router();

// rest api needed: POST /api/diagnosis
// Body: { sex, age: { value, unit? }, evidence: [{ id, choice_id, source? }], extras? } as per https://developer.infermedica.com/documentation/engine-api/build-your-solution/diagnosis/
// uuid gen
router.post('/', performDiagnosis);

// need to add diagnosis later

export default router;
