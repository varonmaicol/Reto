// Importaciones necesarias para la aplicación React
import React, { useState, useEffect } from 'react'; // React y hooks para estado y efectos
import { Container, Row, Col, Form, Button, Table, Modal, Alert } from 'react-bootstrap'; // Componentes de React Bootstrap
import axios from 'axios'; // Cliente HTTP para peticiones API
import 'bootstrap/dist/css/bootstrap.min.css'; // Estilos de Bootstrap

// URL base de la API del backend
const API_BASE = 'http://localhost:3001/api/contacts';

// Componente principal de la aplicación
function App() {
  // Estados para manejar los datos de la aplicación
  const [contacts, setContacts] = useState([]); // Lista de contactos
  const [search, setSearch] = useState({ city: '', name: '', email: '', phone: '' }); // Filtros de búsqueda
  const [showModal, setShowModal] = useState(false); // Controla la visibilidad del modal
  const [editingContact, setEditingContact] = useState(null); // Contacto en edición (null para crear)
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', city: '' }); // Datos del formulario
  const [error, setError] = useState(''); // Mensaje de error
  const [success, setSuccess] = useState(''); // Mensaje de éxito
  const [loading, setLoading] = useState(false); // Estado de carga

  // Efecto para cargar contactos al montar el componente
  useEffect(() => {
    fetchContacts(); // Llama a la función para obtener contactos
  }, []);

  // Función para obtener contactos desde la API
  const fetchContacts = async (query = {}) => {
    setLoading(true); // Activa el estado de carga
    console.log('Fetching with query:', query); // Log para debugging
    try {
      const params = new URLSearchParams(query).toString(); // Convierte query a string de parámetros
      console.log('API URL:', `${API_BASE}?${params}`); // Log de la URL
      const response = await axios.get(`${API_BASE}?${params}`); // Petición GET
      console.log('API response length:', response.data.length); // Log del número de resultados
      let data = Array.isArray(response.data) ? response.data : []; // Asegura que sea array
      // Filtro adicional en el cliente por todos los campos (como respaldo)
      data = data.filter((contact) => {
        const nameMatch = !query.name || contact.name.toLowerCase().includes(query.name.toLowerCase().trim());
        const emailMatch = !query.email || contact.email.toLowerCase().includes(query.email.toLowerCase().trim());
        const phoneMatch = !query.phone || contact.phone.includes(query.phone.trim());
        const cityMatch = !query.city || contact.city.toLowerCase().includes(query.city.toLowerCase().trim());
        return nameMatch && emailMatch && phoneMatch && cityMatch; // Debe coincidir en todos
      });
      console.log('Filtered data length:', data.length); // Log de resultados filtrados
      setContacts(data); // Actualiza el estado de contactos
      setError(''); // Limpia errores
    } catch (err) {
      console.error('API error:', err); // Log del error
      setError('Error al obtener contactos. Mostrando datos en caché filtrados.');
      // Intenta obtener de la caché
      try {
        const cacheResponse = await axios.get(`${API_BASE}/cache`); // Petición a la caché
        let cacheData = Array.isArray(cacheResponse.data) ? cacheResponse.data : [];
        // Filtro adicional en la caché
        cacheData = cacheData.filter((contact) => {
          const nameMatch = !query.name || contact.name.toLowerCase().includes(query.name.toLowerCase().trim());
          const emailMatch = !query.email || contact.email.toLowerCase().includes(query.email.toLowerCase().trim());
          const phoneMatch = !query.phone || contact.phone.includes(query.phone.trim());
          const cityMatch = !query.city || contact.city.toLowerCase().includes(query.city.toLowerCase().trim());
          return nameMatch && emailMatch && phoneMatch && cityMatch;
        });
        console.log('Cache filtered length:', cacheData.length); // Log de caché filtrada
        setContacts(cacheData); // Actualiza con datos de caché
      } catch (cacheErr) {
        console.error('Cache error:', cacheErr); // Log de error de caché
        setContacts([]); // Sin datos
      }
    } finally {
      setLoading(false); // Desactiva carga
    }
  };

  // Función para manejar la búsqueda
  const handleSearch = () => {
    fetchContacts(search); // Llama a fetch con los filtros actuales
  };

  // Función para abrir modal de creación
  const handleCreate = () => {
    setEditingContact(null); // No hay contacto en edición
    setContactForm({ name: '', email: '', phone: '', city: '' }); // Limpia formulario
    setShowModal(true); // Muestra modal
  };

  // Función para abrir modal de edición
  const handleEdit = (contact) => {
    setEditingContact(contact); // Establece contacto en edición
    setContactForm({ name: contact.name, email: contact.email, phone: contact.phone, city: contact.city }); // Carga datos
    setShowModal(true); // Muestra modal
  };

  // Función para eliminar un contacto
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este contacto?')) { // Confirmación
      try {
        await axios.delete(`${API_BASE}/${id}`); // Petición DELETE
        setSuccess('Contacto eliminado exitosamente'); // Mensaje de éxito
        fetchContacts(search); // Recarga contactos
      } catch (err) {
        setError('Error eliminando contacto'); // Mensaje de error
      }
    }
  };

  // Función para guardar (crear o actualizar) un contacto
  const handleSave = async () => {
    try {
      if (editingContact) { // Si hay contacto en edición
        await axios.put(`${API_BASE}/${editingContact.id}`, contactForm); // Actualiza
        setSuccess('Contacto actualizado exitosamente');
      } else { // Si no, crea nuevo
        await axios.post(API_BASE, contactForm); // Crea
        setSuccess('Contacto creado exitosamente');
      }
      setShowModal(false); // Cierra modal
      fetchContacts(search); // Recarga contactos
    } catch (err) {
      setError('Error guardando contacto'); // Mensaje de error
    }
  };

  // Renderizado del componente
  return (
    <Container fluid className="py-4 container-custom"> {/* Contenedor principal con estilos personalizados */}
      <Row className="justify-content-center">
        <Col md={10}>
          <h1 className="text-center mb-4 title-custom">Gestor de Contactos</h1> {/* Título de la aplicación */}
          {error && <Alert variant="danger" className="alert-custom">{error}</Alert>} {/* Alerta de error si existe */}
          {success && <Alert variant="success" className="alert-custom">{success}</Alert>} {/* Alerta de éxito si existe */}
          
          <Form className="mb-4 form-custom" noValidate> {/* Formulario de búsqueda */}
            <Row>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Nombre</Form.Label> {/* Campo de búsqueda por nombre */}
                  <Form.Control type="text" value={search.name} onChange={(e) => setSearch({...search, name: e.target.value})} />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Correo</Form.Label> {/* Campo de búsqueda por email */}
                  <Form.Control type="email" value={search.email} onChange={(e) => setSearch({...search, email: e.target.value})} />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Teléfono</Form.Label> {/* Campo de búsqueda por teléfono */}
                  <Form.Control type="text" value={search.phone} onChange={(e) => setSearch({...search, phone: e.target.value})} />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Ciudad</Form.Label> {/* Campo de búsqueda por ciudad */}
                  <Form.Control type="text" value={search.city} onChange={(e) => setSearch({...search, city: e.target.value})} />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex gap-2 mt-3 justify-content-center"> {/* Botones de acción centrados */}
              <Button className="btn-custom-primary px-4" onClick={handleSearch}>🔍 Buscar</Button> {/* Botón de búsqueda */}
              <Button className="btn-custom-success px-4" onClick={handleCreate}>➕ Nuevo</Button> {/* Botón para crear nuevo contacto */}
            </div>
          </Form>

          {loading ? ( // Si está cargando, muestra mensaje
            <div className="text-center py-4">
              <span>Cargando contactos...</span>
            </div>
          ) : ( // Si no, muestra la tabla
            <Table striped bordered hover responsive className="table-custom"> {/* Tabla de contactos */}
              <thead>
                <tr>
                  <th>ID</th> {/* Columna ID */}
                  <th>Nombre</th> {/* Columna Nombre */}
                  <th>Correo</th> {/* Columna Email */}
                  <th>Teléfono</th> {/* Columna Teléfono */}
                  <th>Ciudad</th> {/* Columna Ciudad */}
                  <th>Acciones</th> {/* Columna Acciones */}
                </tr>
              </thead>
              <tbody>
                {contacts.map(contact => ( // Mapea cada contacto a una fila
                  <tr key={contact.id}> {/* Fila por contacto */}
                    <td>{contact.id}</td> {/* ID del contacto */}
                    <td>{contact.name}</td> {/* Nombre */}
                    <td>{contact.email}</td> {/* Email */}
                    <td>{contact.phone}</td> {/* Teléfono */}
                    <td>{contact.city}</td> {/* Ciudad */}
                    <td>
                      <div className="d-flex gap-1"> {/* Contenedor para botones de acciones */}
                        <Button className="btn-custom-warning px-3" size="sm" onClick={() => handleEdit(contact)}>✏️</Button> {/* Botón editar */}
                        <Button className="btn-custom-danger px-3" size="sm" onClick={() => handleDelete(contact.id)}>🗑️</Button> {/* Botón eliminar */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} className="modal-custom"> {/* Modal para crear/editar */}
        <Modal.Header closeButton>
          <Modal.Title>{editingContact ? 'Editar Contacto' : 'Crear Contacto'}</Modal.Title> {/* Título dinámico */}
        </Modal.Header>
        <Modal.Body>
          <Form> {/* Formulario del modal */}
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label> {/* Campo nombre */}
              <Form.Control type="text" value={contactForm.name} onChange={(e) => setContactForm({...contactForm, name: e.target.value})} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Correo</Form.Label> {/* Campo email */}
              <Form.Control type="email" value={contactForm.email} onChange={(e) => setContactForm({...contactForm, email: e.target.value})} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Teléfono</Form.Label> {/* Campo teléfono */}
              <Form.Control type="text" value={contactForm.phone} onChange={(e) => setContactForm({...contactForm, phone: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Ciudad</Form.Label> {/* Campo ciudad */}
              <Form.Control type="text" value={contactForm.city} onChange={(e) => setContactForm({...contactForm, city: e.target.value})} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <div className="d-flex gap-2 w-100 justify-content-end"> {/* Botones del footer alineados a la derecha */}
            <Button className="btn-custom-secondary px-4" onClick={() => setShowModal(false)}>Cancelar</Button> {/* Botón cancelar */}
            <Button className="btn-custom-primary px-4" onClick={handleSave}>Guardar</Button> {/* Botón guardar */}
          </div>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default App; // Exporta el componente App como default