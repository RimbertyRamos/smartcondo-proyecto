import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  const API_BASE_URL = 'http://127.0.0.1:8000/api/';

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    console.log('showModal state changed to:', showModal);
  }, [showModal]);

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
      const usersResponse = await fetch(`${API_BASE_URL}users/`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (!usersResponse.ok) throw new Error(`HTTP error! status: ${usersResponse.status} fetching users`);
      const usersData = await usersResponse.json();
      setUsers(usersData.results || usersData);

      const groupsResponse = await fetch(`${API_BASE_URL}groups/`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (!groupsResponse.ok) throw new Error(`HTTP error! status: ${groupsResponse.status} fetching groups`);
      const groupsData = await groupsResponse.json();
      setGroups(groupsData.results || groupsData);

    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
      toast.error(`Error al cargar datos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user) => {
    console.log('handleEditClick called with user:', user);
    setCurrentUser(user);
    setSelectedGroups(Array.isArray(user.groups) ? user.groups.filter(g => typeof g === 'string') : []);
    setUpdateError(null);
    setShowModal(true);
    console.log('showModal set to true');
  };

  const handleGroupChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedGroups([...selectedGroups, value]);
    } else {
      setSelectedGroups(selectedGroups.filter(group => group !== value));
    }
  };

  const handleTogglePrincipal = async (user) => {
    const confirmToggle = window.confirm(
      `¿Estás seguro de que quieres ${user.is_principal ? 'quitar' : 'establecer'} a ${user.username} como Residente Principal?`
    );
    if (!confirmToggle) return;

    setLoading(true);
    setError(null);
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      setError('No authentication token found. Please log in.');
      setLoading(false);
      toast.error('No se encontró token de autenticación. Por favor, inicia sesión.');
      return;
    }

    const residentId = user.resident_id;
    if (!residentId) {
      setError("No se pudo encontrar el ID de residente para este usuario. Asegúrate de que el usuario esté asociado a un residente.");
      setLoading(false);
      toast.error("Error: Usuario no asociado a un residente.");
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
        toast.error(`Error al actualizar estado principal: ${errorMessage}`);
        throw new Error(errorMessage || 'Failed to update resident principal status');
      }

      toast.success(`Estado principal de ${user.username} actualizado exitosamente.`);
      fetchData();
    } catch (err) {
      setError(err.message); // Set main error state
      setLoading(false); // Ensure loading is set to false on error
    } finally {
      // setLoading(false); // Removed from here, now in catch and try
    }
  };


  const handleUpdateUser = async () => {
    setUpdateLoading(true);
    setUpdateError(null);
    const accessToken = localStorage.getItem('access_token');

    try {
      const filteredGroups = selectedGroups.filter(group => typeof group === 'string' && group.trim() !== '');

      const userUpdateResponse = await fetch(`${API_BASE_URL}users/${currentUser.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ groups: filteredGroups })
      });

      if (!userUpdateResponse.ok) {
        const errorData = await userUpdateResponse.json();
        throw new Error(Object.values(errorData).flat().join(' ') || 'Failed to update user groups');
      }

      setShowModal(false);
      setUpdateError(null);
      toast.success(`Roles de ${currentUser.username} actualizados exitosamente.`);
      fetchData();
    } catch (err) {
      setUpdateError(err.message);
      toast.error(`Error al actualizar roles: ${err.message}`);
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
        <Alert variant="danger" dismissible onClose={() => setError(null)}>Error: {error}</Alert>
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
                <th>Unidad Residencial</th>
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
                  <td>{user.unit_name || 'N/A'}</td>
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
      {showModal && (
        <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000}}>
          <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '20px', borderRadius: '5px', width: '80%', maxWidth: '600px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
              <h5>Editar Roles para {currentUser?.username}</h5>
              <button 
                onClick={() => setShowModal(false)} 
                style={{background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer'}}
              >
                &times;
              </button>
            </div>
            
            <div style={{marginBottom: '15px'}}>
              <strong>Usuario:</strong> {currentUser?.username}
            </div>
            
            <div style={{marginBottom: '15px'}}>
              <strong>Nombre completo:</strong> {currentUser?.full_name || 'N/A'}
            </div>
            
            <div style={{marginBottom: '15px'}}>
              <strong>Email:</strong> {currentUser?.email || 'N/A'}
            </div>
            
            <hr />
            
            <div style={{marginBottom: '15px'}}>
              <strong>Roles disponibles:</strong>
              {updateError && (
                <Alert variant="danger" style={{marginTop: '10px'}}>
                  {updateError}
                </Alert>
              )}
              {groups && groups.length > 0 ? (
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px'}}>
                  {groups.map(group => (
                    <label key={group.id} style={{display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', backgroundColor: '#e9ecef', borderRadius: '15px'}}>
                      <input
                        type="checkbox"
                        value={group.name}
                        checked={selectedGroups.includes(group.name)}
                        onChange={handleGroupChange}
                      />
                      <span>{group.name}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p style={{color: '#6c757d'}}>No se encontraron grupos disponibles</p>
              )}
            </div>
            
            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'}}>
              <Button 
                variant="secondary" 
                onClick={() => setShowModal(false)}
                disabled={updateLoading}
              >
                Cancelar
              </Button>
              <Button 
                variant="primary" 
                onClick={handleUpdateUser}
                disabled={updateLoading}
              >
                {updateLoading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />
                    <span style={{marginLeft: '5px'}}>Actualizando...</span>
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}

export default UserManagement;