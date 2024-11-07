import { useState, useEffect , useContext } from "react";
import { Modal } from "react-bootstrap";
import Swal from 'sweetalert2'
import TableSingleRequest from '../../components/tableSingleRequest';
import { findRequeBySeller, updateItemofRequest , updateRequest } from "../../services/requestService";
import { sendAnswer , sendConfirm , sendRechazo } from "../../services/requestService";
import { findOneUser } from "../../services/userService";
import AuthContext from "../../context/authContext";
import { GiSandsOfTime } from "react-icons/gi";

export default function ModalSingleRequest({
  request,
  setRequest,
  showModal,
  setShowModal,
  reloadInfo,
}) {
  const [info, setInfo] = useState({
    id: "",
    description: "",
    um: "",
    amount: "",
    price: "",
    percentageAuth: "",
    priceAuth: "",
    total: "",
  });
  const [error, setError] = useState('')
  const [items,setItems] = useState({})
  const { user } = useContext(AuthContext);
  const [aprobados,setAprobados] = useState(false);
  const [rechazados,setRechazados] = useState(false);
  const [reaseon, setReason] = useState('');
  const [modalReject, setModalReject] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [newReques, setNewRequest] = useState({});

  const handleOpenModalReject = (e) => setModalReject(true);
  const handleCloseModalReject = () => setModalReject(false);

  useEffect(() => {
    if(request) {
      setInfo({
        id: request?.id,
        description: request?.description,
        um: request?.um,
        amount: request?.amount,
        price: request?.price,
        percentageAuth: request?.percentageAuth,
        priceAuth: request?.priceAuth,
        total: request?.total,
        state:request?.state,
      })
      setItems([request.items])
    }
  }, [request])


  const handleChange = (e) => {
    const { id, value } = e.target;
    setInfo({
      ...info,
      [id]: value,
    });
  };

  const cleanForm = () => {
    setInfo({
      id: "",
      description: "",
      um: "",
      amount: "",
      price: "",
      percentageAuth: "",
      priceAuth: "",
      total: "",
    })
  }

  const [cargando, setCargando] = useState(false);

  const aprobarTodos = (e) => {
    e.preventDefault();
    setCargando(true)
    updateItemofRequest(info.id,aprob)
    .then(()=>{
      sendConfirm(request)
      /* sendAnswer(request) */
      .then(()=>{
        const changes={
          ...request,
          state:'editado'
        } 
        updateRequest(info.id,changes)
        .then(()=>{
          setCargando(false)
          setAprobados(true)
        })
        .catch(()=>{
          setCargando(false)
          setShowModal(false)
          Swal.fire({
            icon:'warning',
            title:'¡ERROR!',
            text:`Ha ocurrido un error al momento de editar el estado de los productos. Intentalo de nuevo.
            Si el problema persiste comunícate con el área de sistemas para darte una oportuna y rápida solución.`
          })
        })
      })
      .catch(()=>{
        setCargando(false)
        setShowModal(false)
        Swal.fire({
          icon:'warning',
          title:'¡ERROR!',
          text:`Ha ocurrido un error al momento de editar el estado de los productos. Intentalo de nuevo.
          Si el problema persiste comunícate con el área de sistemas para darte una oportuna y rápida solución.`
        })
      })
    })
    .catch(()=>{
      setCargando(false)
      setShowModal(false)
      Swal.fire({
        icon:'warning',
        title:'¡ERROR!',
        text:`Ha ocurrido un error al momento de editar el estado de los productos. Intentalo de nuevo.
        Si el problema persiste comunícate con el área de sistemas para darte una oportuna y rápida solución.`
      })
    })
  }

  const rechazarTodos = (e) => {
    e.preventDefault();
    setEnviando(true)
      if(reaseon !== '' ){
        updateItemofRequest(info.id,Rech)
        .then(()=>{
          const changes={
            reasonForRejection:reaseon,
            state:'editado'
          }
          updateRequest(info.id,changes)
          .then(()=>{
            sendRechazo(request)
            /* sendAnswer(request) */
            .then(()=>{
              setEnviando(false)
              setModalReject(false)
              setRechazados(true)
            })
            .catch(()=>{
              setEnviando(false)
              setShowModal(false)
              Swal.fire({
                icon:'warning',
                title:'¡ERROR!',
                text:`Ha ocurrido un error al momento de editar el estado de los productos. Intentalo de nuevo.
                Si el problema persiste comunícate con el área de sistemas para darte una oportuna y rápida solución.`
              })
            })
          })
          .catch(()=>{
            setEnviando(false)
            setShowModal(false)
            Swal.fire({
              icon:'warning',
              title:'¡ERROR!',
              text:`Ha ocurrido un error al momento de editar el estado de los productos. Intentalo de nuevo.
              Si el problema persiste comunícate con el área de sistemas para darte una oportuna y rápida solución.`
            })
          })
        })
        .catch(()=>{
          setEnviando(false)
          setShowModal(false)
          Swal.fire({
            icon:'warning',
            title:'¡ERROR!',
            text:`Ha ocurrido un error al momento de editar el estado de los productos. Intentalo de nuevo.
            Si el problema persiste comunícate con el área de sistemas para darte una oportuna y rápida solución.`
          })
        })
      }
  }

  const handleClose = () => {
    /* e.preventDefault(); */
    reloadInfo()
    setShowModal(false)
    setRequest(null)
    setAprobados(false)
    setRechazados(false)
    /* window.location.reload() */
  }

  const aprob = {
    state:'Aprobado'
  }
  const Rech = {
    state:'Rechazado'
  }

  const [alreadyState,setAlreadyState] = useState(false);

  return (
    <Modal show={showModal} style={{ fontSize: 11 }} centered size="lg" onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title className="text-danger fw-bold d-flex justify-content-center text-align-center align-items-center">
          Información detallada de la solicitud
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-2">
          <TableSingleRequest setNewRequest={setNewRequest} request={request?.items} setRequest={setRequest} allRequest={request} aprobados={aprobados} rechazados={rechazados} setAlreadyState={setAlreadyState} alreadyState={alreadyState}/>
      </Modal.Body>
      <Modal.Footer className="d-flex w-100 justify-content-center text-align-center aign-items-center">
          {aprobados && <h4 className="d-flex w-100 justify-content-center text-align-center" style={{color:'green'}}>Se han aprobado todos los productos de la solicitud</h4>}
          {rechazados && <h4 className="d-flex w-100 justify-content-center text-align-center" style={{color:'red'}}>Se han rechazdo todos los productos de la solicitud</h4>}
          {alreadyState && <h4 className="d-flex w-100 justify-content-center text-align-center" style={{color:'blue'}}>Ya se ha editado esta solicutud</h4>}
        {((user.role==='admin' || user.role==='aprobador')) &&
          <div>
            {(alreadyState === false && aprobados === false && rechazados === false) &&
              <div>
                <button className='btn btn-sm btn-success m-1'onClick={(e)=>aprobarTodos(e)} >{cargando ? <strong>Aprobando... <GiSandsOfTime /></strong>:'Aprobar Todos'}</button>
                <button className='btn btn-sm btn-danger m-1' onClick={(e)=>/* rechazarTodos(e) */handleOpenModalReject(e)}>Rechazar Todos</button>
              </div>
            }
            
            <Modal show={modalReject} onHide={handleCloseModalReject} style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}} centered size="sm">
              <form onSubmit={rechazarTodos}>
              <Modal.Header closeButton>
                <Modal.Title className="text-danger fw-bold">Razón de rechazo</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <textarea
                  id="reason"
                  className="form-control"
                  placeholder="Ejemplo: No hay rentabilidad"
                  onChange={(e)=>setReason(e)}
                  style={{ minHeight: 70, maxHeight: 100, fontSize: 12 }}
                ></textarea>
                {/* <select
                  className="form-select form-select-sm m-100 me-3"
                  onChange={(e)=>setReason((e.target.value))}
                  required
                >
                  <option selected value='' disabled>
                    -- Seleccione la razón de rechazo --
                  </option>
                  <option value='Muy barato'>Muy barato</option>   
                  <option value='No conviene'>No conviene</option>  
                  <option value='NO me gusta'>NO me gusta</option>       
                </select> */}
              </Modal.Body>
              <Modal.Footer>
                <button className='btn btn-sm btn-success m-1' type="submit" variant="secondary" onSubmit={(e)=>rechazarTodos(e)}>
                  {enviando ? <strong>Enviando... <GiSandsOfTime /></strong>:<strong>Enviar</strong>}
                </button>
                <button className='btn btn-sm btn-danger m-1' variant="secondary" onClick={handleCloseModalReject}>
                  Volver
                </button>
              </Modal.Footer>
              </form>
            </Modal>
          </div>
        }
      </Modal.Footer>
    </Modal>
  );
}
