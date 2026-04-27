import express from 'express';
import { registerUser, loginUser, getDoctors } from '../controllers/authController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/doctors', protect, getDoctors);

export default router;
