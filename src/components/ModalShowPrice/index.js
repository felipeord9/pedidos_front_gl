import { useState, useEffect , useContext, useRef } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import Swal from 'sweetalert2'
import AuthContext from "../../context/authContext";
import { RiArrowGoBackFill } from "react-icons/ri";
import { findPriceWithCo } from "../../services/precioService"
import { getAllAgencies } from "../../services/agencyService";
import './styles.css'

export default function ModalShowPrice({
  product,
  setProduct,
  showModal,
  setShowModal,
  reloadInfo,
  centro
}) {
  const selectBranchRef = useRef();
  const [agencias, setAgencias] = useState([]);
  const [agencia, setAgencia] = useState(null);
  const { user, setUser } = useContext(AuthContext);
  const [listaPrecios, setListaPrecios] = useState([]);

  // Guardamos en una constante limpia si el usuario es Admin o Comercial
  const esAdminOComercial = user?.role === 'admin' || user?.role === 'comercial';

  // 1. Cargar Agencias y buscar precio si NO es admin/comercial
  useEffect(() => {
    getAllAgencies().then((data) => setAgencias(data));
    
    // CORREGIDO: Si NO es admin Y TAMPOCO es comercial (Usando &&)
    if (centro !== null && !esAdminOComercial && showModal === true) {
      busquedaPrecio(product?.id, centro);
    }
  }, [showModal, centro, product?.id]); // Buenas prácticas: Añadir dependencias clave

  const busquedaPrecio = async (referencia, centOperacion) => {
    await findPriceWithCo(referencia, centOperacion)
    .then(({data})=>{
      const precios = data
      const precio = precios.filter((item)=>item.precioSugerido !== 0)

      //funcion para reducir el resultado por fechas y dejar la fecha del precio mas actual
      const reduce = precio.reduce((acc, item)=>{
        // Si no existe el IdListaPrecio en el acumulador, lo añadimos
        if (!acc[item.IdListaPrecio]) {
          acc[item.IdListaPrecio] = item;
        } else {
          // Comparamos las fechas y mantenemos la más actualizada
          const fechaActual = new Date(acc[item.IdListaPrecio].fechaActivacion);
          const fechaNueva = new Date(item.fechaActivacion);
                  
          if (fechaNueva > fechaActual) {
            acc[item.IdListaPrecio] = item;
          }
        }
        return acc;
      },{})
      if(reduce.length !== 0){
        const resultado = Object.values(reduce);
        setListaPrecios(resultado)
      }
    })
  }

  const [isMobile, setIsMobile] = useState(false);

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

  const findById = (e) => {
    const { value } = e.target;
    const co = JSON.parse(value)
    busquedaPrecio(product.id, co.id)
  };

  const formater = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = "$1.";
    let arr = number.toString().split(".");
    arr[0] = arr[0].replace(exp, rep);
    return arr[1] ? arr.join(".") : arr[0];
  };

  const handleCloseModal = () => {
    setAgencia('')
    setListaPrecios([])
    setShowModal(false);
  }

  return (
    <Modal show={showModal} style={{ fontSize: 18, userSelect:'none' }} centered size="lg">
      <Modal.Body className="p-2">
      <div className={`${isMobile ? 'd-flex flex-column' : 'd-flex flex-row gap-3'}`} style={{fontSize: isMobile ? 12 : 15}}>
        <div className={`${(user.role !== 'admin' || user.role !== 'comercial') ? 'w-100 mb-3' : 'w-100'} d-flex flex-column`}>
          <label className="fw-bold text-danger">PRODUCTO</label>
          <input 
            className="form-control form-control-sm"
            disabled
            value={`${product?.id} - ${product?.description}`}
          />
        </div>
        {(user.role === 'admin' || user.role === 'comercial') &&
          <div className="d-flex flex-column w-100">
            <label className="fw-bold text-danger">CENTRO DE OPERACIÓN</label>
            <select
              ref={selectBranchRef}
              className="form-select form-select-sm"
              onChange={(e) => (setAgencia(JSON.parse(e.target.value), findById(e)))}
              required
            >
              <option selected value="" disabled>
                -- Seleccione el Centro de Operación --
              </option>
              {agencias
                .sort((a, b) => a.id - b.id)
                .map((elem) => (
                  <option id={elem.id} value={JSON.stringify(elem)}>
                    {elem?.id + " - " + elem?.descripcion}
                  </option>
                ))}
            </select>
          </div>
        }
      </div> 
      <div className={`table-responsive ${(user.role === 'admin' || user.role === 'comercial') && 'mt-3'}`}>
        <table className="table table-sm table-striped table-bordered" style={{fontSize: isMobile ? 12 : 15}}>
          <thead className="table-light" style={{backgroundColor:'#d64e4e'}}>
            <tr >
              <th style={{backgroundColor:'#d64e4e', color:'white'}}>Lista de precio</th>
              <th className="d-flex justify-content-center" style={{backgroundColor:'#d64e4e', color:'white'}}>Precio</th>
            </tr>
          </thead>
          <tbody>
            {listaPrecios && listaPrecios
              .sort((a, b) => parseInt(a.IdListaPrecio) - parseInt(b.IdListaPrecio))
              .map((elem, index) => (
                <tr key={index}>
                  <td className="font-weight-bold">{elem.IdListaPrecio} - {elem.listPrice.descripcion}</td>
                  <td className="d-flex justify-content-center">$ {formater(elem.precioMinimo)}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      </Modal.Body>
      <Modal.Footer>
        <div className="d-flex justify-content-center gap-2 mt-2 w-100" >
          <button
            className="btn btn-sm btn-primary w-50"
            style={{fontSize: isMobile && 12}}
            onClick={(e)=>handleCloseModal()}
          >
            <RiArrowGoBackFill /> VOLVER
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
