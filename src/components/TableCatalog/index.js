import { useState, useEffect, useContext } from "react";
import DataTable from "react-data-table-component";
import { PDFViewer, PDFDownloadLink , pdf } from "@react-pdf/renderer";
import Swal from "sweetalert2";
import * as FaIcons from "react-icons/fa";
import { Modal } from "react-bootstrap";
import AuthContext from "../../context/authContext";
import { TfiTicket } from "react-icons/tfi";
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import ModalShowPrice from "../ModalShowPrice";
import { CgMoreO } from "react-icons/cg";
import "./styles.css";
import { useNavigate } from "react-router-dom";

const styleStatus = {
  "pedido nuevo": "primary",
  alistamiento: "secondary",
  "verificando pago": "info",
  "en ruta": "warning",
  rechazado: "danger",
  entregado: "success",
};

function TableCatalog({ products, getAll, loading }) {
  const { user } = useContext(AuthContext);
  const [isMobile, setIsMobile] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const columns = [
    {
      id: "options",
      name: "",
      center: true,
      cell: (row, index, column, id) =>
        <div className="d-flex gap-2 p-1">
          <button
            title="Ver producto"
            className="btn btn-sm btn-primary"
            onClick={(e) => {
              navigate(`/show/product/${row.id}`)
            }}
          >
            <FaIcons.FaEye />
          </button>
        </div>,
      width: "60px",
    },
    {
      id: "ref",
      name: "Ref.",
      selector: (row) => row.id,
      sortable: true,
      width: isMobile ? "90px" : '100px',
    },
    {
      id: "description",
      name: "Descripción",
      selector: (row) => row.description,
      width: isMobile ? "400px" : "420px",
    },
    {
      id: "um",
      name: "U.M.",
      selector: (row) => row.um,
      width: isMobile ? "90px" : "100px",
      sortable: true,
    },
    {
      id: "alternateRef",
      name: "Ref. alterna",
      selector: (row) => row.alternateRef,
      sortable: true,
      width: "150px",
    },
    {
      id: "familia",
      name: "Familia",
      selector: (row) => row.familyDescrip,
      sortable: true,
      width: isMobile ? "200px" : "220px",
    },
    {
      id: "imgProduct",
      name: "Img. producto",
      center: true,
      cell: (row, index, column, id) => (
        <div>
          <FormControlLabel
            disabled
            control={<Checkbox checked={row.imgProduct} />}
          />
        </div>
      ),
      sortable: true,
      width: isMobile ? '125px':'160px'
    },
/*     {
      id: "imgPacking",
      name: "Img. empaque",
      center: true,
      cell: (row, index, column, id) => (
        <div>
          <FormControlLabel
            disabled
            control={<Checkbox checked={row.imgPacking} />}
          />
        </div>
      ),
      sortable: true,
      width: isMobile ? '125px':'160px'
    },
    {
      id: "imgPresentation",
      name: "Img. presentación",
      center: true,
      cell: (row, index, column, id) => (
        <div>
          <FormControlLabel
            disabled
            control={<Checkbox checked={row.imgPresentation} />}
          />
        </div>
      ),
      sortable: true,
      width: isMobile ? '125px':'160px'
    },
    {
      id: "imgBarcode",
      name: "Código barras",
      center: true,
      cell: (row, index, column, id) => (
        <div>
          <FormControlLabel
            disabled
            control={<Checkbox checked={row.imgBarcode} />}
          />
        </div>
      ),
      sortable: true,
      width: isMobile ? '125px':'160px'
    }, */
    {
      id: "options",
      name: "",
      center: true,
      cell: (row, index, column, id) =>
        <div className="d-flex gap-2 p-1">
          <button
            title="Ver producto"
            className="btn btn-sm btn-danger"
            onClick={(e) => {
              setSelectedProduct(row);
              setShowModal(true);
            }}
          >
            <CgMoreO />
          </button>
        </div>,
      width: isMobile ? "60px" : "70px",
    },
  ];

    const customStyles = {
    /* cells: {
      style: {
        backgroundColor: row.status === 'en proceso' ?'rgba(255, 200, 39, 0.4)' : row.status === 'Finalizado' ? 'rgba(74, 157, 38, 0.35)' : 'grey', // ajustar el tamaño de la fuente de las celdas
      },
    }, */
    rows: {
      style: {
        minHeight: '15px', // ajusta el alto de las filas según tus necesidades
      },
    },
    headCells: {
      style: {
        fontSize: '14px',
        height:'35px',
        /* fontWeight:'bold', */
        color:'white',
        backgroundColor:'#d64e4e',
        /* borderRight: '1px solid black', */
        paddingLeft:10,
        paddingRight:10
      },
    },
    cells: {
      style: {
        /* borderRight: '1px solid black', */
        paddingLeft:10,
        paddingRight:10
      },
    },
    columns:{
      style: {
        borderLeft:'5px black solid'
      }
    }
  };

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

  const formater = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = "$1.";
    let arr = number.toString().split(".");
    arr[0] = arr[0].replace(exp, rep);
    return arr[1] ? arr.join(".") : arr[0];
  };

  return (
    <div
      className="d-flex flex-column rounded m-0 p-0 table-orders"
      style={{ width: "100%" }}
    >
      <ModalShowPrice 
        product={selectedProduct}
        setProduct={setSelectedProduct}
        showModal={showModal}
        setShowModal={setShowModal}
        reloadInfo={getAll}
        centro={user.co}
      />
      <DataTable
        className="bg-light text-center border border-2 h-100 p-0 m-0"
        columns={columns}
        data={products}
        customStyles={customStyles}
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
    </div>
  );
}

export default TableCatalog;
