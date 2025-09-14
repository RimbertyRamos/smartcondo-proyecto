import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Alert, Spinner } from 'react-bootstrap';

function UserManagementSimple() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://127.0.0.1:8000/api/';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    const accessToken = localStorage.getItem('access_token');
    
    if (!accessToken) {
      setError('No authentication token found. Please log in.');
      setLoading(false);
      return;
    }

    try {
      // Fetch users
      const usersResponse = await fetch(`${API_BASE_URL}users/`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (!usersResponse.ok) {
        throw new Error(`HTTP error! status: ${usersResponse.status} fetching users`);
      }
      
      const usersData = await usersResponse.json();
      console.log('Users data received:', usersData);
      setUsers(usersData.results || usersData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "400px" }}>
          <Spinner animation="border" role="status" className="mb-3">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
          <p className="mb-0">Cargando usuarios...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <Alert.Heading>Error al cargar datos</Alert.Heading>
          <p>{error}</p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button onClick={fetchData} variant="outline-danger">
              Reintentar
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Usuarios</h2>
        <Button variant="primary" onClick={fetchData}>
          Actualizar
        </Button>
      </div>
      
      <Card>
        <Card.Body>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Email</th>
                <th>Nombre completo</th>
                <th>Unidad</th>
                <th>Principal</th>
              </tr>
            </thead>
            <tbody>
              {users && users.length > 0 ? (
                users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.email || 'N/A'}</td>
                    <td>{user.full_name || 'N/A'}</td>
                    <td>{user.unit_name || 'N/A'}</td>
                    <td>{user.is_principal ? 'Sí' : 'No'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    No se encontraron usuarios
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default UserManagementSimple;