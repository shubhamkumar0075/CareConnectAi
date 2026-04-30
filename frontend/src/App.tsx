import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';

function App() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  return (
    <Router>
      <div className="container">
        <Navbar />
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        </Routes>
        <Chatbot />
      </div>
    </Router>
  );
}

export default App;
