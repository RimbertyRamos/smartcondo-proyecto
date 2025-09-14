import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Container, Spinner, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; // Import toast
import './VehicleRegistration.css'; // Import custom styles

function VehicleRegistration() {
  const [plateNumber, setPlateNumber] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [ownerId, setOwnerId] = useState(''); // State for selected resident owner
  const [residents, setResidents] = useState([]); // State for list of residents
  const [error, setError] = useState(null); // Keep for form-specific error display
  const [success, setSuccess] = useState(null); // Keep for form-specific success message
  const [loading, setLoading] = useState(false);
  const [residentsLoading, setResidentsLoading] = useState(true);
  const [residentsError, setResidentsError] = useState(null);
  const navigate = useNavigate();

  // Fetch residents when component mounts
  useEffect(() => {
    const fetchResidents = async () => {
      setResidentsLoading(true);
      setResidentsError(null);
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        setResidentsError('No authentication token found. Please log in.');
        setResidentsLoading(false);
        return;
      }

      try {
        const response = await fetch('http://127.0.0.1:8000/api/residents/', {
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setResidents(data.results || data);
      } catch (err) {
        console.error("Error fetching residents:", err);
        setResidentsError("No se pudieron cargar los residentes. Por favor, inténtalo de nuevo más tarde.");
      } finally {
        setResidentsLoading(false);
      }
    };
    fetchResidents();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      setError('No authentication token found. Please log in.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/vehicles/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          plate_number: plateNumber,
          brand,
          model,
          color,
          owner_id: ownerId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = Object.values(errorData).flat().join(' ');
        toast.error(`Error al registrar vehículo: ${errorMessage}`); // Use toast for error
        throw new Error(errorMessage); // Still throw to set local error state
      }

      setSuccess('Vehículo registrado exitosamente!');
      toast.success('¡Vehículo registrado exitosamente!'); // Use toast for success
      setPlateNumber('');
      setBrand('');
      setModel('');
      setColor('');
      setOwnerId('');
      // Optionally navigate away or clear form
      // navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vehicle-registration-page">
      <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
        <div className="w-100" style={{ maxWidth: "650px" }}>
          <div className="text-center mb-4 fade-in-down">
            <div className="brand-icon mb-3">
              <i className="fas fa-car fa-3x text-primary"></i>
            </div>
            <h1 className="h3 mb-3 font-weight-normal">Registro de Vehículos</h1>
            <p className="text-muted">Registra un nuevo vehículo en el sistema</p>
          </div>
          <Card className="shadow-sm fade-in-up">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Registrar Vehículo</h2>
              {error && <Alert variant="danger" className="fade-in">{error}</Alert>}
              {success && <Alert variant="success" className="fade-in">{success}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group id="plateNumber" className="mb-3 fade-in-left">
                  <Form.Label>Número de Placa:</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <i className="fas fa-id-card"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      value={plateNumber}
                      onChange={(e) => setPlateNumber(e.target.value)}
                      required
                      placeholder="Ingresa el número de placa"
                    />
                  </InputGroup>
                </Form.Group>
                <Form.Group id="brand" className="mb-3 fade-in-left">
                  <Form.Label>Marca:</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <i className="fas fa-car"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      required
                      placeholder="Ingresa la marca del vehículo"
                    />
                  </InputGroup>
                </Form.Group>
                <Form.Group id="model" className="mb-3 fade-in-right">
                  <Form.Label>Modelo:</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <i className="fas fa-car-side"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      required
                      placeholder="Ingresa el modelo del vehículo"
                    />
                  </InputGroup>
                </Form.Group>
                <Form.Group id="color" className="mb-3 fade-in-right">
                  <Form.Label>Color:</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <i className="fas fa-palette"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="Ingresa el color del vehículo"
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group id="owner" className="mb-3 fade-in-left">
                  <Form.Label>Propietario (Residente):</Form.Label>
                  {residentsLoading ? (
                    <div className="text-center py-3 fade-in">
                      <Spinner animation="border" size="sm" className="me-2" />
                      <span>Cargando residentes...</span>
                    </div>
                  ) : residentsError ? (
                    <Alert variant="danger" className="fade-in">{residentsError}</Alert>
                  ) : (
                    <InputGroup>
                      <InputGroup.Text>
                        <i className="fas fa-user"></i>
                      </InputGroup.Text>
                      <Form.Select
                        value={ownerId}
                        onChange={(e) => setOwnerId(e.target.value)}
                        required
                      >
                        <option value="">Selecciona un residente</option>
                        {residents.map(resident => (
                          <option key={resident.id} value={resident.id}>
                            {resident.full_name} ({resident.unit.name})
                          </option>
                        ))}
                      </Form.Select>
                    </InputGroup>
                  )}
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 mt-3 hover-lift" disabled={loading || residentsLoading}>
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
                      <i className="fas fa-car me-2"></i>
                      Registrar Vehículo
                    </>
                  )}
                </Button>
              </Form>
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

export default VehicleRegistration;
