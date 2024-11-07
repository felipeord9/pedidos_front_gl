import { useState, useEffect, useContext } from "react";
import DataTable from "react-data-table-component";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import * as FaIcons from "react-icons/fa";
import { Modal } from "react-bootstrap";
import DocRequestPDF from "../DocRequestPDF";
import * as FiIcons from 'react-icons/fi';
import ModalSingleRequest from "../ModalSingleRequest";
import AuthContext from "../../context/authContext";
import "./styles.css";

function TableSolicitudes({ requests , loading , selectedRequest , setSelectedRequest ,selected , setSelected , getAllRequests }) {
  const { user } = useContext(AuthContext);
  const [isMobile, setIsMobile] = useState(null);
  const columns = [
    {
      id: "ver",
      name: "ver",
      center: true,
      sortable: true,
      cell: (row, index, column, id) =>
        isMobile ? (
          <div className="d-flex gap-2 p-1">
            <PDFDownloadLink
              document={<DocRequestPDF request={row} />}
              fileName={`${row?.nitClient}-PDV-${row?.nameClient}.pdf`}
              onClick={(e) => {
                e.download();
              }}
            >
              <FaIcons.FaDownload />
            </PDFDownloadLink>
          </div>
        ) : (
          <div className="d-flex gap-2 p-1">
            <button
              title="Ver PDF de Solicitud"
              className="btn btn-sm btn-primary"
              onClick={(e) => {
                setSelectedRequest(row);
              }}
            >
              <FaIcons.FaEye />
            </button>
          </div>
        ),
      width: "50px",
    },
    {
      id: "editar",
      center: true,
      sortable: true,
      cell: (row, index, column, id) => (
        <div className='d-flex gap-2 p-1'>
          <button title="Editar Solicitud" className='btn btn-sm btn-link' onClick={(e) => {
            setSelected(row)
            setShowModalSingleRequest(true)
          }}>
            <FiIcons.FiEdit />
          </button>
        </div>
      ),
      width: '70px'
    },
    {
      id: "install",
      name: "Instalación",
      selector: (row) => row.install,
      sortable: true,
      width: "270px",
    },
    {
      id: "nit_client",
      name: "NIT",
      selector: (row) => row.nitClient,
      sortable: true,
      width: "125px",
    },
    {
      id: "name_client",
      name: "Razón Social Cliente",
      selector: (row) => row.nameClient,
      sortable: true,
      width: "320px",
    },
    {
      id: "branch_client",
      name: "Sucursal Cliente",
      selector: (row) => row.branchClient,
      sortable: true,
      width: "320px",
    },
    {
      id: "destination",
      name: "Enviado a",
      selector: (row) => row.destination,
      sortable: true,
      width: "250px",
    },
    /* {
      id: "total",
      name: "Total",
      selector: (row) => `$ ${Number(row.total).toLocaleString()}`,
      sortable: true,
      width: "120px",
    }, */
    {
      id: "created_at",
      name: "Fecha Creación",
      selector: (row) => new Date(row.createdAt).toLocaleString("es-CO"),
      sortable: true,
      width: "200px",
    },
    {
      id: "created_by",
      name: "Enviado por",
      selector: (row) => row.emisor,
      sortable: true,
      width: "250px",
    },
    {
      id: "observations",
      name: "Observaciones",
      selector: (row) => row.observations,
      sortable: true,
      width: "auto",
    },
  ];

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 600px)");
    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener("change", () =>
      setIsMobile(mediaQuery.matches)
    );
    return () =>
      mediaQuery.removeEventListener("change", () =>
        setIsMobile(mediaQuery.matches)
      );
  }, []);

  const [showModalSingleRequest, setShowModalSingleRequest] = useState(false)

  return (
    <div
      className="d-flex flex-column rounded m-0 p-0"
      style={{ height: "calc(100% - 60px)", width: "100%" }}
    >
      <ModalSingleRequest 
        request={selected}
        setRequest={setSelected}
        showModal={showModalSingleRequest} 
        setShowModal={setShowModalSingleRequest} 
        reloadInfo={getAllRequests} 
      />
      <DataTable
        className="bg-light text-center border border-2 h-100 p-0 m-0"
        columns={columns}
        data={requests}
        fixedHeaderScrollHeight={200}
        progressPending={loading}
        progressComponent={
          <div class="d-flex align-items-center text-danger gap-2 mt-2">
            <strong>Cargando...</strong>
            <div
              class="spinner-border spinner-border-sm ms-auto"
              role="status"
              aria-hidden="true"
            ></div>
          </div>
        }
        dense
        striped
        fixedHeader
        pagination
        paginationComponentOptions={{
          rowsPerPageText: "Filas por página:",
          rangeSeparatorText: "de",
          selectAllRowsItem: false,
        }}
        paginationPerPage={50}
        paginationRowsPerPageOptions={[15, 25, 50, 100]}
        noDataComponent={
          <div style={{ padding: 24 }}>Ningún resultado encontrado.</div>
        }
      />
      <Modal
        size="lg"
        show={Boolean(selectedRequest && !isMobile)}
        onHide={() => setSelectedRequest(null)}
      >
        <PDFViewer
          className="rounded"
          style={{
            width: "100%",
            height: "90vh",
          }}
          showToolbar={true}
        >
          <DocRequestPDF request={selectedRequest} />
        </PDFViewer>
      </Modal>
    </div>
  );
}

export default TableSolicitudes;
