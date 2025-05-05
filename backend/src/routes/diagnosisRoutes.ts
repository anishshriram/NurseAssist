import { Router } from 'express';
import { 
  performDiagnosis, 
  saveDiagnosis, 
  getPatientDiagnoses, 
  getDoctorDiagnoses, 
  confirmDiagnosis 
} from '../controllers/diagnosisController';
import { protect } from '../middleware/authMiddleware'; 

const router = Router();

// POST /api/diagnosis - Get diagnosis from Infermedica API
// Body: { sex, age: { value, unit? }, evidence: [{ id, choice_id, source? }], extras? }
// X-Interview-ID header
router.post('/', protect, performDiagnosis);

// Special demo route that doesn't require authentication for the demo dashboard
// Same parameters as the protected route
router.post('/demo', performDiagnosis);

// POST /api/diagnosis/save - Save diagnosis to database
// Body: { patient_id, condition_id, condition_name, confidence_score, symptoms: [...] }
router.post('/save', protect, saveDiagnosis);

// GET /api/diagnosis/patient/:id - Get all diagnoses for a specific patient
router.get('/patient/:id', protect, getPatientDiagnoses);

// GET /api/diagnosis/doctor - Get all diagnoses for the doctor's patients
router.get('/doctor', protect, getDoctorDiagnoses);

// PATCH /api/diagnosis/:id/confirm - Confirm or reject a diagnosis (doctor function)
// Body: { confirmed: boolean }
router.patch('/:id/confirm', protect, confirmDiagnosis);

// other diagnosis-related routes can be added here

export default router;
