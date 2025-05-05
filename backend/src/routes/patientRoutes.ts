import express, { Request, Response } from 'express';
import { getNursePatients, getPatientById, getAllPatients, createPatient, updatePatient, deletePatient } from '../controllers/patientController';
import { protect, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = express.Router();

// Protect all routes with authentication
router.use(protect);

// Create a new patient (only nurses can create patients)
router.post('/', createPatient);

// Get all patients assigned to the logged-in nurse
router.get('/', getNursePatients);

// For testing, get all patients regardless of assignment
router.get('/all', getAllPatients);

// Get a specific patient by ID (only if assigned to the logged-in nurse)
router.get('/:id', getPatientById);

// Update a patient by ID
router.patch('/:id', updatePatient);

// Delete a patient by ID
router.delete('/:id', deletePatient);

// Debug endpoint to check patient creation data
router.post('/test-create', (req: AuthenticatedRequest, res: Response) => {
    console.log('Test-create endpoint received data:', req.body);
    console.log('Data types:', {
        name: typeof req.body?.name,
        age: typeof req.body?.age,
        gender: typeof req.body?.gender,
        medical_history: typeof req.body?.medical_history,
        doctor_id: typeof req.body?.doctor_id,
        nurse_id: typeof req.body?.nurse_id
    });
    res.status(200).json({
        message: 'Data received successfully',
        receivedData: req.body
    });
});

export default router;
