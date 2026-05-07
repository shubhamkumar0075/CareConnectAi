import React, { useEffect, useState } from 'react';
import api from '../api';
import { Calendar, CheckCircle, XCircle, X, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [notes, setNotes] = useState('');
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<Date[]>([]);
  const [selectedDoctorName, setSelectedDoctorName] = useState('');
  
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
      const response = await api.post('/api/appointments', {
        doctorId: selectedDoctor,
        date: appointmentDate,
        notes
      });
      
      if (response.data.doctorBusy === false) {
        alert('Appointment booked successfully!');
        setSelectedDoctor('');
        setAppointmentDate('');
        setNotes('');
        fetchData();
      }
    } catch (error: any) {
      if (error.response?.status === 409 && error.response?.data?.doctorBusy) {
        // Doctor is busy, show available slots
        const slots = error.response.data.availableSlots.map((slot: string) => new Date(slot));
        setAvailableSlots(slots);
        const doctorName = doctors.find(d => d._id === selectedDoctor)?.name;
        setSelectedDoctorName(doctorName || 'Doctor');
        setShowAvailabilityModal(true);
      } else {
        console.error('Failed to book', error);
        alert('Failed to book appointment');
      }
    }
  };

  const handleSelectAvailableSlot = async (slot: Date) => {
    try {
      const response = await api.post('/api/appointments', {
        doctorId: selectedDoctor,
        date: slot.toISOString(),
        notes
      });
      
      if (response.data.doctorBusy === false) {
        alert('Appointment booked successfully at ' + new Date(slot).toLocaleString());
        setShowAvailabilityModal(false);
        setSelectedDoctor('');
        setAppointmentDate('');
        setNotes('');
        fetchData();
      }
    } catch (error) {
      console.error('Failed to book', error);
      alert('Failed to book appointment at this time');
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
      {/* Doctor Availability Modal */}
      {showAvailabilityModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '8px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            {/* Close Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171' }}>
                <AlertCircle size={24} /> Doctor Not Available
              </h3>
              <button
                onClick={() => setShowAvailabilityModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  color: 'var(--text-secondary)'
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Message */}
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
              Dr. {selectedDoctorName} is not available at your requested time. Please select one of the available time slots:
            </p>

            {/* Available Slots */}
            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1.5rem' }}>
              {availableSlots.length > 0 ? (
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {availableSlots.map((slot, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectAvailableSlot(slot)}
                      style={{
                        padding: '1rem',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        color: '#3b82f6',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                        fontWeight: 500
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
                        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                      }}
                    >
                      <Calendar size={16} style={{ display: 'inline-block', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                      {new Date(slot).toLocaleString()}
                    </button>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
                  No available slots for this doctor today. Please try another date.
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button
                onClick={() => setShowAvailabilityModal(false)}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--text-secondary)',
                  borderRadius: '6px',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowAvailabilityModal(false);
                  setSelectedDoctor('');
                  setAppointmentDate('');
                }}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  border: '1px solid rgba(59, 130, 246, 0.5)',
                  borderRadius: '6px',
                  color: '#3b82f6',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
                }}
              >
                Try Another Date
              </button>
            </div>
          </div>
        </div>
      )}

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
