import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Container, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

function Register({ onRegistrationSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [unitId, setUnitId] = useState('');
  const [units, setUnits] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
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
        throw new Error(errorMessage || 'Registration failed');
      }

      setSuccessMessage('¡Cuenta creada exitosamente! Redirigiendo al inicio de sesión...');
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
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
      <div className="w-100" style={{ maxWidth: "600px" }}>
        <Card>
          <Card.Body>
            <h2 className="text-center mb-4">Registrar Usuario</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {successMessage && <Alert variant="success">{successMessage}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group id="username" className="mb-3">
                <Form.Label>Usuario:</Form.Label>
                <Form.Control
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group id="password" className="mb-3">
                <Form.Label>Contraseña:</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group id="email" className="mb-3">
                <Form.Label>Email:</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Form.Group>
              <Form.Group id="fullName" className="mb-3">
                <Form.Label>Nombre Completo:</Form.Label>
                <Form.Control
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group id="phoneNumber" className="mb-3">
                <Form.Label>Número de Teléfono:</Form.Label>
                <Form.Control
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </Form.Group>
              <Form.Group id="unit" className="mb-3">
                <Form.Label>Unidad Residencial:</Form.Label>
                
                {unitsLoading ? (
                  <div className="text-center">
                    <Spinner animation="border" size="sm" /> Cargando unidades...
                  </div>
                ) : unitsError ? (
                  <Alert variant="danger">{unitsError}</Alert>
                ) : (
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
                )}
              </Form.Group>
              <Button variant="primary" type="submit" className="w-100" disabled={loading || unitsLoading}>
                {loading ? 'Registrando...' : 'Registrar'}
              </Button>
            </Form>
            <div className="w-100 text-center mt-3">
              ¿Ya tienes una cuenta? <Link to="/login">Inicia Sesión</Link>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}

export default Register;
