import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Alert, Spinner, Row, Col, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './UserProfile.css'; // Import custom styles

function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    setError(null);
    const accessToken = localStorage.getItem('access_token');
    
    if (!accessToken) {
      setError('No authentication token found. Please log in.');
      setLoading(false);
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/users/me/', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const userData = await response.json();
      setUser(userData);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError(err.message);
      toast.error('Error al obtener datos del usuario.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
    toast.info('Has cerrado sesión.');
  };

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "400px" }}>
          <Spinner animation="border" role="status" className="mb-3">
            <span className="visually-hidden">Cargando perfil...</span>
          </Spinner>
          <p className="mb-0">Cargando perfil de usuario...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger" className="text-center fade-in">
          <Alert.Heading>Error al cargar el perfil</Alert.Heading>
          <p>{error}</p>
          <hr />
          <div className="d-flex justify-content-center">
            <Button onClick={fetchUserData} variant="outline-danger" className="me-2 hover-lift">
              Reintentar
            </Button>
            <Button onClick={handleLogout} variant="outline-secondary" className="hover-lift">
              Cerrar Sesión
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4 fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4 fade-in-down">
        <h2>Perfil de Usuario</h2>
        <Button variant="outline-secondary" onClick={handleLogout} className="hover-lift">
          <i className="fas fa-sign-out-alt me-1"></i>
          Cerrar Sesión
        </Button>
      </div>
      
      <Card className="shadow-sm mb-4 fade-in-up">
        <Card.Body>
          <Row>
            <Col md={3} className="text-center mb-3 mb-md-0">
              <div className="profile-avatar mx-auto">
                <i className="fas fa-user-circle fa-5x text-primary"></i>
              </div>
              <h4 className="mt-3 mb-1">{user?.username}</h4>
              <p className="text-muted">{user?.full_name || 'Nombre no disponible'}</p>
            </Col>
            <Col md={9}>
              <h5 className="mb-3">Información Personal</h5>
              <Row>
                <Col md={6}>
                  <p><strong>ID de Usuario:</strong> {user?.id}</p>
                  <p><strong>Nombre de Usuario:</strong> {user?.username}</p>
                  <p><strong>Nombre Completo:</strong> {user?.full_name || 'No disponible'}</p>
                  <p><strong>Email:</strong> {user?.email || 'No disponible'}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Teléfono:</strong> {user?.phone_number || 'No disponible'}</p>
                  <p><strong>Unidad Residencial:</strong> {user?.unit_name || 'No disponible'}</p>
                  <p><strong>Residente Principal:</strong> 
                    {user?.is_principal ? (
                      <Badge bg="success" className="ms-2">Sí</Badge>
                    ) : (
                      <Badge bg="secondary" className="ms-2">No</Badge>
                    )}
                  </p>
                  <p><strong>Fecha de Registro:</strong> {user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'No disponible'}</p>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      <Card className="shadow-sm fade-in-up">
        <Card.Body>
          <h5 className="mb-3">Roles y Permisos</h5>
          {user?.groups && user.groups.length > 0 ? (
            <div className="d-flex flex-wrap gap-2">
              {user.groups.map((group, index) => (
                <Badge key={index} bg="primary" className="fs-6">
                  {group}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted">No se han asignado roles a este usuario.</p>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default UserProfile;