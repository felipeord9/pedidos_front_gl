import { useEffect, useState, useContext } from "react";
import { IoMdOptions } from "react-icons/io";
import Swal from "sweetalert2";
import ComboBox from "../../components/ComboBox";
import AddProducts from "../../components/AddProducts";
import ModalClients from "../../components/ModalClients";
import ClientContext from "../../context/clientContext";
import { createOrder } from "../../services/orderService";
import { getAllClients } from "../../services/clientService";
import { sendMail } from "../../services/mailService";
import { config } from "../../config";
import "./styles.css";

function Form() {
  const { client, setClient } = useContext(ClientContext);
  const [clientes, setClientes] = useState([]);
  const [agencia, setAgencia] = useState(null);
  const [sucursal, setSucursal] = useState(null);
  const [productosAgr, setProductosAgr] = useState({
    agregados: [],
    total: "0",
  });
  const [search, setSearch] = useState({
    idCliente: "",
    descCliente: "",
    deliveryDate: "",
    observations: "",
  });
  const [showModalClient, setShowModalClient] = useState(false);
  const [showModalSeller, setShowModalSeller] = useState(false);
  const [showModalBranch, setShowModalBranch] = useState(false);

  useEffect(() => {
    getAllClients().then((data) => setClientes(data));
  }, []);

  const findById = (id, array, setItem) => {
    const item = array.find((elem) => elem.id === id);
    if (item) {
      setItem(item);
    } else {
      setItem(null);
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
          const body = {
            //id: idGeneretor(),
            client,
            seller: sucursal.seller,
            agency: agencia,
            branch: sucursal,
            products: productosAgr,
            deliveryDate: search.deliveryDate,
            createdAt: new Date(),
            observations: search.observations,
          };
          createOrder(body).then(({data}) => {
            sendMail({
              id: idParser(data.id),
              ...body
            }).then((data) => {
              Swal.fire({
                title: "¡Creación exitosa!",
                text: "El pedido de venta se ha realizado satisfactoriamente",
                icon: "success",
                confirmButtonText: "Aceptar",
                
              }).then(() => {
                window.location.reload();
              });
            })
          });
        }
      });
  };

  const handleShowModal = (showModal, setShowModal) => {
    Swal.fire({
      title: "Ingrese la contraseña",
      input: "password",
      confirmButtonText: "Ingresar",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
    }).then(({ isConfirmed, value }) => {
      if (isConfirmed) {
        if (value === config.secretPassword) {
          setShowModal(!showModal);
        } else {
          Swal.fire({
            title: "¡Error!",
            text: "La contraseña ingresada es incorrecta",
            icon: "error",
            confirmButtonText: "Aceptar",
            timer: 2000,
          });
        }
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
      <ModalClients
        data={clientes}
        showModal={showModalClient}
        setShowModal={setShowModalClient}
      />
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
                <ComboBox
                  options={client ? client.branches : []}
                  id="sucursal"
                  setItem={setSucursal}
                />
              </div>
            </div>
            <hr className="my-1" />
            <div>
              <label className="fw-bold">VENDEDOR</label>
              <div className="row">
                <div className="d-flex flex-column align-items-start">
                  <label for="idVendedor">Código:</label>
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
            <div>
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
