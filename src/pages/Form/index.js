import { useEffect, useState, useContext, useRef } from "react";
import Swal from "sweetalert2";
import { Modal } from "react-bootstrap";
import * as Pi from 'react-icons/pi'
import ComboBox from "../../components/ComboBox";
import AddProducts from "../../components/AddProducts";
import ModalOrders from "../../components/ModalOrders";
import ClientContext from "../../context/clientContext";
import { createOrder, deleteOrder } from "../../services/orderService";
import { getAllClients, getAllClientsPOS } from "../../services/clientService";
import { getAllAgencies } from "../../services/agencyService";
import { sendMail } from "../../services/mailService";
import "./styles.css";

export default function Form() {
  const { client, setClient } = useContext(ClientContext);
  const [agencia, setAgencia] = useState(null);
  const [sucursal, setSucursal] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [clientsPOS, setClientsPOS] = useState([]);
  const [agencias, setAgencias] = useState([]);
  const [files, setFiles] = useState(null);
  const [productosAgr, setProductosAgr] = useState({
    agregados: [],
    total: "0",
  });
  const [search, setSearch] = useState({
    idCliente: "",
    descCliente: "",
    deliveryDate: "",
    observations: "",
    order: "",
  });
  const [loading, setLoading] = useState(false);
  const [invoiceType, setInvoiceType] = useState(false);
  const [showModalOrders, setShowModalOrders] = useState(false)
  const selectBranchRef = useRef();

  useEffect(() => {
    getAllClients().then((data) => setClientes(data));
    getAllClientsPOS().then((data) => setClientsPOS(data));
    getAllAgencies().then((data) => setAgencias(data));
  }, []);

  const findById = (id, array, setItem) => {
    const item = array.find((elem) => elem.nit === id);
    if (item) {
      setItem(item);
    } else {
      setItem(null);
      setSucursal(null);
      selectBranchRef.current.selectedIndex = 0;
    }
  };

  const handlerChangeSearch = (e) => {
    const { id, value } = e.target;
    setSearch({
      ...search,
      [id]: value,
    });
  };

  const idParser = (id) => {
    let numeroComoTexto = id.toString();
    while (numeroComoTexto.length < 8) {
      numeroComoTexto = "0" + numeroComoTexto;
    }
    return numeroComoTexto;
  };

  const getFiles = (e) => {
    const file = e.target.files[0];
    if (file) {
      const nameFile = file.name.split(".");
      const ext = nameFile[nameFile.length - 1];
      const newFile = new File([file], `Archivo-Adjunto.${ext}`, {
        type: file.type,
      });
      setFiles(newFile);
    }
  };

  const changeType = (e) => {
    setSearch({
      ...search,
      idCliente: "",
    });
    setInvoiceType(!invoiceType);
    setClient(null);
    setSucursal(null);
    selectBranchRef.current.selectedIndex = 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (productosAgr.agregados.length <= 0) {
      Swal.fire({
        title: "¡Atención!",
        text: "No hay productos en la lista, agregue al menos uno",
        icon: "warning",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#198754",
        timer: 2500,
      });
    } else
      Swal.fire({
        title: "¿Está seguro?",
        text: "Se realizará el pedido de venta",
        icon: "warning",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#198754",
        showCancelButton: true,
        cancelButtonText: "Cancelar",
      }).then(({ isConfirmed }) => {
        if (isConfirmed) {
          setLoading(true);
          const f = new FormData();
          const body = {
            client,
            agency: agencia,
            seller: sucursal.vendedor,
            branch: sucursal,
            products: productosAgr,
            deliveryDate: search.deliveryDate,
            createdAt: new Date(),
            observations: search.observations,
            purchaseOrder: search.order,
            //file: JSON.stringify(files),
          };
          files && f.append("file", files);
          createOrder(body)
            .then(({ data }) => {
              const idParsed = idParser(data.rowId)
              f.append(
                "info",
                JSON.stringify({
                  id: idParsed,
                  ...body,
                })
              );
              sendMail(f)
                .then(() => {
                  setLoading(false);
                  Swal.fire({
                    title: "¡Creación exitosa!",
                    text: `
                      El pedido de venta No-${data.coId}-PDV-${idParser(idParsed)} se ha realizado satisfactoriamente.
                      Por favor revise el correo y verifique la información.
                    `,
                    icon: "success",
                    confirmButtonText: "Aceptar",
                  }).then(() => {
                    window.location.reload();
                  });
                })
                .catch((err) => {
                  setLoading(false);
                  deleteOrder(data.id)
                  Swal.fire({
                    title: "¡Ha ocurrido un error!",
                    text: `
                    Hubo un error al momento de enviar el correo, intente de nuevo.
                    Si el problema persiste por favor comuniquese con el área de sistemas.`,
                    icon: "error",
                    confirmButtonText: "Aceptar",
                  });
                });
            })
            .catch((err) => {
              setLoading(false);
              Swal.fire({
                title: "¡Ha ocurrido un error!",
                text: `
                  Hubo un error al momento de guardar el pedido, intente de nuevo.
                  Si el problema persiste por favor comuniquese con el área de sistemas.`,
                icon: "error",
                confirmButtonText: "Aceptar",
              });
            });
        }
      });
  };

  const refreshForm = () => {
    Swal.fire({
      title: "¿Está seguro?",
      text: "Se descartará todo el proceso que lleva",
      icon: "warning",
      confirmButtonText: "Aceptar",
      confirmButtonColor: "#dc3545",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
    }).then(({ isConfirmed }) => {
      if (isConfirmed) window.location.reload();
    });
  };

  return (
    <div
      className="container d-flex flex-column w-100 py-3"
      style={{ fontSize: 10.5 }}
    >
      <ModalOrders showModal={showModalOrders} setShowModal={setShowModalOrders} />
      <button
        className="d-flex align-items-center position-fixed btn btn-sm btn-primary rounded"
        style={{ top: 10, left: -5, width: 35, height: 30 }}
        onClick={(e) => setShowModalOrders(!showModalOrders)}
      >
        <Pi.PiBooksDuotone className="w-100 h-100" />
      </button>
      <h1 className="text-center fs-5 fw-bold">PEDIDO DE VENTA</h1>
      <section className="d-flex flex-row justify-content-between align-items-center mb-2">
        <div className="d-flex flex-column">
          <h1 className="fs-6 fw-bold m-0">EL GRAN LANGOSTINO S.A.S.</h1>
          <span className="fw-bold">Nit: 835001216</span>
          <span>Tel: 5584982 - 3155228124</span>
        </div>
        <div className="d-flex flex-column align-items-center">
          <span className="text-secondary">versión 2.2.0</span>
          <strong>Tipo de facturación</strong>
          <div className="d-flex flex-row align-items-center gap-2">
            <span className={!invoiceType && "text-primary"}>Estándar</span>
            <button
              className="position-relative d-flex align-items-center btn bg-body-secondary rounded-pill toggle-container p-0 m-0"
              onClick={changeType}
            >
              <div
                className={
                  !invoiceType
                    ? "d-flex align-items-center justify-content-center position-absolute bg-primary rounded-circle toggle"
                    : "d-flex align-items-center justify-content-center position-absolute bg-warning rounded-circle toggle active"
                }
              ></div>
            </button>
            <span className={invoiceType ? "text-warning" : undefined}>
              POS
            </span>
          </div>
        </div>
      </section>
      <form className="" onSubmit={handleSubmit}>
        <div className="bg-light rounded shadow-sm p-3 mb-3">
          <div className="d-flex flex-column gap-1">
            <div>
              <label className="fw-bold">CENTRO DE OPERACIÓN</label>
              <select
                ref={selectBranchRef}
                className="form-select form-select-sm"
                onChange={(e) => setAgencia(JSON.parse(e.target.value))}
                required
              >
                <option selected value="" disabled>
                  -- Seleccione el Centro de Operación --
                </option>
                {agencias
                  .sort((a, b) => a.id - b.id)
                  .map((elem) => (
                    <option id={elem.id} value={JSON.stringify(elem)}>
                      {elem.id + " - " + elem.descripcion}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="fw-bold">CLIENTE</label>
              <div className="row row-cols-sm-2">
                <div className="d-flex flex-column align-items-start">
                  <label>NIT/Cédula:</label>
                  <input
                    id="idCliente"
                    type="number"
                    value={client ? client.nit : search.idCliente}
                    className="form-control form-control-sm"
                    placeholder="Buscar por NIT/Cédula"
                    onChange={(e) => {
                      const { value } = e.target;
                      handlerChangeSearch(e);
                      invoiceType
                        ? findById(value, clientsPOS, setClient)
                        : findById(value, clientes, setClient)
                    }}
                    min={0}
                    required
                  />
                </div>
                <div className="d-flex flex-column align-items-start">
                  <label>Razón Social:</label>
                  <ComboBox
                    options={invoiceType ? clientsPOS : clientes}
                    id="razon-social"
                    item={client}
                    setItem={setClient}
                    invoiceType={invoiceType}
                  />
                </div>
              </div>
              <div className="my-1">
                <label className="fw-bold">SUCURSAL</label>
                <select
                  ref={selectBranchRef}
                  className="form-select form-select-sm"
                  onChange={(e) => setSucursal(JSON.parse(e.target.value))}
                  disabled={client ? false : true}
                  required
                >
                  <option selected value="" disabled>
                    -- Seleccione la Sucursal --
                  </option>
                  {client?.sucursales
                    .sort((a, b) => a.id - b.id)
                    .map((elem) => (
                      <option id={elem.id} value={JSON.stringify(elem)}>
                        {elem.id + " - " + elem.descripcion}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <hr className="my-1" />
            <div>
              <label className="fw-bold">VENDEDOR</label>
              <div className="row">
                <div className="d-flex flex-column align-items-start">
                  <input
                    id="idVendedor"
                    type="text"
                    value={
                      client && sucursal && !invoiceType
                        ? sucursal.vendedor?.tercero?.razonSocial
                        : sucursal && invoiceType
                          ? sucursal.vendedor?.description
                          : ""
                    }
                    className="form-control form-control-sm w-100"
                    onChange={handlerChangeSearch}
                    required
                    disabled
                  />
                </div>
              </div>
            </div>
            <hr className="my-1" />
            <div className="d-flex flex-row gap-4">
              <div className="w-100">
                <label className="fw-bold">ORDEN DE COMPRA</label>
                <input
                  id="order"
                  type="text"
                  placeholder="(Campo Opcional)"
                  className="form-control form-control-sm"
                  value={search.order}
                  onChange={handlerChangeSearch}
                  autoComplete="off"
                />
              </div>
              <div className="w-100">
                <label className="fw-bold">FECHA ENTREGA</label>
                <input
                  id="deliveryDate"
                  type="date"
                  className="form-control form-control-sm"
                  value={search.deliveryDate}
                  onChange={handlerChangeSearch}
                  min={new Date().toLocaleDateString("en-CA")}
                  required
                />
              </div>
            </div>
            <div className="w-100">
              <label className="fw-bold">ARCHIVOS ADJUNTOS</label>
              <div className="row">
                <div className="d-flex flex-column align-items-start">
                  <input
                    id="files"
                    type="file"
                    className="form-control form-control-sm w-100"
                    accept=".pdf, .xls, .xlsx"
                    onChange={getFiles}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <AddProducts
          productosAgr={productosAgr}
          setProductosAgr={setProductosAgr}
        />
        <div className="d-flex flex-column mb-3">
          <label className="fw-bold">OBSERVACIONES</label>
          <textarea
            id="observations"
            className="form-control"
            value={search.observations}
            onChange={handlerChangeSearch}
            style={{ minHeight: 70, maxHeight: 100, fontSize: 12 }}
          ></textarea>
        </div>
        <Modal show={loading} centered>
          <Modal.Body>
            <div className="d-flex align-items-center">
              <strong className="text-danger" role="status">
                Cargando...
              </strong>
              <div
                className="spinner-grow text-danger ms-auto"
                role="status"
              ></div>
            </div>
          </Modal.Body>
        </Modal>
        <div className="d-flex flex-row gap-3">
          <button type="submit" className="btn btn-success fw-bold w-100">
            APROBAR
          </button>
          <button
            type="button"
            className="btn btn-danger fw-bold w-100"
            onClick={refreshForm}
          >
            CANCELAR
          </button>
        </div>
      </form>
    </div>
  );
}
