import express from 'express';
import { createAppointment, getAppointments, updateAppointmentStatus } from '../controllers/appointmentController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/', protect, authorize('patient'), createAppointment);
router.get('/', protect, getAppointments);
router.put('/:id/status', protect, authorize('doctor', 'admin'), updateAppointmentStatus);

export default router;
