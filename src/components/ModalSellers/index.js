import { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import Swal from 'sweetalert2'
import { createSellerPOS, updateSellerPOS } from "../../services/sellerService"

export default function ModalClients({
  seller,
  setSeller,
  showModal,
  setShowModal,
  reloadInfo,
}) {
  const [info, setInfo] = useState({
    id: "",
    description: "",
    mailCommercial: "",
  });
  const [error, setError] = useState('')

  useEffect(() => {
    if(seller) {
      setInfo({
        id: seller.id,
        description: seller.description,
        mailCommercial: seller.mailCommercial,
      })
    }
  }, [seller])

  const handleChange = (e) => {
    const { id, value } = e.target;
    setInfo({
      ...info,
      [id]: value,
    });
  };

  const handleCreateNewSeller = (e) => {
    e.preventDefault();
    createSellerPOS(info)
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
        setError(error?.response?.data?.errors?.original?.detail)
        setTimeout(() => setError(''), 2500)
      });
  }

  const handleUpdateSeller = (e) => {
    e.preventDefault();
    updateSellerPOS(seller.id, info)
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
      id: "",
      description: "",
      mailCommercial: ""
    })
    setSeller(null)
  }

  return (
    <Modal show={showModal} style={{ fontSize: 11 }} centered>
      <Modal.Header>
        <Modal.Title className="text-danger">
          {seller ? "Actualizar" : "Crear"} Vendedor
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-2">
        <div className="container h-100">
          <form onSubmit={seller ? handleUpdateSeller : handleCreateNewSeller}>
            <div>
              <div>
                <label className="fw-bold">Identificador</label>
                <input
                  id="id"
                  type="number"
                  value={info.id}
                  className="form-control form-control-sm"
                  maxLength={10}
                  onChange={handleChange}
                  autoComplete="off"
                  disabled={seller ? true : false}
                  required
                />
              </div>
              <div>
                <label className="fw-bold">Nombre</label>
                <input
                  id="description"
                  type="text"
                  value={info.description}
                  className="form-control form-control-sm"
                  onChange={handleChange}
                  autoComplete="off"
                  required
                />
              </div>
              <div>
                <label className="fw-bold">Correo</label>
                <input
                  id="mailCommercial"
                  type="email"
                  value={info.mailCommercial}
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
                {seller ? "Guardar Cambios" : "Guardar"}
              </Button>
              <Button
                variant="secondary"
                onClick={(e) => {
                  setShowModal(false);
                  cleanForm();
                  setSeller(null);
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