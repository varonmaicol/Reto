import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table, Modal, Alert } from 'react-bootstrap';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_BASE = 'http://localhost:3001/api/contacts';

function App() {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState({ city: '', name: '', email: '', phone: '' });
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', city: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async (query = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(query).toString();
      const response = await axios.get(`${API_BASE}?${params}`);
      setContacts(Array.isArray(response.data) ? response.data : []);
      setError('');
    } catch (err) {
      setError('Error al obtener contactos. Mostrando datos en caché si están disponibles.');
      // Try to get from cache
      try {
        const cacheResponse = await axios.get(`${API_BASE}/cache`);
        setContacts(Array.isArray(cacheResponse.data) ? cacheResponse.data : []);
      } catch (cacheErr) {
        setContacts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchContacts(search);
  };

  const handleCreate = () => {
    setEditingContact(null);
    setContactForm({ name: '', email: '', phone: '', city: '' });
    setShowModal(true);
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setContactForm({ name: contact.name, email: contact.email, phone: contact.phone, city: contact.city });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este contacto?')) {
      try {
        await axios.delete(`${API_BASE}/${id}`);
        setSuccess('Contacto eliminado exitosamente');
        fetchContacts(search);
      } catch (err) {
        setError('Error eliminando contacto');
      }
    }
  };

  const handleSave = async () => {
    try {
      if (editingContact) {
        await axios.put(`${API_BASE}/${editingContact.id}`, contactForm);
        setSuccess('Contacto actualizado exitosamente');
      } else {
        await axios.post(API_BASE, contactForm);
        setSuccess('Contacto creado exitosamente');
      }
      setShowModal(false);
      fetchContacts(search);
    } catch (err) {
      setError('Error guardando contacto');
    }
  };

  return (
    <Container fluid className="py-4 container-custom" style={{ backgroundColor: 'transparent' }}>
      <Row className="justify-content-center">
        <Col md={10}>
          <h1 className="text-center mb-4" style={{ color: '#645e5e' }}>Gestor de Contactos</h1>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <Form onSubmit={handleSearch} className="mb-4 p-3 bg-white rounded shadow">
            <Row>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control type="text" value={search.name} onChange={(e) => setSearch({...search, name: e.target.value})} />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Correo</Form.Label>
                  <Form.Control type="email" value={search.email} onChange={(e) => setSearch({...search, email: e.target.value})} />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control type="text" value={search.phone} onChange={(e) => setSearch({...search, phone: e.target.value})} />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Ciudad</Form.Label>
                  <Form.Control type="text" value={search.city} onChange={(e) => setSearch({...search, city: e.target.value})} />
                </Form.Group>
              </Col>
            </Row>
            <Button type="submit" className="mt-3" style={{ backgroundColor: '#28a745', borderColor: '#28a745' }}>Buscar</Button>
            <Button variant="primary" className="mt-3 ms-2" onClick={handleCreate}>Crear Contacto</Button>
          </Form>

          {loading ? (
            <div className="text-center py-4">
              <span>Cargando contactos...</span>
            </div>
          ) : (
            <Table striped bordered hover responsive className="bg-white shadow table-custom">
              <thead style={{ backgroundColor: 'rgb(133, 45, 45)', color: 'rgb(255, 0, 0)' }}>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Teléfono</th>
                  <th>Ciudad</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map(contact => (
                  <tr key={contact.id}>
                    <td>{contact.id}</td>
                    <td>{contact.name}</td>
                    <td>{contact.email}</td>
                    <td>{contact.phone}</td>
                    <td>{contact.city}</td>
                    <td>
                      <Button variant="warning" size="sm" onClick={() => handleEdit(contact)}>Editar</Button>
                      <Button variant="danger" size="sm" className="ms-2" onClick={() => handleDelete(contact.id)}>Eliminar</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton style={{ backgroundColor: '#5a80a8', color: 'white' }}>
          <Modal.Title>{editingContact ? 'Editar Contacto' : 'Crear Contacto'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control type="text" value={contactForm.name} onChange={(e) => setContactForm({...contactForm, name: e.target.value})} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Correo</Form.Label>
              <Form.Control type="email" value={contactForm.email} onChange={(e) => setContactForm({...contactForm, email: e.target.value})} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control type="text" value={contactForm.phone} onChange={(e) => setContactForm({...contactForm, phone: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Ciudad</Form.Label>
              <Form.Control type="text" value={contactForm.city} onChange={(e) => setContactForm({...contactForm, city: e.target.value})} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave}>Guardar</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default App;