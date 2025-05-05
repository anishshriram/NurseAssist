import express from 'express';
import { getAllDoctors, getAllNurses } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Protect all routes
router.use(protect);

// Get all doctors (for dropdown selects in admin panels)
router.get('/doctors', getAllDoctors);

// Get all nurses (for dropdown selects in admin panels)
router.get('/nurses', getAllNurses);

export default router;
