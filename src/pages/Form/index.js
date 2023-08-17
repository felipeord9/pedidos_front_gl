import { useEffect, useState, useContext, useRef } from "react";
import Swal from "sweetalert2";
import ComboBox from "../../components/ComboBox";
import AddProducts from "../../components/AddProducts";
import ClientContext from "../../context/clientContext";
import { createOrder } from "../../services/orderService";
import { getAllClients } from "../../services/clientService";
import { sendMail } from "../../services/mailService";
import "./styles.css";

function Form() {
  const { client, setClient } = useContext(ClientContext);
  const [clientes, setClientes] = useState([]);
  const [sucursal, setSucursal] = useState(null);
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
  const selectBranchRef = useRef();

  useEffect(() => {
    getAllClients().then((data) => setClientes(data));
  }, []);

  const findById = (id, array, setItem) => {
    const item = array.find((elem) => elem.id === id);
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
          const f = new FormData();
          const body = {
            client,
            seller: sucursal.seller,
            branch: sucursal,
            products: productosAgr,
            deliveryDate: search.deliveryDate,
            createdAt: new Date(),
            observations: search.observations,
            purchaseOrder: search.order,
            //file: JSON.stringify(files),
          };
          files && f.append("file", files);
          createOrder(body).then(({ data }) => {
            Swal.fire({
              title: "¡Creación exitosa!",
              text: "El pedido de venta se ha realizado satisfactoriamente",
              icon: "success",
              confirmButtonText: "Aceptar",
            }).then(() => {
              window.location.reload();
            });
            /* sendMail({
              id: idParser(data.id),
              ...body,
            }); */
            f.append(
              "info",
              JSON.stringify({
                id: idParser(data.id),
                ...body,
              })
            );
            sendMail(f);
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
      className="d-flex flex-column justify-content-center w-100 py-3"
      style={{ fontSize: 10.5 }}
    >
      <h1 className="text-center fs-5 fw-bold">PEDIDO DE VENTA</h1>
      <section className="d-flex flex-row justify-content-between mb-2">
        <div className="d-flex flex-column">
          <h1 className="fs-6 fw-bold m-0">EL GRAN LANGOSTINO S.A.S.</h1>
          <span className="fw-bold">Nit: 835001216</span>
          <span>Tel: 5584982 - 3155228124</span>
        </div>
      </section>
      <form className="" onSubmit={handleSubmit}>
        <div className="bg-light rounded shadow-sm p-3 mb-3">
          <div className="d-flex flex-column gap-1">
            <div>
              <label className="fw-bold">CLIENTE</label>
              <div className="row row-cols-sm-2">
                <div className="d-flex flex-column align-items-start">
                  <label>NIT/Cédula:</label>
                  <input
                    id="idCliente"
                    type="number"
                    value={client ? client.id : search.idCliente}
                    className="form-control form-control-sm"
                    placeholder="Buscar por NIT/Cédula"
                    onChange={(e) => {
                      const { value } = e.target;
                      handlerChangeSearch(e);
                      findById(value, clientes, setClient);
                    }}
                    min={0}
                    required
                  />
                </div>
                <div className="d-flex flex-column align-items-start">
                  <label>Razón Social:</label>
                  <ComboBox
                    options={clientes}
                    id="razon-social"
                    item={client}
                    setItem={setClient}
                  />
                </div>
              </div>
              <div>
                <label>Sucursal</label>
                <select
                  ref={selectBranchRef}
                  className="form-select form-select-sm"
                  onChange={(e) => setSucursal(JSON.parse(e.target.value))}
                  disabled={client ? false : true}
                  required
                >
                  <option selected value="" disabled></option>
                  {client?.branches
                    .sort((a, b) => a.branch - b.branch)
                    .map((elem) => (
                      <option id={elem.id} value={JSON.stringify(elem)}>
                        {elem.branch + " - " + elem.description}
                      </option>
                    ))}
                </select>
                {/* <ComboBox
                  options={client ? client.branches : []}
                  id="sucursal"
                  setItem={setSucursal}
                /> */}
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
                      client && sucursal ? sucursal.seller.description : ""
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
                  className="form-control form-control-sm"
                  value={search.order}
                  onChange={handlerChangeSearch}
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
            style={{ maxHeight: 100, fontSize: 12 }}
          ></textarea>
        </div>
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

export default Form;
