import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Container, Spinner } from 'react-bootstrap'; // Added Spinner
import { useNavigate } from 'react-router-dom';

function VehicleRegistration() {
  const [plateNumber, setPlateNumber] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [ownerId, setOwnerId] = useState(''); // State for selected resident owner
  const [residents, setResidents] = useState([]); // State for list of residents
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [residentsLoading, setResidentsLoading] = useState(true); // New loading state for residents
  const [residentsError, setResidentsError] = useState(null); // New error state for residents
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
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setResidents(data);
      } catch (err) {
        console.error("Error fetching residents:", err);
        setResidentsError("Could not load residents. Please try again later.");
      } finally {
        setResidentsLoading(false);
      }
    };
    fetchResidents();
  }, []); // Empty dependency array means this effect runs once

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
          owner_id: ownerId, // Send the selected resident ID as owner_id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = Object.values(errorData).flat().join(' ');
        throw new Error(errorMessage || 'Failed to register vehicle');
      }

      setSuccess('Vehículo registrado exitosamente!');
      setPlateNumber('');
      setBrand('');
      setModel('');
      setColor('');
      setOwnerId(''); // Clear selected owner
      // Optionally navigate away or clear form
      // navigate('/');
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
            <h2 className="text-center mb-4">Registrar Vehículo</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group id="plateNumber" className="mb-3">
                <Form.Label>Número de Placa:</Form.Label>
                <Form.Control
                  type="text"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group id="brand" className="mb-3">
                <Form.Label>Marca:</Form.Label>
                <Form.Control
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group id="model" className="mb-3">
                <Form.Label>Modelo:</Form.Label>
                <Form.Control
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group id="color" className="mb-3">
                <Form.Label>Color:</Form.Label>
                <Form.Control
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
              </Form.Group>

              <Form.Group id="owner" className="mb-3">
                <Form.Label>Propietario (Residente):</Form.Label>
                {residentsLoading ? (
                  <div className="text-center">
                    <Spinner animation="border" size="sm" /> Cargando residentes...
                  </div>
                ) : residentsError ? (
                  <Alert variant="danger">{residentsError}</Alert>
                ) : ( 
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
                )}
              </Form.Group>

              <Button variant="primary" type="submit" className="w-100" disabled={loading || residentsLoading}>
                {loading ? 'Registrando...' : 'Registrar Vehículo'}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}

export default VehicleRegistration;