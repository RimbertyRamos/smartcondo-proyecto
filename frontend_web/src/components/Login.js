import React, { useState } from 'react';
import { Form, Button, Card, Alert, Container, InputGroup, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify'; // Import toast
import './Login.css'; // Import custom styles

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null); // Keep for form-specific error display
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || Object.values(errorData).flat().join(' ') || 'Failed to login';
        toast.error(`Error al iniciar sesión: ${errorMessage}`); // Use toast for error
        throw new Error(errorMessage); // Still throw to set local error state
      }

      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      onLoginSuccess();
      toast.success('¡Inicio de sesión exitoso!'); // Use toast for success
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
        <div className="w-100" style={{ maxWidth: "450px" }}>
          <div className="text-center mb-4 fade-in-down">
            <div className="brand-icon mb-3">
              <i className="fas fa-building fa-3x text-primary"></i>
            </div>
            <h1 className="h3 mb-3 font-weight-normal">Smart Condominium</h1>
            <p className="text-muted">Inicia sesión para acceder a tu cuenta</p>
          </div>
          <Card className="shadow-sm fade-in-up">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Iniciar Sesión</h2>
              {error && <Alert variant="danger" className="fade-in">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group id="username" className="mb-3 fade-in-left">
                  <Form.Label>Usuario:</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <i className="fas fa-user"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      placeholder="Ingresa tu nombre de usuario"
                    />
                  </InputGroup>
                </Form.Group>
                <Form.Group id="password" className="mb-3 fade-in-left">
                  <Form.Label>Contraseña:</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <i className="fas fa-lock"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Ingresa tu contraseña"
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </Button>
                  </InputGroup>
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100 mt-3 hover-lift" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                      />
                      <span className="ms-2">Iniciando...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sign-in-alt me-2"></i>
                      Entrar
                    </>
                  )}
                </Button>
              </Form>
              <div className="w-100 text-center mt-3 fade-in-up">
                ¿No tienes una cuenta? <Link to="/register">Regístrate aquí</Link>
              </div>
            </Card.Body>
          </Card>
          <div className="text-center mt-3 text-muted fade-in-up">
            <small>© 2023 Smart Condominium</small>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default Login;