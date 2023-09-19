import { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import * as XLSX from "xlsx";
import * as Fa from "react-icons/fa";
import TableOrders from "../TableOrders";
import { findOrders, findFilteredOrders } from "../../services/orderService";

function ModalOrders({ showModal, setShowModal }) {
  const [orders, setOrders] = useState([]);
  const [filterDate, setFilterDate] = useState({
    initialDate: null,
    finalDate: null,
  });

  useEffect(() => {
    getAllOrders()
  }, []);

  const getAllOrders = () => {
    findOrders().then(({ data }) => setOrders(data));
  }

  const getFilteredOrders = () => {
    findFilteredOrders(filterDate.initialDate, filterDate.finalDate).then(({ data }) =>
      setOrders(data)
    );
  };

  const handleChangeFilterDate = (e) => {
    const { id, value } = e.target;
    setFilterDate({
      ...filterDate,
      [id]: value,
    });
  };

  const handleDownload = () => {
    const date = new Date();
    const workbook = XLSX.utils.book_new();
    //const newData = orders.map(value => flattenObject(value))
    const worksheet = XLSX.utils.json_to_sheet(orders);
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      `Pedidos-${date.toDateString("es-CO")}`
    );
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
          <div className="d-flex flex-row justify-content-end gap-2 mb-2">
            {/* <input
              type="search"
              className="form-control form-control-sm"
              placeholder="Buscar pedido"
            /> */}
            <div class="btn-group">
              <button
                type="button"
                class="d-flex align-items-center btn btn-sm btn-primary"
                onClick={getFilteredOrders}
              >
                <Fa.FaFilter />
              </button>
              <button
                type="button"
                class="btn btn-sm btn-primary dropdown-toggle dropdown-toggle-split"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <span class="visually-hidden">Toggle Dropdown</span>
              </button>
              <ul class="dropdown-menu p-0 m-0">
                <li className="d-flex flex-row gap-2">
                  <input
                    id="initialDate"
                    type="date"
                    value={filterDate.initialDate}
                    className="form-control form-control-sm"
                    max={filterDate.finalDate}
                    onChange={handleChangeFilterDate}
                  />
                  -
                  <input
                    id="finalDate"
                    type="date"
                    value={filterDate.finalDate}
                    className="form-control form-control-sm"
                    min={filterDate.initialDate}
                    onChange={handleChangeFilterDate}
                  />
                </li>
                <li>
                  <button 
                    className="btn btn-sm btn-danger w-100"
                    onClick={getAllOrders}
                  >
                    Borrar filtro
                  </button>
                </li>
              </ul>
            </div>
          </div>
          {/* <section className="d-flex align-items-center gap-2 mb-2">
            <button className="btn btn-sm fw-bold h-100">
              <Fa.FaFilter />
            </button>
            <div className="d-flex align-items-center gap-2">
              <input type="date" className="form-control form-control-sm" />
            </div>
            -
            <div className="d-flex align-items-end gap-2">
              <input type="date" className="form-control form-control-sm" />
            </div>
          </section> */}
          <TableOrders orders={orders} />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={(e) => setShowModal(false)}>
          Cerrar
        </Button>
        <Button variant="success" onClick={(e) => handleDownload()}>
          Descargar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalOrders;
