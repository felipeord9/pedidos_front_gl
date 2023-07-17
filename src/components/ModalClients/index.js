import { Modal, Button } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
import DataTable from "react-data-table-component";

function ModalClients({ data, showModal, setShowModal }) {
  const columnsTable = [
    {
      name: "Id",
      selector: (row) => row.id,
      width: "100px",
      sortable: true,
    },
    {
      name: "Nombre",
      selector: (row) => row.description,
      sortable: true,
    },
  ];

  return (
    <Modal show={showModal} fullscreen={true} style={{ fontSize: 11 }}>
      <Modal.Header>
        <Modal.Title className="text-primary">CLIENTES</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0 pt-2">
        <div className="container">
          <div style={{ height: 450 }}>
            <DataTable
              className="border border-2 h-100"
              columns={columnsTable}
              data={data}
              pagination
              striped
              fixedHeader
              fixedHeaderScrollHeight={300}
              paginationComponentOptions={{
                rowsPerPageText: "Filas por página",
                rangeSeparatorText: "de",
                selectAllRowsItem: false
              }}
            />
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={(e) => setShowModal(false)}>
          Cerrar
        </Button>
        <Button variant="primary">Guardar</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalClients;
