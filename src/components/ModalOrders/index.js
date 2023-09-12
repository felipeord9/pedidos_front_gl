import { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import * as XLSX from 'xlsx'
import ViewOrders from '../TableOrders'
import { findOrders } from "../../services/orderService"

function ModalOrders({ showModal, setShowModal }) {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    findOrders()
      .then(({data}) => setOrders(data))
  }, [])

  const handleDownload = () => {
    const date = new Date()
    const workbook = XLSX.utils.book_new();
    //const newData = orders.map(value => flattenObject(value))
    const worksheet = XLSX.utils.json_to_sheet(orders)
    XLSX.utils.book_append_sheet(workbook, worksheet, `Pedidos-${date.toDateString('es-CO')}`);
    XLSX.writeFile(workbook, "Pedidos.xlsx");
    //navigate("/formulario");
  };

  return (
    <Modal show={showModal} fullscreen={true} style={{ fontSize: 11 }}>
      <Modal.Header>
        <Modal.Title className="text-primary">PEDIDOS</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0 pt-2">
        <div className="container h-100">
          <ViewOrders orders={orders} />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={(e) => setShowModal(false)}>
          Cerrar
        </Button>
        <Button variant="success" onClick={(e) => handleDownload()}>Descargar</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalOrders;
