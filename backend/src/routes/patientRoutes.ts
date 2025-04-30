import express from 'express';
import { getNursePatients, getPatientById, getAllPatients, createPatient } from '../controllers/patientController';
import { protect } from '../middleware/authMiddleware';

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

export default router;
