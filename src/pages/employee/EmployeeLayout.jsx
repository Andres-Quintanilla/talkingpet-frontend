import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  CalendarDays,
  HeartPulse,
  PlayCircle,
  LogOut,
} from 'lucide-react';

export default function EmployeeLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="employee-layout admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__header">
          <h2>Panel Empleado</h2>
          <p className="admin-sidebar__subtitle">
            Hola, {user?.nombre || 'Empleado'}
          </p>
        </div>

        <nav className="admin-sidebar__nav">
          <NavLink
            to="dashboard"
            className={({ isActive }) =>
              isActive
                ? 'admin-sidebar__link admin-sidebar__link--active'
                : 'admin-sidebar__link'
            }
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="citas"
            className={({ isActive }) =>
              isActive
                ? 'admin-sidebar__link admin-sidebar__link--active'
                : 'admin-sidebar__link'
            }
          >
            <CalendarDays size={18} />
            <span>Mis Citas</span>
          </NavLink>

          <NavLink
            to="medical"
            className={({ isActive }) =>
              isActive
                ? 'admin-sidebar__link admin-sidebar__link--active'
                : 'admin-sidebar__link'
            }
          >
            <HeartPulse size={18} />
            <span>Historial Médico</span>
          </NavLink>

          <NavLink
            to="adiestramiento"
            className={({ isActive }) =>
              isActive
                ? 'admin-sidebar__link admin-sidebar__link--active'
                : 'admin-sidebar__link'
            }
          >
            <PlayCircle size={18} />
            <span>Adiestramiento</span>
          </NavLink>
        </nav>

        <button className="logout-button" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Cerrar sesión</span>
        </button>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
