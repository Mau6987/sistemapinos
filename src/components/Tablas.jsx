import React, { useEffect, useState } from 'react';
import { Form, FormLabel, Modal, ModalBody, ModalHeader, ModalTitle, Table, FormGroup, FormControl, ModalFooter, Button } from 'react-bootstrap';
import "./TablasStyle.css";
import { useNavigate } from 'react-router-dom';

export default function Tablas({ table }) {
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedRegistro, setSelectedRegistro] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [newRegistro, setNewRegistro] = useState({});
  const [validated, setValidated] = useState(false);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
//aaa
  useEffect(() => {
    fetchData();
  }, [table]);

  const fetchData = async () => {
    try {
      const response = await fetch(`https://mi-backendsecond.onrender.com/${table}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.status === 401) {
        navigate('/');
      }
      const jsonData = await response.json();
      setData(jsonData);
    } catch (error) {
      console.log(error);
    }
  };

  const isNumericField = (fieldName) => {
    return fieldName.endsWith("_num");
  };

  const renderHeaders = () => {
    if (data.length === 0) {
      return null;
    }
    const headers = Object.keys(data[0]);
    return (
      <thead>
        <tr>
          {headers.map((header) => (
            header !== 'id' && (
              <th key={header}>{header}</th>
            )
          ))}
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
        {data.map((item, index) => {
          return (
            <tr key={index}>
              {Object.entries(item).map(([key, value]) => (
                key !== 'id' && (
                  <td key={key}>{value}</td>
                )
              ))}
              <td>
                <button className="btn btn-success" onClick={() => handleVerRegistro(item)}>
                  <i className="fa-solid fa-eye"></i>
                </button>
              </td>
              <td>
                <button className="btn btn-warning" onClick={() => handleEditRegistro(item)}>
                  <i className="fa-solid fa-pen-to-square"></i>
                </button>
              </td>
              <td>
                <button className="btn btn-danger" onClick={() => handleEliminarRegistro(item)}>
                  <i className="fa-sharp fa-solid fa-trash"></i>
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    );
  };

  const handleVerRegistro = (registro) => {
    setSelectedRegistro(registro);
    setShowModal(true);
    setEditMode(false);
    setNewRegistro({});
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleEditRegistro = (registro) => {
    const editRegistro = { ...registro };
    Object.entries(editRegistro).forEach(([key, value]) => {
      if (isNumericField(key)) {
        editRegistro[key] = Number(value);
      }
    });

    setSelectedRegistro(editRegistro);
    setShowModal(true);
    setEditMode(true);
    setNewRegistro({});
  };

  const handleCreateRegistro = () => {
    const emptyRegistro = Object.keys(data[0]).reduce((obj, key) => {
      if (key !== 'id') {
        obj[key] = isNumericField(key) ? 0 : '';
      }
      return obj;
    }, {});
    setNewRegistro(emptyRegistro);
    setSelectedRegistro(null);
    setShowModal(true);
    setEditMode(false);
  };

  const handleCancelEdit = () => {
    setShowModal(false);
  };

  const handleInputChange = (key, value) => {
    if (editMode) {
      setSelectedRegistro((prevRegistro) => ({
        ...prevRegistro,
        [key]: isNumericField(key) ? parseFloat(value) : value,
      }));
    } else {
      setNewRegistro((prevRegistro) => ({
        ...prevRegistro,
        [key]: isNumericField(key) ? parseFloat(value) : value,
      }));
    }
  };

  const handleSaveRegistro = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity()) {
      try {
        const response = await fetch(`https://mi-backendsecond.onrender.com/${table}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(newRegistro),
        });

        if (response.status === 401) {
          navigate('/');
          return;
        }

        if (response.ok) {
          setShowModal(false);
          fetchData();
        } else {
          console.error('Error al guardar el registro');
        }
      } catch (error) {
        console.error('Error en la comunicación con el backend', error);
      }
    } else {
      setValidated(true);
    }
  };

  const handleSaveEditRegistro = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity()) {
      try {
        const response = await fetch(`https://mi-backendsecond.onrender.com/${table}/${selectedRegistro.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(selectedRegistro),
        });

        if (response.status === 401) {
          navigate('/');
          return;
        }

        if (response.ok) {
          setShowModal(false);
          fetchData();
        } else {
          console.error('Error al guardar los cambios del registro');
        }
      } catch (error) {
        console.error('Error en la comunicación con el backend', error);
      }
    } else {
      setValidated(true);
    }
  };

  const handleEliminarRegistro = async (registro) => {
    try {
      const response = await fetch(`https://mi-backendsecond.onrender.com/${table}/${registro.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.status === 401) {
        navigate('/');
        return;
      }

      if (response.ok) {
        fetchData();
      } else {
        console.error('Error al eliminar el registro');
      }
    } catch (error) {
      console.error('Error en la comunicación con el backend', error);
    }
  };

  const renderModalData = () => {
    if (selectedRegistro && !editMode) {
      return (
        <ModalBody>
          <Form>
            {Object.entries(selectedRegistro).map(([key, value]) => (
              <FormGroup key={key} className="mb-3" controlId={`formField_${key}`}>
                <FormLabel style={{ color: "red" }}>{key}</FormLabel>
                <FormControl type="text" value={value} readOnly plaintext />
              </FormGroup>
            ))}
          </Form>
        </ModalBody>
      );
    } else if (selectedRegistro && editMode) {
      return (
        <ModalBody>
          <Form noValidate validated={validated} onSubmit={handleSaveEditRegistro}>
            {Object.entries(selectedRegistro).map(([key, value]) => (
              key !== 'id' && (
                <FormGroup key={key} className="mb-3" controlId={`formField_${key}`}>
                  <FormLabel style={{ color: "red" }}>{key}</FormLabel>
                  <FormControl
                    type='text'
                    value={value}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    required
                  />
                  <FormControl.Feedback type="invalid">
                    Este campo es requerido.
                  </FormControl.Feedback>
                </FormGroup>
              )
            ))}
            <Button variant='success' type='submit'>Editar</Button>
            <Button onClick={handleCloseModal}>Cancelar</Button>
          </Form>
        </ModalBody>
      );
    } else if (!editMode) {
      return (
        <ModalBody>
          <Form noValidate validated={validated} onSubmit={handleSaveRegistro}>
            {Object.keys(newRegistro).map((key) => (
              <FormGroup key={key} className="mb-3" controlId={`formField_${key}`}>
                <FormLabel style={{ color: 'red' }}>{key}</FormLabel>
                <FormControl
                  type='text'
                  value={newRegistro[key]}
                  onChange={(e) => handleInputChange(key, e.target.value)}
                  required
                />
                <FormControl.Feedback type="invalid">
                  Este campo es requerido.
                </FormControl.Feedback>
              </FormGroup>
            ))}
            <Button variant="success" type="submit">Registrar</Button>
            <Button variant="danger" onClick={handleCloseModal}>Cancelar</Button>
          </Form>
        </ModalBody>
      );
    }
  };

  return (
    <>
      <div>
        <h1>.</h1>
        <div className='tabla-div'>
          <Table responsive className='tablas' striped bordered hover variant="dark">
            {renderHeaders()}
            {renderRows()}
          </Table>
        </div>
        
      </div>

      <Modal show={showModal} onHide={handleCloseModal}>
        <ModalHeader closeButton>
          <ModalTitle style={{ color: "red" }}>
            {editMode ? 'Editar Registro' :
              selectedRegistro ? 'Detalles del registro' :
                'Crear registro'}
          </ModalTitle>
        </ModalHeader>
        {renderModalData()}
      </Modal>
    </>
  );
}
