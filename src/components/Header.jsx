import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useEffect, useState } from 'react';
import {
  ShoppingCart,
  Wallet,
  Sun,
  Moon,
  User,
  LogOut,
  BookOpenCheck,
  Heart,
  Package,
  CalendarDays,
  Menu,
  X,
  LayoutDashboard,
} from 'lucide-react';
import ChatbotWidget from './ChatbotWidget';
import api from '../api/axios';
import { formatCurrency } from '../utils/format'; 

export default function Header() {
  const { user, logout } = useAuth();
  const { totals } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const getInitialTheme = () => {
    const saved = localStorage.getItem('tp-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    if (user?.tema && user.tema !== 'system') return user.tema;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  };

  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    setTheme(getInitialTheme());
  }, [user]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tp-theme', theme);
  }, [theme]);

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    if (user) {
      try {
        await api.patch('/api/users/theme', { tema: newTheme });
      } catch (error) {
        console.error('Error saving theme:', error);
      }
    }
  };

  const handleLogout = () => {
    setUserMenuOpen(false);
    setMenuOpen(false);
    logout();
    navigate('/');
  };

  const closeAllMenus = () => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  };

  const isAdmin = user?.rol === 'admin';
  const isEmployee = user?.rol.startsWith('empleado');

  return (
    <header className="header" role="banner">
      <nav className="nav container" aria-label="Navegación principal">
        <div className="nav__brand">
          <Link
            to="/"
            className="nav__brand-link"
            onClick={closeAllMenus}
            aria-label="Ir al inicio"
          >
            <strong>Talking<span>Pet</span></strong>
          </Link>
        </div>

        <ul className="nav__menu nav__menu--primary">
            <li className="nav__item">
            <NavLink to="/" className="nav__link">
              Inicio
            </NavLink>
          </li>
          <li className="nav__item">
            <NavLink to="/productos" className="nav__link">
              Productos
            </NavLink>
          </li>
          <li className="nav__item">
            <NavLink to="/servicios" className="nav__link">
              Servicios
            </NavLink>
          </li>
          <li className="nav__item">
            <NavLink to="/cursos" className="nav__link">
              Cursos
            </NavLink>
          </li>
        </ul>

        <ul className="nav__menu nav__menu--utilities">
          {/* Carrito */}
          <li className="nav__item">
            <NavLink
              to="/carrito"
              className="nav__link nav__link--icon"
              aria-label="Ir al carrito"
            >
              <ShoppingCart className="icon" aria-hidden="true" />
              {totals.count > 0 && (
                <span className="badge badge--primary">{totals.count}</span>
              )}
            </NavLink>
          </li>

          <li className="nav__item">
            <button
              type="button"
              className="nav__link nav__link--icon theme-toggle"
              onClick={toggleTheme}
              aria-label={`Cambiar a tema ${
                theme === 'dark' ? 'claro' : 'oscuro'
              }`}
              title={`Tema: ${theme === 'dark' ? 'Oscuro' : 'Claro'}`}
            >
              {theme === 'dark' ? (
                <Moon className="icon" aria-hidden="true" />
              ) : (
                <Sun className="icon" aria-hidden="true" />
              )}
            </button>
          </li>

          {!user ? (
            <li className="nav__item nav__auth--desktop">
              <NavLink to="/login" className="btn btn--outline-primary btn--sm">
                Ingresar
              </NavLink>
              <NavLink to="/registro" className="btn btn--primary btn--sm">
                Crear cuenta
              </NavLink>
            </li>
          ) : (
            <li className="nav__item nav__user nav__user--desktop">
              <button
                className="nav__link nav__link--icon"
                onClick={() => setUserMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
              >
                <User className="icon" aria-hidden="true" />
                {user.nombre}
              </button>

              {userMenuOpen && (
                <div
                  className="dropdown"
                  role="menu"
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <div className="dropdown__item" aria-disabled="true">
                    <Wallet className="icon" aria-hidden="true" />
                    Saldo: {formatCurrency(Number(user.saldo ?? 0))}
                  </div>

                  {(isAdmin || isEmployee) && (
                    <NavLink
                      to={isAdmin ? '/admin' : '/empleado'}
                      className="dropdown__item"
                      onClick={closeAllMenus}
                    >
                      <LayoutDashboard className="icon" aria-hidden="true" />
                      Panel de Control
                    </NavLink>
                  )}

                  <NavLink
                    to="/mis-mascotas"
                    className="dropdown__item"
                    onClick={closeAllMenus}
                  >
                    <Heart className="icon" aria-hidden="true" />
                    Mis Mascotas
                  </NavLink>
                  <NavLink
                    to="/mis-pedidos"
                    className="dropdown__item"
                    onClick={closeAllMenus}
                  >
                    <Package className="icon" aria-hidden="true" />
                    Mis Pedidos
                  </NavLink>
                  <NavLink
                    to="/mis-servicios"
                    className="dropdown__item"
                    onClick={closeAllMenus}
                  >
                    <CalendarDays className="icon" aria-hidden="true" />
                    Mis Citas
                  </NavLink>
                  <NavLink
                    to="/mis-cursos"
                    className="dropdown__item"
                    onClick={closeAllMenus}
                  >
                    <BookOpenCheck className="icon" aria-hidden="true" />
                    Mis Cursos
                  </NavLink>

                  <button className="dropdown__item" onClick={handleLogout}>
                    <LogOut className="icon" aria-hidden="true" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </li>
          )}
          
           <li className="nav__item nav__item--mobile">
             <button 
                className="nav__link nav__link--icon" 
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Abrir menú"
                aria-expanded={menuOpen}
             >
                {menuOpen ? <X/> : <Menu/>}
             </button>
           </li>

        </ul>
      </nav>
      
      {menuOpen && (
          <div className="mobile-menu">
            <nav>
                <NavLink
                  to="/productos"
                  className="mobile-menu__link"
                  onClick={closeAllMenus}
                >
                  Productos
                </NavLink>
                <NavLink
                  to="/servicios"
                  className="mobile-menu__link"
                  onClick={closeAllMenus}
                >
                  Servicios
                </NavLink>
                <NavLink
                  to="/cursos"
                  className="mobile-menu__link"
                  onClick={closeAllMenus}
                >
                  Cursos
                </NavLink>
            </nav>
            <div className="mobile-menu__auth">
              {!user ? (
                <>
                  <NavLink
                    to="/login"
                    className="btn btn--primary btn--full"
                    onClick={closeAllMenus}
                  >
                    Ingresar
                  </NavLink>
                  <NavLink
                    to="/registro"
                    className="btn btn--outline-primary btn--full"
                    onClick={closeAllMenus}
                  >
                    Crear cuenta
                  </NavLink>
                </>
              ) : (
                 <>
                   <h3 className="mobile-menu__title">Hola, {user.nombre}</h3>
                    {(isAdmin || isEmployee) && (
                      <NavLink
                        to={isAdmin ? '/admin' : '/empleado'}
                        className="mobile-menu__link"
                        onClick={closeAllMenus}
                      >
                        <LayoutDashboard size={18} /> Panel de Control
                      </NavLink>
                    )}
                   <NavLink to="/mis-mascotas" className="mobile-menu__link" onClick={closeAllMenus}><Heart size={18} /> Mis Mascotas</NavLink>
                   <NavLink to="/mis-pedidos" className="mobile-menu__link" onClick={closeAllMenus}><Package size={18} /> Mis Pedidos</NavLink>
                   <NavLink to="/mis-servicios" className="mobile-menu__link" onClick={closeAllMenus}><CalendarDays size={18} /> Mis Citas</NavLink>
                   <NavLink to="/mis-cursos" className="mobile-menu__link" onClick={closeAllMenus}><BookOpenCheck size={18} /> Mis Cursos</NavLink>
                   <button className="mobile-menu__link" onClick={handleLogout}>
                     <LogOut size={18} /> Cerrar sesión
                   </button>
                 </>
              )}
            </div>
          </div>
      )}

      <ChatbotWidget />
    </header>
  );
}