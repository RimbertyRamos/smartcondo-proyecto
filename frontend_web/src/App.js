import React, { useState, useEffect } from 'react';
import { Navbar, Container, Nav, Button, Spinner, Alert, Card, Row, Col } from 'react-bootstrap';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';

import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import VehicleRegistration from './components/VehicleRegistration';
import UserManagement from './components/UserManagement'; // Import UserManagement component

function App() {
  const [notices, setNotices] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null); // New state for user data

  // Check authentication status and fetch user data on initial load or login
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      setIsAuthenticated(true);
      fetchUserData(accessToken); // Fetch user data if authenticated
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
        throw new Error('Failed to fetch user data');
      }
      const userData = await response.json();
      setUser(userData);
    } catch (err) {
      console.error("Error fetching user data:", err);
      // If fetching user data fails, assume not authenticated or token is bad
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
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setNotices(data);
    } catch (err) {
      console.error("Error fetching notices:", err);
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
    fetchUserData(localStorage.getItem('access_token')); // Fetch user data after successful login
    // window.location.href = '/'; // Removed
  };

  const handleRegistrationSuccess = () => {
    // window.location.href = '/login'; // Removed
    alert('Registro exitoso. Por favor, inicia sesión.');
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsAuthenticated(false);
    setUser(null); // Clear user data on logout
    // window.location.href = '/login'; // Removed
  };

  // Check if the logged-in user is an administrator
  const isAdmin = user && user.groups && user.groups.includes('Administrador');
  const isResidente = user && user.groups && user.groups.includes('Residente');
  const isSeguridad = user && user.groups && user.groups.includes('Seguridad');
  const isMantenimiento = user && user.groups && user.groups.includes('Mantenimiento');


  const MainContent = () => (
    <Container className="mt-4">
      <h2 className="mb-4">Bienvenido, {user ? user.username : 'Usuario'}!</h2> {/* Welcome message */}
      <h3 className="mb-4">Avisos Recientes</h3>
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando avisos...</span>
          </Spinner>
          <p>Cargando avisos...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : notices.length > 0 ? (
        <Row xs={1} md={2} lg={3} className="g-4"> {/* Use Row and Col for grid */}
          {notices.map(notice => (
            <Col key={notice.id}>
              <Card className="h-100 shadow-sm"> {/* Added shadow */}
                <Card.Body>
                  <Card.Title>{notice.title}</Card.Title>
                  <Card.Text>{notice.content}</Card.Text>
                </Card.Body>
                <Card.Footer className="text-muted">
                  Publicado: {new Date(notice.published_date).toLocaleDateString()}
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Alert variant="info" className="text-center">No hay avisos disponibles.</Alert>
      )}
    </Container>
  );

  return (
    <Router>
      <div className="App">
        {isAuthenticated && (
          <Navbar bg="dark" variant="dark" expand="lg">
            <Container>
              <Navbar.Brand as={Link} to="/">Smart Condominium</Navbar.Brand>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                  <Nav.Link as={Link} to="/">Inicio</Nav.Link>
                  <Nav.Link as={Link} to="/notices">Avisos</Nav.Link>
                  {isAdmin && ( // Conditionally render based on isAdmin
                    <> 
                      <Nav.Link as={Link} to="/register-vehicle">Registrar Vehículo</Nav.Link>
                      <Nav.Link as={Link} to="/manage-users">Gestionar Usuarios</Nav.Link> {/* New Nav Link */}
                    </>
                  )}
                  {isResidente && (
                    <> 
                      {/* <Nav.Link as={Link} to="/my-profile">Mi Perfil</Nav.Link> */}
                      {/* <Nav.Link as={Link} to="/my-vehicles">Mis Vehículos</Nav.Link> */}
                      {/* <Nav.Link as={Link} to="/my-fees">Mis Cuotas</Nav.Link> */}
                    </>
                  )}
                  {isSeguridad && (
                    <> 
                      {/* <Nav.Link as={Link} to="/manage-visitors">Gestionar Visitantes</Nav.Link> */}
                      {/* <Nav.Link as={Link} to="/view-all-vehicles">Ver Vehículos</Nav.Link> */}
                    </>
                  )}
                  {isMantenimiento && (
                    <> 
                      {/* <Nav.Link as={Link} to="/maintenance-tasks">Tareas de Mantenimiento</Nav.Link> */}
                    </>
                  )}
                </Nav>
                <Button variant="outline-light" onClick={handleLogout}>Cerrar Sesión</Button>
              </Navbar.Collapse>
            </Container>
          </Navbar>
        )}

        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register onRegistrationSuccess={handleRegistrationSuccess} />} />
          <Route path="/" element={isAuthenticated ? <MainContent /> : <Navigate to="/login" />} />
          <Route path="/notices" element={isAuthenticated ? <MainContent /> : <Navigate to="/login" />} />
          <Route path="/register-vehicle" element={isAuthenticated && isAdmin ? <VehicleRegistration /> : <Navigate to="/login" />} />
          <Route path="/manage-users" element={isAuthenticated && isAdmin ? <UserManagement /> : <Navigate to="/login" />} /> {/* New Route */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
