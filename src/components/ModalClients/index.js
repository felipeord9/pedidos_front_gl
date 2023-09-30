import { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import Swal from 'sweetalert2'
import { createClientPOS, updateClientPOS } from "../../services/clientService"

export default function ModalClients({
  client,
  setClient,
  showModal,
  setShowModal,
  reloadInfo,
}) {
  const [info, setInfo] = useState({
    nit: "",
    razonSocial: "",
  });
  const [error, setError] = useState('')

  useEffect(() => {
    if(client) {
      setInfo({
        nit: client.nit,
        razonSocial: client.razonSocial,
      })
    }
  }, [client])

  const handleChange = (e) => {
    const { id, value } = e.target;
    setInfo({
      ...info,
      [id]: value.toUpperCase(),
    });
  };

  const handleCreateNewClient = (e) => {
    e.preventDefault();
    createClientPOS(info)
      .then((data) => {
        setShowModal(!showModal)
        reloadInfo();
        Swal.fire({
          title: '¡Correcto!',
          text: 'El cliente se ha creado correctamente',
          icon: 'success',
          showConfirmButton: false,
          timer: 2500
        })
        cleanForm()
      })
      .catch((error) => {
        setError(error.response.data.errors.original.detail)
        setTimeout(() => setError(''), 2500)
      });
  }

  const handleUpdateClient = (e) => {
    e.preventDefault();
    updateClientPOS(client.nit, info)
      .then((data) => {
        cleanForm()
        setShowModal(!showModal)
        reloadInfo();
        Swal.fire({
          title: '¡Correcto!',
          text: 'El cliente se ha actualizado correctamente',
          icon: 'success',
          showConfirmButton: false,
          timer: 2500
        })
      })
      .catch((error) => {
        setError(error.response.data.errors.original.detail)
        setTimeout(() => setError(''), 2500)
      });
  }

  const cleanForm = () => {
    setInfo({
      nit: "",
      razonSocial: ""
    })
    setClient(null)
  }

  return (
    <Modal show={showModal} style={{ fontSize: 11 }} centered>
      <Modal.Header>
        <Modal.Title className="text-danger">
          {client ? "Actualizar" : "Crear"} Cliente
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-2">
        <div className="container h-100">
          <form onSubmit={client ? handleUpdateClient : handleCreateNewClient}>
            <div>
              <div>
                <label className="fw-bold">Nit</label>
                <input
                  id="nit"
                  type="number"
                  value={info.nit}
                  className="form-control form-control-sm"
                  maxLength={10}
                  onChange={handleChange}
                  autoComplete="off"
                  disabled={client ? true : false}
                  required
                />
              </div>
              <div>
                <label className="fw-bold">Nombre</label>
                <input
                  id="razonSocial"
                  type="text"
                  value={info.razonSocial}
                  className="form-control form-control-sm"
                  onChange={handleChange}
                  autoComplete="off"
                  required
                />
              </div>
            </div>
            <div className="d-flex w-100 mt-2">
              <span
                className="text-center text-danger w-100 m-0"
                style={{ height: 15 }}
              >
                {error}
              </span>
            </div>
            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button type="submit" variant="success">
                {client ? "Guardar Cambios" : "Guardar"}
              </Button>
              <Button
                variant="secondary"
                onClick={(e) => {
                  setShowModal(false);
                  cleanForm();
                  setClient(null);
                }}
              >
                Cerrar
              </Button>
            </div>
          </form>
        </div>
      </Modal.Body>
      <Modal.Footer></Modal.Footer>
    </Modal>
  );
}