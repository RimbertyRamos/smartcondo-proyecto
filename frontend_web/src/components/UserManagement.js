import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Form, Alert, Spinner, Modal } from 'react-bootstrap';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]); // To store available groups
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedGroups, setSelectedGroups] = useState([]);
  // const [isPrincipal, setIsPrincipal] = useState(false); // Removed from here
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState(null); // Error for update operation

  const API_BASE_URL = 'http://127.0.0.1:8000/api/';

  // Fetch users and groups
  useEffect(() => {
    fetchData();
  }, []);

  // Effect to clear error message after a few seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000); // Clear after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchData = async () => {
    setLoading(true);
    setError(null); // Clear main error state here
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
      if (!usersResponse.ok) throw new Error(`HTTP error! status: ${usersResponse.status} fetching users`);
      const usersData = await usersResponse.json();
      setUsers(usersData.results || usersData);

      // Fetch groups (from Django admin API, requires admin permissions)
      const groupsResponse = await fetch(`${API_BASE_URL}groups/`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (!groupsResponse.ok) throw new Error(`HTTP error! status: ${groupsResponse.status} fetching groups`);
      const groupsData = await groupsResponse.json();
      setGroups(groupsData.results || groupsData);

    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setCurrentUser(user);
    setSelectedGroups(Array.isArray(user.groups) ? user.groups.filter(g => typeof g === 'string') : []);
    // setIsPrincipal(user.is_principal); // Removed from here
    setUpdateError(null); // Clear update error when opening modal
    setShowModal(true);
  };

  const handleGroupChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedGroups([...selectedGroups, value]);
    } else {
      setSelectedGroups(selectedGroups.filter(group => group !== value));
    }
  };

  // New function to handle toggling is_principal
  const handleTogglePrincipal = async (user) => {
    const confirmToggle = window.confirm(
      `¿Estás seguro de que quieres ${user.is_principal ? 'quitar' : 'establecer'} a ${user.username} como Residente Principal?`
    );
    if (!confirmToggle) return;

    setLoading(true); // Use main loading for this operation
    setError(null); // Clear main error state here
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      setError('No authentication token found. Please log in.');
      setLoading(false);
      return;
    }

    const residentId = user.resident_id;
    if (!residentId) {
      setError("No se pudo encontrar el ID de residente para este usuario. Asegúrate de que el usuario esté asociado a un residente.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}residents/${residentId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ is_principal: !user.is_principal }) // Toggle the value
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = Object.values(errorData).flat().join(' ');
        throw new Error(errorMessage || 'Failed to update resident principal status');
      }

      fetchData(); // Refresh user list after successful update
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  const handleUpdateUser = async () => {
    setUpdateLoading(true);
    setUpdateError(null); // Clear update error before new attempt
    const accessToken = localStorage.getItem('access_token');

    try {
      // Filter out any non-string or empty values from selectedGroups
      const filteredGroups = selectedGroups.filter(group => typeof group === 'string' && group.trim() !== '');

      // Update user's groups
      const userUpdateResponse = await fetch(`${API_BASE_URL}users/${currentUser.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ groups: filteredGroups }) // Send filtered groups
      });

      if (!userUpdateResponse.ok) {
        const errorData = await userUpdateResponse.json();
        throw new Error(Object.values(errorData).flat().join(' ') || 'Failed to update user groups');
      }

      // Removed is_principal update from here

      setShowModal(false);
      fetchData(); // Refresh user list after successful update
    } catch (err) {
      setUpdateError(err.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" role="status" />
        <p>Cargando usuarios...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger" dismissible onClose={() => setError(null)}>Error: {error}</Alert> {/* Made dismissible */}
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-4 text-center">Gestión de Usuarios y Roles</h2>
      <Card>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Unidad Residencial</th> {/* New column */}
                <th>Principal</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.groups.join(', ')}</td>
                  <td>{user.unit_name || 'N/A'}</td> {/* Display unit_name */}
                  <td>{user.is_principal ? 'Sí' : 'No'}</td>
                  <td>
                    <Button variant="info" size="sm" onClick={() => handleEditClick(user)} className="me-2">
                      Editar Roles
                    </Button>
                    <Button
                      variant={user.is_principal ? "warning" : "success"}
                      size="sm"
                      onClick={() => handleTogglePrincipal(user)}
                    >
                      {user.is_principal ? "Quitar Principal" : "Hacer Principal"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Edit User Roles Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Roles para {currentUser?.username}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {updateError && <Alert variant="danger">{updateError}</Alert>}
          <Form>
            {groups.map(group => (
              <Form.Check
                key={group.id}
                type="checkbox"
                id={`group-${group.id}`}
                label={group.name}
                value={group.name}
                checked={selectedGroups.includes(group.name)}
                onChange={handleGroupChange}
              />
            ))}
            <hr />
            {/* Removed is_principal checkbox from here */}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleUpdateUser} disabled={updateLoading}>
            {updateLoading ? <Spinner animation="border" size="sm" /> : 'Guardar Cambios'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default UserManagement;
