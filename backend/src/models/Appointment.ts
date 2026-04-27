import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  date: Date;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

const appointmentSchema = new Schema<IAppointment>({
  patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
  notes: { type: String }
}, { timestamps: true });

export const Appointment = mongoose.model<IAppointment>('Appointment', appointmentSchema);
