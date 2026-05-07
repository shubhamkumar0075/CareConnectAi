import { Response } from 'express';
import { Appointment } from '../models/Appointment';
import { AuthRequest } from '../middlewares/authMiddleware';

// Helper function to generate available slots
const getAvailableSlots = async (doctorId: string, requestedDate: Date, bookedSlots: any[]) => {
  const dayStart = new Date(requestedDate);
  dayStart.setHours(9, 0, 0, 0); // Doctor available from 9 AM

  const dayEnd = new Date(requestedDate);
  dayEnd.setHours(17, 0, 0, 0); // Doctor available until 5 PM

  const slots: Date[] = [];
  const slotDuration = 30; // 30-minute slots

  // Extract booked times for this day
  const bookedTimes = bookedSlots
    .filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate.toDateString() === requestedDate.toDateString();
    })
    .map(apt => new Date(apt.date).getTime());

  // Generate all possible slots
  for (let time = dayStart.getTime(); time < dayEnd.getTime(); time += slotDuration * 60 * 1000) {
    const slotTime = new Date(time);
    
    // Check if slot is not booked
    const isBooked = bookedTimes.some(bookedTime => {
      const diff = Math.abs(bookedTime - slotTime.getTime());
      return diff < slotDuration * 60 * 1000;
    });

    if (!isBooked) {
      slots.push(slotTime);
    }
  }

  return slots;
};

export const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { doctorId, date, notes } = req.body;
    const patientId = req.user.id;
    const requestedDate = new Date(date);

    // Check if doctor is already booked at this time (within 30 min window)
    const conflictingAppointments = await Appointment.find({
      doctorId,
      status: { $ne: 'cancelled' },
      date: {
        $gte: new Date(requestedDate.getTime() - 30 * 60 * 1000),
        $lt: new Date(requestedDate.getTime() + 30 * 60 * 1000),
      },
    });

    if (conflictingAppointments.length > 0) {
      // Doctor is busy, get available slots
      const allAppointments = await Appointment.find({
        doctorId,
        status: { $ne: 'cancelled' },
        date: {
          $gte: new Date(requestedDate.getTime() - 24 * 60 * 60 * 1000),
          $lt: new Date(requestedDate.getTime() + 24 * 60 * 60 * 1000),
        },
      });

      const availableSlots = await getAvailableSlots(doctorId, requestedDate, allAppointments);

      return res.status(409).json({
        message: 'Doctor is not available at the selected time',
        doctorBusy: true,
        requestedTime: requestedDate,
        availableSlots: availableSlots.slice(0, 6), // Return first 6 available slots
      });
    }

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      date: requestedDate,
      notes,
    });

    res.status(201).json({ 
      message: 'Appointment booked successfully',
      appointment,
      doctorBusy: false 
    });
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
