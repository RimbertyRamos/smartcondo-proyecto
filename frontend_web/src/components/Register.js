import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Container, Spinner, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; // Import toast
import './Register.css'; // Import custom styles

function Register({ onRegistrationSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [unitId, setUnitId] = useState('');
  const [units, setUnits] = useState([]);
  const [error, setError] = useState(null); // Keep for form-specific error display
  const [successMessage, setSuccessMessage] = useState(null); // Keep for form-specific success message
  const [loading, setLoading] = useState(false);
  const [unitsLoading, setUnitsLoading] = useState(true);
  const [unitsError, setUnitsError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUnits = async () => {
      setUnitsLoading(true);
      setUnitsError(null);
      try {
        const response = await fetch('http://127.0.0.1:8000/api/residential-units/');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setUnits(data.results || data);
      } catch (err) {
        console.error("Error fetching units:", err);
        setUnitsError("No se pudieron cargar las unidades residenciales. Por favor, inténtalo de nuevo más tarde.");
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
    setSuccessMessage(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          email,
          full_name: fullName,
          phone_number: phoneNumber,
          unit_id: unitId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = Object.values(errorData).flat().join(' ');
        toast.error(`Error al registrar: ${errorMessage}`); // Use toast for error
        throw new Error(errorMessage); // Still throw to set local error state
      }

      setSuccessMessage('¡Cuenta creada exitosamente! Redirigiendo al inicio de sesión...');
      toast.success('¡Cuenta creada exitosamente! Redirigiendo al inicio de sesión...'); // Use toast for success
      setUsername('');
      setPassword('');
      setEmail('');
      setFullName('');
      setPhoneNumber('');
      setUnitId('');

      setTimeout(() => {
        navigate('/login');
        onRegistrationSuccess();
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
        <div className="w-100" style={{ maxWidth: "650px" }}>
          <div className="text-center mb-4 fade-in-down">
            <div className="brand-icon mb-3">
              <i className="fas fa-building fa-3x text-primary"></i>
            </div>
            <h1 className="h3 mb-3 font-weight-normal">Smart Condominium</h1>
            <p className="text-muted">Crea una cuenta para acceder al sistema</p>
          </div>
          <Card className="shadow-sm fade-in-up">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Registrar Usuario</h2>
              {error && <Alert variant="danger" className="fade-in">{error}</Alert>}
              {successMessage && <Alert variant="success" className="fade-in">{successMessage}</Alert>}
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
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Ingresa tu contraseña"
                    />
                  </InputGroup>
                </Form.Group>
                <Form.Group id="email" className="mb-3 fade-in-right">
                  <Form.Label>Email:</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <i className="fas fa-envelope"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Ingresa tu correo electrónico"
                    />
                  </InputGroup>
                </Form.Group>
                <Form.Group id="fullName" className="mb-3 fade-in-right">
                  <Form.Label>Nombre Completo:</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <i className="fas fa-user-circle"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      placeholder="Ingresa tu nombre completo"
                    />
                  </InputGroup>
                </Form.Group>
                <Form.Group id="phoneNumber" className="mb-3 fade-in-left">
                  <Form.Label>Número de Teléfono:</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <i className="fas fa-phone"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Ingresa tu número de teléfono"
                    />
                  </InputGroup>
                </Form.Group>
                <Form.Group id="unit" className="mb-3 fade-in-right">
                  <Form.Label>Unidad Residencial:</Form.Label>
                  
                  {unitsLoading ? (
                    <div className="text-center py-3 fade-in">
                      <Spinner animation="border" size="sm" className="me-2" />
                      <span>Cargando unidades...</span>
                    </div>
                  ) : unitsError ? (
                    <Alert variant="danger" className="fade-in">{unitsError}</Alert>
                  ) : (
                    <InputGroup>
                      <InputGroup.Text>
                        <i className="fas fa-home"></i>
                      </InputGroup.Text>
                      <Form.Select
                        value={unitId}
                        onChange={(e) => setUnitId(e.target.value)}
                        required
                      >
                        <option value="">Selecciona una unidad</option>
                        {units.map(unit => (
                          <option key={unit.id} value={unit.id}>
                            {unit.name}
                          </option>
                        ))}
                      </Form.Select>
                    </InputGroup>
                  )}
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100 mt-3 hover-lift" disabled={loading || unitsLoading}>
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                      />
                      <span className="ms-2">Registrando...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-user-plus me-2"></i>
                      Registrar
                    </>
                  )}
                </Button>
              </Form>
              <div className="w-100 text-center mt-3 fade-in-up">
                ¿Ya tienes una cuenta? <Link to="/login">Inicia Sesión</Link>
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

export default Register;