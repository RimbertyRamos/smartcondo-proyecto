import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Container, Spinner, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Register.css';
import API_BASE_URL from '../apiConfig';
import Logo from './Logo';

function Register() {
    // --- Estados para los campos del formulario ---
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [cod, setCod] = useState('');
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [sexo, setSexo] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [unitId, setUnitId] = useState('');
    const [units, setUnits] = useState([]);

    // --- Estados para la UI (carga, errores, etc.) ---
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [unitsLoading, setUnitsLoading] = useState(true);
    const [unitsError, setUnitsError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUnits = async () => {
            setUnitsLoading(true);
            setUnitsError(null);
            try {
                const response = await fetch(`${API_BASE_URL}/properties/`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                setUnits(data.results || data);
            } catch (err) {
                console.error("Error fetching units:", err);
                setUnitsError("No se pudieron cargar las unidades residenciales.");
            } finally {
                setUnitsLoading(false);
            }
        };
        fetchUnits();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cod,
                    nombre,
                    apellido,
                    correo: email,
                    sexo,
                    telefono: phoneNumber,
                    password,
                    property_id: parseInt(unitId, 10),
                }),
            });

            const responseData = await response.json();

            if (!response.ok) {
                const errorMessage = Object.values(responseData).flat().join(' ');
                toast.error(`Error al registrar: ${errorMessage}`);
                throw new Error(errorMessage);
            }

            toast.success('¡Cuenta creada exitosamente! Redirigiendo al inicio de sesión...');
            setTimeout(() => navigate('/login'), 2000);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page-elegant">
            <Container>
                <div className="register-container">
                    <Col lg={5} className="branding-col d-none d-lg-flex">
                        <div className="branding-content">
                            <Logo size={80} />
                            <h1>Bienvenido a Smart Condominium</h1>
                            <p>La solución inteligente para la gestión de tu hogar. Regístrate para comenzar.</p>
                        </div>
                    </Col>

                    <Col lg={7} className="form-col">
                        <h2>Crear una Cuenta</h2>
                        <p className="text-muted mb-4">Completa tus datos para unirte a la comunidad.</p>

                        {error && <Alert variant="danger">{error}</Alert>}

                        <Form onSubmit={handleSubmit}>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Nombre</Form.Label>
                                        <Form.Control type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required placeholder="Tu nombre" />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Apellido</Form.Label>
                                        <Form.Control type="text" value={apellido} onChange={(e) => setApellido(e.target.value)} required placeholder="Tu apellido" />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label>Email (será tu usuario)</Form.Label>
                                <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="ejemplo@correo.com" />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Contraseña</Form.Label>
                                <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Crea una contraseña segura" />
                            </Form.Group>

                             <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Código (CI/Pasaporte)</Form.Label>
                                        <Form.Control type="text" value={cod} onChange={(e) => setCod(e.target.value)} required />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Teléfono</Form.Label>
                                        <Form.Control type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                               <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Sexo</Form.Label>
                                        <Form.Select value={sexo} onChange={(e) => setSexo(e.target.value)} required>
                                            <option value="">Selecciona...</option>
                                            <option value="Masculino">Masculino</option>
                                            <option value="Femenino">Femenino</option>
                                            <option value="Otro">Otro</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Unidad Residencial</Form.Label>
                                        {unitsLoading ? <div className="text-center"><Spinner animation="border" size="sm" /></div> : unitsError ? <Alert variant="danger" size="sm">{unitsError}</Alert> : (
                                            <Form.Select value={unitId} onChange={(e) => setUnitId(e.target.value)} required>
                                                <option value="">Selecciona tu unidad</option>
                                                {units.map(unit => (
                                                    <option key={unit.id} value={unit.id}>{unit.cod}</option>
                                                ))}
                                            </Form.Select>
                                        )}
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Button type="submit" className="w-100 register-btn" disabled={loading || unitsLoading}>
                                {loading ? <><Spinner as="span" animation="border" size="sm" /> Registrando...</> : 'Crear Cuenta'}
                            </Button>
                        </Form>
                        <div className="w-100 text-center mt-3">
                            ¿Ya tienes una cuenta? <Link to="/login" className="login-link">Inicia Sesión</Link>
                        </div>
                    </Col>
                </div>
            </Container>
        </div>
    );
}

export default Register;