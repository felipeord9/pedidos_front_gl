import { useState, useEffect, useContext } from "react";
import DataTable from "react-data-table-component";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import Swal from "sweetalert2";
import * as FaIcons from "react-icons/fa";
import { Modal } from "react-bootstrap";
import DocOrderPDF from "../DocOrderPDF";
import AuthContext from "../../context/authContext";
import { updateOrder } from "../../services/orderService";
import "./styles.css";

const styleStatus = {
  "pedido nuevo": "dark",
  alistamiento: "secondary",
  "verificando pago": "primary",
  "en ruta": "warning",
  rechazado: "danger",
  entregado: "success",
};

function TableOrders({ orders, getAllOrders, loading }) {
  const { user } = useContext(AuthContext);
  const [isMobile, setIsMobile] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const columns = [
    {
      id: "no",
      name: "No.",
      selector: (row) => row.id,
      sortable: true,
      width: "85px",
      center: true,
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
      id: "state",
      name: "Estado",
      center: true,
      cell: (row, index, column, id) => (
        <select
          id={row.id}
          className={`
              form-control form-control-sm border border-2 border-${
                styleStatus[row.state]
              } text-center text-${styleStatus[row.state]}
            `}
          value={row.state}
          disabled={user.role === "vendedor"}
          onChange={(e) => updateState(e, row)}
        >
          <option className="text-secondary">pedido nuevo</option>
          <option className="text-secondary">alistamiento</option>
          <option className="text-primary">verificando pago</option>
          <option className="text-warning">en ruta</option>
          <option id="reasonForRejection" className="text-danger">rechazado</option>
          <option id="reasonForDelivery" className="text-success">entregado</option>
        </select>
      ),
      width: "175px",
    },
    {
      name: "Notas de estado",
      center: true,
      cell: (row, index, column, id) => (
        <>
          <button
            className="btn btn-sm btn-primary"
            onClick={(e) =>
              Swal.fire({
                title: "Notas Rechazo",
                confirmButtonText: "Aceptar",
                html: row.reasonForRejection
                  ? row.reasonForRejection
                      .split("\n")
                      .map((elem) => `<p style="font-size: 15px; margin: 0;">${elem}</p>`)
                      .join("")
                  : "Sin Información",
              })
            }
          >
            Rechazo
          </button>
          <button
            className="btn btn-sm btn-primary"
            onClick={(e) =>
              Swal.fire({
                title: "Notas Entrega",
                confirmButtonText: "Aceptar",
                html: row.reasonForDelivery
                  ? row.reasonForDelivery
                      .split("\n")
                      .map((elem) => `<p style="font-size: 15px; margin: 0;" classname="m-0">${elem}</p>`)
                      .join("")
                  : "Sin Información",
              })
            }
          >
            Entrega
          </button>
        </>
      ),
      width: "200px",
      style: { gap: 5 },
    },
    {
      id: "row_co_id",
      name: "No. Pedido",
      selector: (row) => `${row.coId}-PDV-${row.rowId}`,
      width: "125px",
    },
    {
      id: "delivery_date",
      name: "Fecha de Entrega",
      selector: (row) =>
        new Date(row.deliveryDate).toLocaleString(
          "es-CO"
        ) /* `${row.deliveryDate}` */,
      width: "200px",
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
      id: "branch_description",
      name: "Desc. Sucursal",
      selector: (row) => row.branchDescription,
      sortable: true,
      width: "200px",
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
      width: "200px",
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
      selector: (row) => row.observations,
      width: "550px",
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

  const updateState = (e, order) => {
    const { value } = e.target;
    console.log(value)
    const optionId = e.target.selectedOptions[0].id
    if (value === "rechazado" || value === "entregado") {
      return Swal.fire({
        input: "textarea",
        inputLabel: "Nota",
        inputPlaceholder:
          "Ingrese aquí la razón del cambio de estado del pedido...",
        inputAttributes: {
          "aria-label": "Ingrese la nota acá.",
        },
        inputValidator: (value) => {
          if (!value) {
            return "¡En necesario escribir algo!";
          }
        },
        showCancelButton: true,
        confirmButtonText: "Confirmar",
        confirmButtonColor: "#dc3545",
        cancelButtonText: "Cancelar",
      }).then(({ isConfirmed, value: input }) => {
        if (isConfirmed && value) {
          let consecutive = 1;
          let text;
          const absConsecutive = order?.[optionId]?.split("\n");
          if (absConsecutive) {
            consecutive = absConsecutive;
            const nextConsecutive =
              parseInt(consecutive[consecutive?.length - 1].slice(0, 1)) + 1;
            text = `${order?.[optionId]}\n${nextConsecutive}. ${input} - ${new Date().toLocaleString("es-CO")}`;
          } else {
            text = `${consecutive}. ${input} - ${new Date().toLocaleString("es-CO")}`;
          }
          return updateOrder(order.id, {
            state: value,
            [optionId]: text,
          }).then((data) => {
            console.log(data);
            getAllOrders();
          });
        }
      });
    } else {
      return updateOrder(order.id, {
        state: value,
      }).then((data) => {
        getAllOrders();
      });
    }
  };

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
