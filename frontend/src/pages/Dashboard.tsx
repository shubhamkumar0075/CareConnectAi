import React, { useEffect, useState } from 'react';
import api from '../api';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';

const Dashboard = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [notes, setNotes] = useState('');
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [apptsRes, docsRes] = await Promise.all([
        api.get('/api/appointments'),
        user.role === 'patient' ? api.get('/api/auth/doctors') : Promise.resolve({ data: [] })
      ]);
      setAppointments(apptsRes.data);
      setDoctors(docsRes.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/appointments', {
        doctorId: selectedDoctor,
        date: appointmentDate,
        notes
      });
      alert('Appointment booked successfully!');
      setSelectedDoctor('');
      setAppointmentDate('');
      setNotes('');
      fetchData();
    } catch (error) {
      console.error('Failed to book', error);
      alert('Failed to book appointment');
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await api.put(`/api/appointments/${id}/status`, { status });
      fetchData();
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading...</div>;

  return (
    <div>
      <h2 className="text-gradient mb-4">Dashboard Overview</h2>
      
      {user.role === 'patient' && (
        <div className="card glass-panel mb-4" style={{ padding: '2rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={24} /> Book New Appointment
          </h3>
          <form onSubmit={handleBookAppointment} className="grid" style={{ marginTop: '1.5rem', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Select Doctor</label>
              <select 
                className="input-field" 
                value={selectedDoctor} 
                onChange={(e) => setSelectedDoctor(e.target.value)}
                required
                style={{ marginBottom: 0 }}
              >
                <option value="">-- Choose a doctor --</option>
                {doctors.map(doc => (
                  <option key={doc._id} value={doc._id}>{doc.name} - {doc.specialization}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Date & Time</label>
              <input 
                type="datetime-local" 
                className="input-field" 
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                required
                style={{ marginBottom: 0 }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ height: '50px' }}>Book Now</button>
          </form>
        </div>
      )}

      <h3>Your Appointments</h3>
      <div className="grid mt-4">
        {appointments.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No appointments found.</p>
        ) : (
          appointments.map(appt => (
            <div key={appt._id} className="card glass-panel">
              <div className="flex justify-between items-center mb-4">
                <span className={`badge badge-${appt.status}`}>
                  {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {new Date(appt.date).toLocaleString()}
                </span>
              </div>
              
              <div className="mb-4">
                {user.role === 'patient' ? (
                  <>
                    <h4 style={{ margin: 0 }}>Dr. {appt.doctorId?.name}</h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{appt.doctorId?.specialization}</p>
                  </>
                ) : (
                  <>
                    <h4 style={{ margin: 0 }}>Patient: {appt.patientId?.name}</h4>
                    {appt.notes && <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Notes: {appt.notes}</p>}
                  </>
                )}
              </div>

              {(user.role === 'doctor' || user.role === 'admin') && appt.status === 'scheduled' && (
                <div className="flex gap-4" style={{ marginTop: '1rem' }}>
                  <button onClick={() => handleStatusUpdate(appt._id, 'completed')} className="btn flex items-center justify-center gap-4" style={{ flex: 1, backgroundColor: 'rgba(34, 197, 94, 0.2)', color: '#4ade80' }}>
                    <CheckCircle size={16} /> Complete
                  </button>
                  <button onClick={() => handleStatusUpdate(appt._id, 'cancelled')} className="btn flex items-center justify-center gap-4" style={{ flex: 1, backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}>
                    <XCircle size={16} /> Cancel
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
