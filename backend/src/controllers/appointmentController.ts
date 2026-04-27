import { Response } from 'express';
import { Appointment } from '../models/Appointment';
import { AuthRequest } from '../middlewares/authMiddleware';

export const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { doctorId, date, notes } = req.body;
    const patientId = req.user.id;

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      date,
      notes,
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let appointments;
    if (role === 'patient') {
      appointments = await Appointment.find({ patientId: userId }).populate('doctorId', 'name specialization');
    } else if (role === 'doctor') {
      appointments = await Appointment.find({ doctorId: userId }).populate('patientId', 'name');
    } else if (role === 'admin') {
      appointments = await Appointment.find().populate('patientId', 'name').populate('doctorId', 'name specialization');
    }

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateAppointmentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Basic AI-driven scheduling logic / validation could go here
    // e.g., checking if the slot is still available or double booked

    appointment.status = status;
    const updatedAppointment = await appointment.save();

    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
