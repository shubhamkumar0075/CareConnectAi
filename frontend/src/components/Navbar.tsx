import { Link, useNavigate } from 'react-router-dom';
import { Stethoscope, LogOut } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar glass-panel">
      <Link to="/" style={{ textDecoration: 'none' }} className="flex items-center gap-4">
        <Stethoscope size={32} color="#60a5fa" />
        <span className="nav-brand">CareConnect AI</span>
      </Link>
      
      {user && (
        <div className="flex items-center gap-4">
          <span style={{ fontWeight: 500 }}>{user.name} ({user.role})</span>
          <button onClick={handleLogout} className="btn glass-panel flex items-center" style={{ gap: '0.5rem', padding: '0.5rem 1rem' }}>
            <LogOut size={18} />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
