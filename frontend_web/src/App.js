import React, { useState, useEffect } from 'react';
import { Navbar, Container, Nav, Button, Spinner, Alert, Card, Row, Col } from 'react-bootstrap';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify'; // Import ToastContainer and toast
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS

import './App.css';
import './custom-styles.css'; // Import custom styles
import Login from './components/Login';
import Register from './components/Register';
import VehicleRegistration from './components/VehicleRegistration';
import UserManagement from './components/UserManagement';
import UserProfile from './components/UserProfile'; // Import UserProfile component

function App() {
  const [notices, setNotices] = useState([]);
  const [error, setError] = useState(null); // Keep for main content error display
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      setIsAuthenticated(true);
      fetchUserData(accessToken);
    }
  }, []);

  const fetchUserData = async (token) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/users/me/', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        // toast.error('Error al obtener datos del usuario. Por favor, inicia sesión de nuevo.'); // Use toast for this
        throw new Error('Failed to fetch user data');
      }
      const userData = await response.json();
      setUser(userData);
    } catch (err) {
      console.error("Error fetching user data:", err);
      toast.error('Error al obtener datos del usuario. Por favor, inicia sesión de nuevo.'); // Use toast
      setIsAuthenticated(false);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  };

  const fetchNotices = async () => {
    setLoading(true);
    setError(null);
    const API_URL = 'http://127.0.0.1:8000/api/notices/';
    const accessToken = localStorage.getItem('access_token');

    try {
      const response = await fetch(API_URL, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setIsAuthenticated(false);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          toast.error('Sesión expirada o no autorizado. Por favor, inicia sesión de nuevo.'); // Use toast
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setNotices(data);
    } catch (err) {
      console.error("Error fetching notices:", err);
      toast.error(`Error al cargar avisos: ${err.message}`); // Use toast
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotices();
    } else {
      setNotices([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    fetchUserData(localStorage.getItem('access_token'));
    // toast.success('¡Inicio de sesión exitoso!'); // Removed duplicate toast
    // window.location.href = '/'; // Removed
  };

  const handleRegistrationSuccess = () => {
    // window.location.href = '/login'; // Removed
    toast.success('¡Cuenta creada exitosamente! Por favor, inicia sesión.'); // Use toast for success
    // alert('Registro exitoso. Por favor, inicia sesión.'); // Removed alert
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsAuthenticated(false);
    setUser(null);
    toast.info('Has cerrado sesión.'); // Use toast for info
    // window.location.href = '/login'; // Removed
  };

  const isAdmin = user && user.groups && user.groups.includes('Administrador');
  const isResidente = user && user.groups && user.groups.includes('Residente');
  const isSeguridad = user && user.groups && user.groups.includes('Seguridad');
  const isMantenimiento = user && user.groups && user.groups.includes('Mantenimiento');


  const MainContent = () => (
    <Container className="mt-4 fade-in">
      <div className="welcome-header mb-4 fade-in-down">
        <h2 className="mb-2">Bienvenido, {user ? user.username : 'Usuario'}!</h2>
        <p className="lead text-muted">Gestiona tu condominio de manera inteligente y eficiente.</p>
      </div>
      <div className="d-flex justify-content-between align-items-center mb-4 fade-in-up">
        <h3 className="mb-0">Avisos Recientes</h3>
        <Button variant="outline-primary" size="sm" onClick={fetchNotices} className="hover-lift">
          <i className="fas fa-sync-alt me-1"></i>
          Actualizar
        </Button>
      </div>
      {loading ? (
        <div className="text-center py-5 fade-in">
          <Spinner animation="border" role="status" className="mb-3">
            <span className="visually-hidden">Cargando avisos...</span>
          </Spinner>
          <p className="mb-0">Cargando avisos...</p>
        </div>
      ) : error ? (
        <Alert variant="danger" className="text-center fade-in">
          <Alert.Heading>Error al cargar avisos</Alert.Heading>
          <p>{error}</p>
          <hr />
          <div className="d-flex justify-content-center">
            <Button onClick={fetchNotices} variant="outline-danger" className="hover-lift">
              Reintentar
            </Button>
          </div>
        </Alert>
      ) : notices.length > 0 ? (
        <Row xs={1} md={2} lg={3} className="g-4 fade-in-up">
          {notices.map((notice, index) => (
            <Col key={notice.id} className={`staggered-animation delay-${(index % 5) + 1}`}>
              <Card className="h-100 notice-card hover-lift">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title className="mb-0">{notice.title}</Card.Title>
                    <span className="badge bg-primary">Nuevo</span>
                  </div>
                  <Card.Text className="notice-content">{notice.content}</Card.Text>
                </Card.Body>
                <Card.Footer className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    <i className="far fa-calendar-alt me-1"></i>
                    {new Date(notice.published_date).toLocaleDateString()}
                  </small>
                  <Button variant="outline-primary" size="sm" className="hover-lift">
                    <i className="fas fa-external-link-alt"></i>
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Card className="text-center p-5 fade-in">
          <div className="mb-3">
            <i className="fas fa-bell-slash fa-3x text-muted"></i>
          </div>
          <Card.Title>No hay avisos disponibles</Card.Title>
          <Card.Text className="mb-4">
            Cuando haya nuevos avisos, aparecerán aquí.
          </Card.Text>
          <Button variant="primary" onClick={fetchNotices} className="hover-lift">
            <i className="fas fa-sync-alt me-1"></i>
            Verificar nuevamente
          </Button>
        </Card>
      )}
    </Container>
  );

  return (
    <Router>
      <div className="App">
        {isAuthenticated && (
          <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
            <Container>
              <Navbar.Brand as={Link} to="/" className="fw-bold">
                <i className="fas fa-building me-2"></i>
                Smart Condominium
              </Navbar.Brand>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                  <Nav.Link as={Link} to="/" className="px-3">
                    <i className="fas fa-home me-1"></i>
                    Inicio
                  </Nav.Link>
                  <Nav.Link as={Link} to="/notices" className="px-3">
                    <i className="fas fa-bell me-1"></i>
                    Avisos
                  </Nav.Link>
                  {isAdmin && (
                    <>
                      <Nav.Link as={Link} to="/register-vehicle" className="px-3">
                        <i className="fas fa-car me-1"></i>
                        Registrar Vehículo
                      </Nav.Link>
                      <Nav.Link as={Link} to="/manage-users" className="px-3">
                        <i className="fas fa-users-cog me-1"></i>
                        Gestionar Usuarios
                      </Nav.Link>
                    </>
                  )}
                  {isResidente && (
                    <>
                      <Nav.Link as={Link} to="/my-profile" className="px-3">
                        <i className="fas fa-user-circle me-1"></i>
                        Mi Perfil
                      </Nav.Link>
                      {/* <Nav.Link as={Link} to="/my-vehicles" className="px-3">Mis Vehículos</Nav.Link> */}
                      {/* <Nav.Link as={Link} to="/my-fees" className="px-3">Mis Cuotas</Nav.Link> */}
                    </>
                  )}
                  {isSeguridad && (
                    <>
                      {/* <Nav.Link as={Link} to="/manage-visitors" className="px-3">Gestionar Visitantes</Nav.Link> */}
                      {/* <Nav.Link as={Link} to="/view-all-vehicles" className="px-3">Ver Vehículos</Nav.Link> */}
                    </>
                  )}
                  {isMantenimiento && (
                    <>
                      {/* <Nav.Link as={Link} to="/maintenance-tasks" className="px-3">Tareas de Mantenimiento</Nav.Link> */}
                    </>
                  )}
                </Nav>
                <div className="d-flex align-items-center mt-3 mt-lg-0">
                  <span className="text-light me-3 mb-2 mb-lg-0">
                    <i className="fas fa-user-circle me-1"></i>
                    {user ? user.username : 'Usuario'}
                  </span>
                  <Button variant="outline-light" onClick={handleLogout} className="d-flex align-items-center">
                    <i className="fas fa-sign-out-alt me-1"></i>
                    <span className="d-none d-md-inline">Cerrar Sesión</span>
                  </Button>
                </div>
              </Navbar.Collapse>
            </Container>
          </Navbar>
        )}

        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register onRegistrationSuccess={handleRegistrationSuccess} />} />
          <Route path="/" element={isAuthenticated ? <MainContent /> : <Navigate to="/login" />} />
          <Route path="/notices" element={isAuthenticated ? <MainContent /> : <Navigate to="/login" />} />
          <Route path="/my-profile" element={isAuthenticated ? <UserProfile /> : <Navigate to="/login" />} />
          <Route path="/register-vehicle" element={isAuthenticated && isAdmin ? <VehicleRegistration /> : <Navigate to="/login" />} />
          <Route path="/manage-users" element={isAuthenticated && isAdmin ? <UserManagement /> : <Navigate to="/login" />} />
        </Routes>
        
        {/* Footer */}
        <footer className="footer mt-auto py-3">
          <Container className="text-center">
            <span>© 2023 Smart Condominium - Todos los derechos reservados</span>
          </Container>
        </footer>
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </Router>
  );
}

export default App;
