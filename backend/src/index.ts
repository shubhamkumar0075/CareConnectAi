import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import appointmentRoutes from './routes/appointmentRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);

app.get('/', (req, res) => {
  res.send('Hospital API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
