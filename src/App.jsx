// src/App.jsx
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';

// --- Páginas Públicas ---
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Services from './pages/Services';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import NotFound from './pages/NotFound';

// --- Páginas de Autenticación ---
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// --- Carrito / Pago ---
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';

// --- Cliente Autenticado ---
import { RequireAuth, RequireRole } from './components/RouteGuards';
import Booking from './pages/Booking';
import MyCourses from './pages/MyCourses';
import CourseViewer from './pages/CourseViewer';
import OrderTrack from './pages/OrderTrack';
import PetList from './pages/PetList';
import PetProfile from './pages/PetProfile';
import MyOrders from './pages/MyOrders';
import MyBookings from './pages/MyBookings';

// --- Admin ---
import AdminLayout from './pages/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminServices from './pages/admin/AdminServices';
import AdminCourses from './pages/admin/AdminCourses';
import AdminUsers from './pages/admin/AdminUsers';
import AdminBookings from './pages/admin/AdminBookings';
import AdminOrders from './pages/admin/AdminOrders';
import AdminMedical from './pages/admin/AdminMedical';

// --- Empleado ---
import EmployeeLayout from './pages/employee/EmployeeLayout';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import EmployeeBookings from './pages/employee/EmployeeBookings';
import EmployeeMedical from './pages/employee/EmployeeMedical';

// CRUD catálogo empleado
import EmployeeProducts from './pages/employee/EmployeeProducts';
import EmployeeServices from './pages/employee/EmployeeServices';
import EmployeeCourses from './pages/employee/EmployeeCourses';

// Adiestramiento empleado
import EmployeeTraining from './pages/employee/EmployeeTraining';

export default function App() {
  const location = useLocation();

  const hideChrome =
    [
      '/login',
      '/registro',
      '/forgot',
      '/reset',
      '/pago/exitoso',
      '/pago/cancelado',
    ].includes(location.pathname) ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/empleado') ||
    location.pathname.startsWith('/mis-cursos/ver');

  return (
    <div className="app-shell">
      {!hideChrome && <Header />}

      <main className="main" id="main">
        <Routes>
          {/* ======================= */}
          {/* === Rutas Públicas === */}
          {/* ======================= */}
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Products />} />
          <Route path="/productos/:id" element={<ProductDetail />} />
          <Route path="/servicios" element={<Services />} />
          <Route path="/cursos" element={<Courses />} />
          <Route path="/cursos/:id" element={<CourseDetail />} />

          {/* ======================= */}
          {/* === Autenticación === */}
          {/* ======================= */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/reset" element={<ResetPassword />} />

          {/* ======================= */}
          {/* === Carrito y Pago === */}
          {/* ======================= */}
          <Route path="/carrito" element={<Cart />} />
          <Route path="/pago/exitoso" element={<PaymentSuccess />} />
          <Route path="/pago/cancelado" element={<PaymentCancel />} />
          <Route
            path="/checkout"
            element={
              <RequireAuth>
                <Checkout />
              </RequireAuth>
            }
          />

          {/* ======================= */}
          {/* === Cliente Auth === */}
          {/* ======================= */}
          <Route
            path="/agendar"
            element={
              <RequireAuth>
                <Booking />
              </RequireAuth>
            }
          />
          <Route
            path="/mis-cursos"
            element={
              <RequireAuth>
                <MyCourses />
              </RequireAuth>
            }
          />
          <Route
            path="/mis-cursos/:id/ver"
            element={
              <RequireAuth>
                <CourseViewer />
              </RequireAuth>
            }
          />
          <Route
            path="/mis-pedidos"
            element={
              <RequireAuth>
                <MyOrders />
              </RequireAuth>
            }
          />
          <Route
            path="/pedidos/:id/track"
            element={
              <RequireAuth>
                <OrderTrack />
              </RequireAuth>
            }
          />
          <Route
            path="/mis-servicios"
            element={
              <RequireAuth>
                <MyBookings />
              </RequireAuth>
            }
          />
          <Route
            path="/mis-mascotas"
            element={
              <RequireAuth>
                <PetList />
              </RequireAuth>
            }
          />
          <Route
            path="/mis-mascotas/:id"
            element={
              <RequireAuth>
                <PetProfile />
              </RequireAuth>
            }
          />

          {/* ======================= */}
          {/* ===== ADMIN AREA ===== */}
          {/* ======================= */}
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route
            path="/admin"
            element={
              <RequireRole roles={['admin']}>
                <AdminLayout />
              </RequireRole>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="pedidos" element={<AdminOrders />} />
            <Route path="citas" element={<AdminBookings />} />
            <Route path="productos" element={<AdminProducts />} />
            <Route path="servicios" element={<AdminServices />} />
            <Route path="cursos" element={<AdminCourses />} />
            <Route path="usuarios" element={<AdminUsers />} />
            <Route path="medical" element={<AdminMedical />} />
          </Route>

          {/* ======================= */}
          {/* ==== EMPLEADO AREA ==== */}
          {/* ======================= */}
          <Route
            path="/empleado"
            element={
              <RequireRole
                roles={[
                  'empleado',
                  'admin',
                  'empleado_peluquero',
                  'empleado_veterinario',
                  'empleado_adiestrador',
                ]}
              >
                <EmployeeLayout />
              </RequireRole>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />

            <Route path="dashboard" element={<EmployeeDashboard />} />
            <Route path="citas" element={<EmployeeBookings />} />
            <Route path="medical" element={<EmployeeMedical />} />

            {/* Catálogo (empleado) */}
            <Route path="productos" element={<EmployeeProducts />} />
            <Route path="servicios" element={<EmployeeServices />} />
            <Route path="cursos" element={<EmployeeCourses />} />

            {/* Adiestramiento */}
            <Route path="adiestramiento" element={<EmployeeTraining />} />
          </Route>

          {/* ======================= */}
          {/* ======== 404 ========= */}
          {/* ======================= */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </main>

      {!hideChrome && <Footer />}
    </div>
  );
}
