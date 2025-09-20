import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, Container, Nav, Button, Spinner, Alert, Card, Row, Col } from 'react-bootstrap';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './App.css';
import './custom-styles.css';
import Login from './components/Login';
import Register from './components/Register';
import VehicleRegistration from './components/VehicleRegistration';
import UserManagement from './components/UserManagement';
import UserProfile from './components/UserProfile';
import API_BASE_URL from './apiConfig'; // Importamos la URL base

function App() {
  const [notices, setNotices] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // --- FUNCIÓN PARA OBTENER DATOS DEL USUARIO ---
  const fetchUserData = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}users/me/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const userData = await response.json();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (err) {
      console.error("Error fetching user data:", err);
      toast.error('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
      handleLogout(false); // Llamamos a logout sin mostrar toast de nuevo
    }
  }, []);

  // --- FUNCIÓN PARA OBTENER AVISOS ---
  const fetchNotices = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch(`${API_BASE_URL}notices/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setNotices(data);
    } catch (err) {
      console.error("Error fetching notices:", err);
      toast.error(`Error al cargar avisos: ${err.message}`);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- EFECTO INICIAL PARA VERIFICAR LA SESIÓN ---
  useEffect(() => {
    const checkAuth = async () => {
      await fetchUserData();
      // Ya no necesitamos setLoading(false) aquí, se maneja en fetchUserData y fetchNotices
    };
    checkAuth();
  }, [fetchUserData]);

  // --- EFECTO PARA CARGAR DATOS CUANDO EL USUARIO SE AUTENTICA ---
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotices();
    } else {
      setNotices([]);
      setLoading(false);
    }
  }, [isAuthenticated, fetchNotices]);

  // --- MANEJADORES DE EVENTOS ---
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    // fetchUserData se llamará automáticamente por el cambio de estado,
    // pero lo llamamos aquí para asegurar que los datos se carguen de inmediato.
    fetchUserData();
  };

  const handleLogout = (showToast = true) => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsAuthenticated(false);
    setUser(null);
    if (showToast) {
      toast.info('Has cerrado sesión.');
    }
  };

  // --- LÓGICA DE ROLES ---
  const isAdmin = user && user.groups && user.groups.includes('Administrador');
  const isResidente = user && user.groups && user.groups.includes('Residente');
  // ... (otros roles que puedas tener)

  // --- RENDERIZADO DEL COMPONENTE ---
  const MainContent = () => (
      <Container className="mt-4 fade-in">
        <div className="welcome-header mb-4 fade-in-down">
          {/* Usamos el nombre del usuario si existe, si no, un genérico */}
          <h2 className="mb-2">Bienvenido, {user ? user.nombre : 'Usuario'}!</h2>
          <p className="lead text-muted">Gestiona tu condominio de manera inteligente y eficiente.</p>
        </div>
        {/* ... (el resto de tu componente MainContent no necesita cambios) ... */}
        <h3 className="mb-0">Avisos Recientes</h3>
        {loading ? <Spinner animation="border" /> :
         notices.length > 0 ? (
          <Row xs={1} md={2} lg={3} className="g-4 fade-in-up">
            {/* ... Mapeo de avisos ... */}
          </Row>
         ) : (
          <Card className="text-center p-5 fade-in">
            <Card.Title>No hay avisos disponibles</Card.Title>
          </Card>
         )
        }
      </Container>
  );

  return (
    <Router>
      <div className="App">
        {isAuthenticated && user && ( // Solo muestra la Navbar si el usuario está autenticado Y sus datos se han cargado
          <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
            <Container>
              <Navbar.Brand as={Link} to="/" className="fw-bold">
                Smart Condominium
              </Navbar.Brand>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                  <Nav.Link as={Link} to="/">Inicio</Nav.Link>
                  {isAdmin && (
                    <>
                      <Nav.Link as={Link} to="/manage-users">Gestionar Usuarios</Nav.Link>
                    </>
                  )}
                  {isResidente && (
                    <>
                      <Nav.Link as={Link} to="/my-profile">Mi Perfil</Nav.Link>
                    </>
                  )}
                </Nav>
                <div className="d-flex align-items-center mt-3 mt-lg-0">
                  <span className="text-light me-3">
                    {user.nombre} {user.apellido}
                  </span>
                  <Button variant="outline-light" onClick={() => handleLogout()}>
                    Cerrar Sesión
                  </Button>
                </div>
              </Navbar.Collapse>
            </Container>
          </Navbar>
        )}

        <main className="flex-grow-1">
          <Routes>
            <Route path="/login" element={!isAuthenticated ? <Login onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/" />} />
            <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />

            {/* Rutas Protegidas */}
            <Route path="/" element={isAuthenticated ? <MainContent /> : <Navigate to="/login" />} />
            <Route path="/my-profile" element={isAuthenticated && isResidente ? <UserProfile /> : <Navigate to="/login" />} />
            <Route path="/manage-users" element={isAuthenticated && isAdmin ? <UserManagement /> : <Navigate to="/login" />} />

            {/* Añade más rutas protegidas aquí */}
          </Routes>
        </main>

        <footer className="footer mt-auto py-3">
          <Container className="text-center">
            <span>© 2023 Smart Condominium - Todos los derechos reservados</span>
          </Container>
        </footer>
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false}/>
    </Router>
  );
}

export default App;
