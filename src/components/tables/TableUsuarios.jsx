import React, { useEffect, useState, useRef } from 'react';
import { Form, FormLabel, Modal, ModalBody, ModalHeader, ModalTitle, Table, FormGroup, FormControl, Button, Card, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // Importar SweetAlert2
import Navbar from '../Navbar';
import '../css/TableUsuarios.css';
import {
  saveUsuario,
  getUsuarios,
  deleteUsuario,
  savePropietario,
} from '../../services/indexedDB';

const useWindowWidth = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return windowWidth;
};

export default function TableUsuarios() {
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 768;
  const [formData, setFormData] = useState({
    nombre: '',
    username: '',
    correo: '',
    rol: '',
    ci: '',
    password: '',
    numeroTarjetaRFID: '',
    propietarioId: ''
  });
  const [data, setData] = useState([]);
  const [propietarios, setPropietarios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedRegistro, setSelectedRegistro] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [validated, setValidated] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const URL = 'https://mi-backendsecond.onrender.com/usuarios';
  const hiddenInputRef = useRef(null); // Referencia al campo de número de tarjeta

  useEffect(() => {
    const role = localStorage.getItem('rol');
    if (role !== 'admin') {
      navigate('/');
    } else {
      fetchData();
      fetchPropietarios();
    }
  }, []);

  const handleVerRegistro = (registro) => {
    setSelectedRegistro(registro);
    setShowModal(true);
    setEditMode(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRegistro(null);
    setEditMode(false);
  };

  const handleShowDeleteModal = (registro) => {
    setSelectedRegistro(registro);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const handleEditRegistro = (registro) => {
    setSelectedRegistro(registro);
    setFormData({ ...registro });
    setShowModal(true);
    setEditMode(true);
  };

  const handleCreateRegistro = () => {
    setSelectedRegistro(null);
    setFormData({
      nombre: '',
      username: '',
      correo: '',
      rol: '',
      ci: '',
      password: '',
      numeroTarjetaRFID: '',
      propietarioId: ''
    });
    setShowModal(true);
    setEditMode(false);
  };

  const handleInputChange = (key, value) => {
    // Verifica si el campo es el número de tarjeta RFID y está vacío
    if (key === 'numeroTarjetaRFID' && value.trim() === '') {
      setFormData((prev) => ({ ...prev, [key]: null }));
    } else {
      setFormData((prev) => ({ ...prev, [key]: value }));
    }
  };const handleGuardarCreateRegistro = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
  
    if (formData.rol === 'conductor' && !formData.propietarioId) {
      Swal.fire({
        icon: 'error',
        title: 'Propietario requerido',
        text: 'Debe seleccionar un propietario para el conductor.',
      });
      return;
    }
  
    if (form.checkValidity()) {
      const nuevoUsuario = {
        ...formData,
        numeroTarjetaRFID: formData.numeroTarjetaRFID || undefined,
      };
  
      try {
        if (navigator.onLine) {
          const response = await fetch(URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(nuevoUsuario),
          });
  
          if (response.ok) {
            setShowModal(false);
            fetchData();
            Swal.fire({
              icon: 'success',
              title: 'Registro creado',
              text: 'El registro se ha creado exitosamente.',
            });
          } else {
            console.error('Error al guardar el registro.');
          }
        } else {
          await saveUsuario(nuevoUsuario);
          setShowModal(false);
          Swal.fire({
            icon: 'info',
            title: 'Modo offline',
            text: 'El registro se guardó localmente y se sincronizará cuando haya conexión.',
          });
        }
      } catch (error) {
        console.error('Error al guardar el registro:', error);
      }
    } else {
      setValidated(true);
    }
  };
  
  
  const handleSaveEditRegistro = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity()) {
      const usuarioActualizado = {
        ...formData,
        numeroTarjetaRFID: formData.numeroTarjetaRFID || undefined,
      };
  
      try {
        if (navigator.onLine) {
          const response = await fetch(`${URL}/${selectedRegistro.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(usuarioActualizado),
          });
          if (response.ok) {
            setShowModal(false);
            fetchData();
            Swal.fire({
              icon: 'success',
              title: 'Registro actualizado',
              text: 'El registro se ha actualizado exitosamente.',
            });
          } else {
            console.error('Error al actualizar el registro.');
          }
        } else {
          // Guardar cambios localmente en IndexedDB
          await saveUsuario(usuarioActualizado);
          setShowModal(false);
          Swal.fire({
            icon: 'info',
            title: 'Modo offline',
            text: 'Los cambios se guardaron localmente y se sincronizarán cuando haya conexión.',
          });
        }
      } catch (error) {
        console.error('Error al actualizar el registro:', error);
      }
    } else {
      setValidated(true);
    }
  };
  
  const handleEliminarRegistro = async () => {
    try {
      if (navigator.onLine) {
        const response = await fetch(`${URL}/${selectedRegistro.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          fetchData();
          setShowDeleteModal(false);
          Swal.fire({
            icon: 'success',
            title: 'Registro eliminado',
            text: 'El registro se ha eliminado exitosamente.',
          });
        } else {
          console.error('Error al eliminar el registro.');
        }
      } else {
        // Eliminar localmente en IndexedDB
        await deleteUsuario(selectedRegistro.id);
        setShowDeleteModal(false);
        Swal.fire({
          icon: 'info',
          title: 'Modo offline',
          text: 'El registro se eliminó localmente y se sincronizará cuando haya conexión.',
        });
      }
    } catch (error) {
      console.error('Error al eliminar el registro:', error);
    }
  };
  

  const handleVerificarTarjeta = async () => {
    if (formData.numeroTarjetaRFID === null) {
      Swal.fire({
        icon: 'warning',
        title: 'Número de tarjeta vacío',
        text: 'El número de tarjeta RFID no puede estar vacío.',
      });
      return;
    }
    try {
      const response = await fetch('https://mi-backendsecond.onrender.com/verificartarjeta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ numeroTarjetaRFID: formData.numeroTarjetaRFID }),
      });
      const result = await response.json();
      if (result.valida) {
        Swal.fire({
          icon: 'success',
          title: 'Tarjeta válida',
          text: 'El número de tarjeta RFID es válido.',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Tarjeta existente',
          text: 'El número de tarjeta RFID ya existe.',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error de verificación',
        text: 'Hubo un error al verificar el número de tarjeta RFID.',
      });
      console.error('Error en la verificación del RFID', error);
    }
  };

  const handleAgregarTarjeta = () => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.focus(); // Enfocar el campo de número de tarjeta
    }
  };
  const renderModalData = () => {
    if (selectedRegistro && !editMode) {
        return (
            <ModalBody>
                <Form>
                    {Object.entries(selectedRegistro).map(([key, value]) => (
                        key !== 'password' && (
                            <FormGroup key={key} className="mb-3" controlId={`formField_${key}`}>
                                <FormLabel>{key}</FormLabel>
                                <FormControl type="text" value={value} readOnly plaintext />
                            </FormGroup>
                        )
                    ))}
                </Form>
            </ModalBody>
        );
    } else {
        return (
            <ModalBody>
                <Form noValidate validated={validated} onSubmit={editMode ? handleSaveEditRegistro : handleGuardarCreateRegistro}>
                    {Object.keys(formData).map((key) => (
                        <FormGroup className="mb-3" controlId={`formField_${key}`} key={key}>
                            <FormLabel>{key.charAt(0).toUpperCase() + key.slice(1)}:</FormLabel>
                            {key === 'rol' ? (
                                <FormControl
                                    as="select"
                                    value={formData[key]}
                                    onChange={(e) => handleInputChange(key, e.target.value)}
                                    required
                                >
                                    <option value="">Seleccione un rol</option>
                                    <option value="admin">Admin</option>
                                    <option value="conductor">Conductor</option>
                                    <option value="propietario">Propietario</option>
                                </FormControl>
                            ) : key === 'numeroTarjetaRFID' ? (
                                <InputGroup className="position-relative">
                                    <FormControl
                                        ref={hiddenInputRef}
                                        type="text"
                                        value={formData[key] || ''}  // Asegurar que no muestre `null` en el campo
                                        onChange={(e) => handleInputChange(key, e.target.value)}
                                        placeholder="Ingrese número de tarjeta RFID"
                                        className="tiny-input"
                                    />
                                    <Button variant="info" onClick={handleAgregarTarjeta}>Agregar Tarjeta</Button>
                                    <Button variant="primary" onClick={handleVerificarTarjeta}>Verificar Tarjeta</Button>
                                </InputGroup>
                            ) : key === 'propietarioId' ? (
                                formData.rol === 'conductor' && (
                                    <FormControl
                                        as="select"
                                        value={formData[key]}
                                        onChange={(e) => handleInputChange(key, e.target.value)}
                                        required
                                    >
                                        <option value="">Seleccione un propietario</option>
                                        {propietarios.map((prop) => (
                                            <option key={prop.id} value={prop.id}>{prop.nombre}</option>
                                        ))}
                                    </FormControl>
                                )
                            ) : (
                                <FormControl
                                    type={key === 'password' ? 'password' : 'text'}
                                    value={formData[key]}
                                    onChange={(e) => handleInputChange(key, e.target.value)}
                                    required={key !== 'numeroTarjetaRFID' && key !== 'propietarioId'}
                                />
                            )}
                            {key !== 'numeroTarjetaRFID' && <FormControl.Feedback type="invalid">
                                Este campo es requerido.
                            </FormControl.Feedback>}
                        </FormGroup>
                    ))}
                    <Button variant="success" type="submit">{editMode ? 'Editar' : 'Registrar'}</Button>
                    <Button variant="danger" onClick={handleCloseModal}>Cancelar</Button>
                </Form>
            </ModalBody>
        );
    }
};

  const fetchData = async () => {
    try {
      if (navigator.onLine) {
        const response = await fetch(URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const jsonData = await response.json();
          setData(jsonData);
          // Guardar datos en IndexedDB
          await Promise.all(jsonData.map((usuario) => saveUsuario(usuario)));
        } else if (response.status === 401) {
          navigate('/');
        }
      } else {
        const cachedData = await getUsuarios(); // Obtener datos desde IndexedDB
        setData(cachedData);
      }
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    }
  };
  const fetchPropietarios = async () => {
    try {
      if (navigator.onLine) {
        const response = await fetch('https://mi-backendsecond.onrender.com/propietarios', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const jsonData = await response.json();
          setPropietarios(jsonData);
          // Guardar datos en IndexedDB
          await Promise.all(jsonData.map((propietario) => savePropietario(propietario)));
        } else {
          console.error('Error al obtener propietarios desde el servidor.');
        }
      } else {
        const cachedPropietarios = await getPropietarios(); // Obtener datos desde IndexedDB
        setPropietarios(cachedPropietarios);
      }
    } catch (error) {
      console.error('Error al obtener propietarios:', error);
    }
  };
      
  const renderHeaders = () => {
    return (
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Username</th>
          <th>Rol</th>
          {data.some(item => item.rol === 'conductor') && <th>PropietarioId</th>}
          <th>Ver registro</th>
          <th>Editar</th>
          <th>Eliminar</th>
        </tr>
      </thead>
    );
  };

  const renderRows = () => {
    return (
      <tbody>
        {data.map((item, index) => (
          <tr key={index}>
            <td data-label="Nombre">{item.nombre}</td>
            <td data-label="Username">{item.username}</td>
            <td data-label="Rol">{item.rol}</td>
            {item.rol === 'conductor' ? (
              <td data-label="PropietarioId">{item.propietarioId}</td>
            ) : (
              <td data-label="PropietarioId"></td>
            )}
            <td data-label="Ver registro">
              <button className="btn btn-success" onClick={() => handleVerRegistro(item)}>
                <i className="fa-solid fa-eye"></i>
              </button>
            </td>
            <td data-label="Editar">
              <button className="btn btn-warning" onClick={() => handleEditRegistro(item)}>
                <i className="fa-solid fa-pen-to-square"></i>
              </button>
            </td>
            <td data-label="Eliminar">
              <button className="btn btn-danger" onClick={() => handleShowDeleteModal(item)}>
                <i className="fa-sharp fa-solid fa-trash"></i>
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    );
  };

  const renderTable = () => (
    <Table responsive striped bordered hover variant="dark">
      {renderHeaders()}
      {renderRows()}
    </Table>
  );

  const renderCards = () => (
    <div>
      {data.map((item, index) => (
        <Card key={index} className="mb-3 card-custom">
          <Card.Body>
            {Object.entries(item).map(([key, value]) => (
              key !== 'id' && (
                <div key={key} className="d-flex justify-content-between">
                  <span><strong>{key}:</strong></span>
                  <span>{value}</span>
                </div>
              )
            ))}
            <div className="d-flex justify-content-around mt-3">
              <Button variant="success" onClick={() => handleVerRegistro(item)}>Ver</Button>
              <Button variant="warning" onClick={() => handleEditRegistro(item)}>Editar</Button>
              <Button variant="danger" onClick={() => handleShowDeleteModal(item)}>Eliminar</Button>
            </div>
          </Card.Body>
        </Card>
      ))}
    </div>
  );

  return (
    <>
      <div className="main-container">
        <Navbar />
        <div className="tabla-div">
          {isMobile ? renderCards() : renderTable()}
        </div>
        <div className="btn-crear-div">
          <button className="btn btn-success btn-crear" onClick={handleCreateRegistro}>
            CREAR REGISTRO
          </button>
        </div>
      </div>
      <Modal show={showModal} onHide={handleCloseModal}>
        <ModalHeader closeButton>
          <ModalTitle>
            {editMode ? 'Editar Registro' :
              selectedRegistro ? 'Detalles del registro' :
                'Crear registro'}
          </ModalTitle>
        </ModalHeader>
        {renderModalData()}
      </Modal>
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Seguro que desea eliminar el registro?</Modal.Title>
        </Modal.Header>
        <Modal.Body>El registro "{selectedRegistro && selectedRegistro.nombre}" será eliminado</Modal.Body>
        <Modal.Footer>
          <Button variant="warning" onClick={handleCloseDeleteModal}>
            Cerrar
          </Button>
          <Button variant="danger" onClick={handleEliminarRegistro}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
