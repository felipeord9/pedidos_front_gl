import { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import * as FaIcons from "react-icons/fa";
import { Modal } from "react-bootstrap";
import DocOrderPDF from "../DocOrderPDF";

function TableOrders({ orders, loading }) {
  const [isMobile, setIsMobile] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const columns = [
    {
      id: "no",
      name: "No.",
      selector: (row) => row.id,
      sortable: true,
      width: "60px",
    },
    {
      id: "options",
      name: "",
      center: true,
      cell: (row, index, column, id) =>
        isMobile ? (
          <div className="d-flex gap-2 p-1">
            <PDFDownloadLink
              document={<DocOrderPDF order={row} />}
              fileName={`${row?.coId}-PDV-${row?.rowId}.pdf`}
            >
              {({ blob, url, loading, error }) =>
                !loading && (
                  <FaIcons.FaDownload />
                )
              }
            </PDFDownloadLink>
          </div>
        ) : (
          <div className="d-flex gap-2 p-1">
            <button
              title="Ver PDF de pedido"
              className="btn btn-sm btn-primary"
              onClick={(e) => {
                setSelectedOrder(row);
              }}
            >
              <FaIcons.FaEye />
            </button>
          </div>
        ),
      width: "50px",
    },
    {
      id: "row_co_id",
      name: "No. Pedido",
      selector: (row) => `${row.coId}-PDV-${row.rowId}`,
      width: "125px",
    },
    {
      id: "co_id",
      name: "Id. C.O",
      selector: (row) => row.coId,
      sortable: true,
      width: "83px",
    },
    {
      id: "co_description",
      name: "Desc. C.O",
      selector: (row) => row.coDescription,
      sortable: true,
      width: "200px",
    },
    {
      id: "client_id",
      name: "Id. Cliente",
      selector: (row) => row.clientId,
      sortable: true,
      width: "125px",
    },
    {
      id: "client_description",
      name: "Razón Social Cliente",
      selector: (row) => row.clientDescription,
      sortable: true,
      width: "157px",
    },
    {
      id: "branch_id",
      name: "Id. Sucursal",
      selector: (row) => row.branchId,
      sortable: true,
      width: "110px",
    },
    {
      id: "branch_description",
      name: "Desc. Sucursal",
      selector: (row) => row.branchDescription,
      sortable: true,
      width: "200px",
    },
    {
      id: "seller_id",
      name: "Id. Vendedor",
      selector: (row) => row.sellerId,
      sortable: true,
      width: "117px",
    },
    {
      id: "seller_description",
      name: "Desc. Vendedor",
      selector: (row) => row.sellerDescription,
      sortable: true,
      width: "200px",
    },
    {
      id: "created_at",
      name: "Fecha Creación",
      selector: (row) => new Date(row.createdAt).toLocaleString("es-CO"),
      sortable: true,
      width: "180px",
    },
    {
      id: "total",
      name: "Total",
      selector: (row) => formater(row.total),
      sortable: true,
      width: "175px",
    },
    {
      id: "created_by",
      name: "Creado por",
      selector: (row) => row?.user?.name,
      sortable: true,
      width: "220px",
    },
    {
      id: "notes",
      name: "Observaciones",
      selector: (row) => formater(row.observations),
      sortable: true,
      width: "550px",
    },
  ];

  useEffect(() => {

  }, [selectedOrder])

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 600px)");
    setIsMobile(mediaQuery.matches)
    mediaQuery.addEventListener("change", () =>
      setIsMobile(mediaQuery.matches)
    );
    return () =>
      mediaQuery.removeEventListener("change", () =>
        setIsMobile(mediaQuery.matches)
      );
  }, []);

  const formater = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = "$1.";
    let arr = number.toString().split(".");
    arr[0] = arr[0].replace(exp, rep);
    return arr[1] ? arr.join(".") : arr[0];
  };

  return (
    <div
      className="d-flex flex-column rounded m-0 p-0"
      style={{ height: "calc(100% - 60px)", width: "100%" }}
    >
      <DataTable
        className="bg-light text-center border border-2 h-100 p-0 m-0"
        columns={columns}
        data={orders}
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
        paginationPerPage={15}
        paginationRowsPerPageOptions={[15, 25, 50]}
        noDataComponent={
          <div style={{ padding: 24 }}>Ningún resultado encontrado.</div>
        }
      />
      <Modal
        size="lg"
        show={Boolean(selectedOrder && !isMobile)}
        onHide={() => setSelectedOrder(null)}
      >
        <PDFViewer
          className="rounded"
          style={{
            width: "100%",
            height: "90vh",
          }}
          showToolbar={true}
        >
          <DocOrderPDF order={selectedOrder} />
        </PDFViewer>
      </Modal>
    </div>
  );
}

export default TableOrders;
