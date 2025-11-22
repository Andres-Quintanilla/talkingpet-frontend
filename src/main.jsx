import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'leaflet/dist/leaflet.css';

// CSS Globales
import './styles/theme.css';
import './styles/global.css';
import './styles/utilities.css';

// CSS de Componentes
import './styles/header.css';
import './styles/footer.css';
import './styles/chatbot.css';
import './styles/auth.css';
import './styles/admin.css';
import './styles/admin-medical.css';

// CSS de Páginas
import './styles/home.css';
import './styles/products.css';
import './styles/product-detail.css';
import './styles/services.css';
import './styles/courses.css';
import './styles/cart.css'; 
import './styles/checkout.css'; 
import './styles/pet-profile.css';

// --- Contextos ---
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);