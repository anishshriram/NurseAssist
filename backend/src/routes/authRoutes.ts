import { Router } from 'express';
import { register, login } from '../controllers/authController'; // Import register and login

const router = Router();

// POST /api/auth/register
// Body: { name, email, password, role: ('Nurse' | 'Doctor') }
router.post('/register', register);

// POST /api/auth/login
// Body: { email, password }
router.post('/login', login); // Add login route (implementation is pending)

export default router;
