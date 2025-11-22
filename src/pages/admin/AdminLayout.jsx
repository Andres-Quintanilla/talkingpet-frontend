import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  CalendarDays,
  ShoppingCart,
  BookOpenCheck,
  Users,
  Heart,
  LogOut,
} from 'lucide-react';

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2>TalkingPet Admin</h2>
        <nav>
          <NavLink to="dashboard">
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
          <NavLink to="pedidos">
            <ShoppingCart size={18} /> Pedidos
          </NavLink>
          <NavLink to="citas">
            <CalendarDays size={18} /> Citas
          </NavLink>
          <NavLink to="productos">
            <Package size={18} /> Productos
          </NavLink>
          <NavLink to="servicios">
            <Package size={18} /> Servicios
          </NavLink>
          <NavLink to="cursos">
            <BookOpenCheck size={18} /> Cursos
          </NavLink>
          <NavLink to="usuarios">
            <Users size={18} /> Usuarios
          </NavLink>
          <NavLink to="medical">
            <Heart size={18} /> Hist. Médicos
          </NavLink>
        </nav>
        <button className="logout-button" onClick={handleLogout}>
          <LogOut size={18} /> Cerrar Sesión
        </button>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}