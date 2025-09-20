import React, { useState } from 'react';
import { Form, Button, Alert, Container, InputGroup, Spinner, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Login.css';
import API_BASE_URL from '../apiConfig';
import Logo from './Logo';

// Asumimos que App.js le pasa una función `onLoginSuccess` para actualizar el estado de autenticación global.
function Login({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
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
            const response = await fetch(`${API_BASE_URL}login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // El backend espera 'username' para la autenticación, que es nuestro email.
                body: JSON.stringify({ username: email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Capturamos el mensaje de error específico del backend.
                throw new Error(data.error || 'Credenciales incorrectas');
            }

            // Si el login es exitoso, guardamos los tokens en el navegador.
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);

            // Ejecutamos la función del componente padre para indicar que el login fue exitoso.
            if (onLoginSuccess) {
                onLoginSuccess();
            }

            toast.success('¡Inicio de sesión exitoso!');
            navigate('/dashboard'); // Redirigimos al panel principal.

        } catch (err) {
            setError(err.message);
            toast.error(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-elegant">
            <Container>
                <div className="login-container">
                    <Col lg={5} className="branding-col d-none d-lg-flex">
                        <div className="branding-content">
                            <Logo size={80} />
                            <h1>Smart Condominium</h1>
                            <p>Bienvenido de nuevo. Accede para gestionar tu comunidad.</p>
                        </div>
                    </Col>

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
                                {loading ? <><Spinner as="span" animation="border"
                                    size="sm" /> Iniciando...</> : 'Entrar'}
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
