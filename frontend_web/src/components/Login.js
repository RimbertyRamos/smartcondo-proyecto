import React, { useState } from 'react';
import { Form, Button, Card, Alert, Container, InputGroup, Spinner, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Login.css'; // Cambiado a Login.css
import API_BASE_URL from '../apiConfig';
import Logo from './Logo'; // Reutilizamos el logo

function Login({ onLoginSuccess }) {
  // --- ESTADOS ACTUALIZADOS ---
  const [email, setEmail] = useState(''); // Cambiado de username a email
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // --- BODY DE LA PETICIÓN ACTUALIZADO ---
      // Enviamos el 'email' como 'username' al backend
      const response = await fetch(`${API_BASE_URL}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || Object.values(errorData).flat().join(' ') || 'Credenciales incorrectas';
        toast.error(`Error: ${errorMessage}`);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      onLoginSuccess();
      toast.success('¡Inicio de sesión exitoso!');
      navigate('/dashboard'); // Redirige al dashboard o a la página principal

    } catch (err) {
      setError("No se pudo iniciar sesión. Por favor, verifica tu correo y contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-elegant">
      <Container>
        <div className="login-container">
          {/* --- COLUMNA DE BRANDING --- */}
          <Col lg={5} className="branding-col d-none d-lg-flex">
            <div className="branding-content">
              <Logo size={80} />
              <h1>Smart Condominium</h1>
              <p>Bienvenido de nuevo. Accede para gestionar tu comunidad.</p>
            </div>
          </Col>

          {/* --- COLUMNA DEL FORMULARIO --- */}
          <Col lg={7} className="form-col">
            <h2>Iniciar Sesión</h2>
            <p className="text-muted mb-4">Ingresa tus credenciales para continuar.</p>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group id="email" className="mb-3">
                <Form.Label>Correo Electrónico</Form.Label>
                <InputGroup>
                  <InputGroup.Text><i className="fas fa-envelope"></i></InputGroup.Text>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Ingresa tu correo"
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group id="password" className="mb-3">
                <Form.Label>Contraseña</Form.Label>
                <InputGroup>
                  <InputGroup.Text><i className="fas fa-lock"></i></InputGroup.Text>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Ingresa tu contraseña"
                  />
                  <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </Button>
                </InputGroup>
              </Form.Group>

              <Button type="submit" className="w-100 login-btn" disabled={loading}>
                {loading ? <><Spinner as="span" animation="border" size="sm" /> Iniciando...</> : 'Entrar'}
              </Button>
            </Form>
            <div className="w-100 text-center mt-3">
              ¿No tienes una cuenta? <Link to="/register" className="register-link">Regístrate</Link>
            </div>
          </Col>
        </div>
      </Container>
    </div>
  );
}

export default Login;