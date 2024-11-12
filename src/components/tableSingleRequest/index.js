import { useState, useEffect, useContext } from "react";
import React from 'react';
import DataTable from "react-data-table-component";
import AuthContext from "../../context/authContext";
import { updateItem , sendAnswer , updateRequest , sendConfirm , sendRechazo } from "../../services/requestService";
import { MdCancel } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";
import { MdEditDocument } from "react-icons/md";
import { Modal } from "react-bootstrap";
import { GiSandsOfTime } from "react-icons/gi";
import { Table } from 'react-bootstrap';
import {  NumericFormat  }  from  'react-number-format' ;
import Swal from "sweetalert2";
import "./styles.css";

function TableSingleRequest({ request, setRequest , allRequest , aprobados , rechazados , setNewRequest , setAlreadyState , alreadyState}) {
  const { user } = useContext(AuthContext);

  const [Selected, setSelected] = useState({})

  const [reaseon, setReason] = useState('');
  const [completed, setCompleted] = useState({})
  const [modalReject, setModalReject] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const handleOpenModalReject = (e) => setModalReject(true);
  const handleCloseModalReject = () => setModalReject(false);
  const [rowSelected, setRowSelected] = useState('');

  useEffect(()=>{
    if(request){
      setSelected(request)
    }
    if(allRequest){
      setCompleted(allRequest)
    }
  },[])

  const [data,setData] = useState();
  const [edited,setEdited] = useState(false);
  const [alreadySend, setAlreadySend] = useState('');

  const columns = [
    {
      id: "referencia",
      name: "REF.",
      selector: (row) => row.id,
      sortable: true,
      width: "90px",
    },
    {
      id: "descripcion",
      name: "Descripción",
      selector: (row) => row.description,
      sortable: true,
      width: "250px",
    },
    {
      id: "amount",
      name: "Cantidad",
      selector: (row) => `${row?.RequestProduct?.amount}`,
      selector: (row) =>( /* setData(row), */
        <div className="d-flex">
          <NumericFormat
            thousandSeparator=","
            decimalSeparator="."
            id={row?.RequestProduct?.amount}
            className="form-control form-control-sm w-100"
            allowNegative={false}
            decimalScale={0}
            required
            disabled={(row.RequestProduct.state === 'Aprobado' || row.RequestProduct.state === 'Rechazado' || user.role === 'vendedor' || user.role === 'agencia' || user.role === 'precios') ? true : false }
            placeholder="Campo obligatorio"
            value={edited ? Selected?.RequestProduct?.amount : row?.RequestProduct?.amount}
            onChange={(e)=>(handlerChange(row.id,e.target.value), setEdited(true))}
          />
        </div>
      ),
      sortable: true,
      width: "125px",
    },
    {
      id: "um",
      name: "UM",
      selector: (row) => row.um,
      sortable: true,
      width: "85px"
    },
    {
      id: "costo",
      name: "Costo",
      selector: (row) => Number(row?.RequestProduct?.cost).toLocaleString(),
      sortable: true,
      width: "140px",
    },
    {
      id: "price",
      name: "Precio de Lista",
      selector: (row) => Number(row?.RequestProduct?.price).toLocaleString(),
      sortable: true,
      width: "150px",
    },
    {
      id: "currentMargen",
      name: "Margen Actual",
      selector: (row) => `${Number(row?.RequestProduct?.currentMargen)} %`,
      sortable: true,
      width: "155px",
    },
    {
      id: "priceAuth",
      name: "Precio por Autorizar",
      selector: (row) =>( /* setData(row), */
        <div className="d-flex">
          <NumericFormat
            thousandSeparator=","
            decimalSeparator="."
            id={row?.RequestProduct?.priceAuth}
            className="form-control form-control-sm w-100"
            allowNegative={false}
            decimalScale={0}
            required
            disabled={(row.RequestProduct.state === 'Aprobado' || row.RequestProduct.state === 'Rechazado' || user.role === 'vendedor' || user.role === 'agencia' || user.role === 'precios') ? true : false }
            placeholder="Campo obligatorio"
            value={edited ? Selected?.RequestProduct?.priceAuth : row?.RequestProduct?.priceAuth}
            onChange={(e)=>(handlerChange(row.id,e.target.value), setEdited(true))}
          />
        </div>
      ),
      sortable: true,
      width: "185px",
    },
    {
      id: "newMargen",
      name: "Nuevo Margen",
      selector: (row) => `${(((Number(row?.RequestProduct?.priceAuth) - Number(row?.RequestProduct?.cost)) / Number(row?.RequestProduct?.priceAuth)) * 100).toFixed(2)} %`,
      sortable: true,
      width: "155px",
    },
    {
      id:'state',
      selector: (row) => (
        <div className='d-flex p-1 flex-row'>
          <HandleStatus row={row} setSend={setAlreadySend} setState={setAlreadyState}/>
        </div>
      ),
      width: '155px'
    },
    
  ];

  /* const handleChange = (e) => {
    const { id, value } = e.target;
    request.map((item)=>{
      if(item.RequestProduct.id===id) 
        return 
      setSelected({
        ...Selected,
        ['priceAuth']:value
      })})
  } */

  const list = [Selected]
  const suma = list?.RequestProduct?.reduce((acumular,item)=>{
    const numeroNOrmal = Number(parseFloat(item?.amount)*parseInt(item?.priceAuth))
    return acumular + numeroNOrmal
  })

  const [noReason, setNoReason] = useState(false);
  
  
  const HandleStatus = ({row}) =>{
    const [status, setStatus] = useState('');
    const [color, setColor] = useState('');

    useEffect(()=>{
      if(row?.RequestProduct?.state==='Aprobado'){
        setStatus('Aprobado')
        setColor('green')
      }else if(row?.RequestProduct?.state==='Rechazado'){
        setStatus('Rechazado')
        setColor('red')
      }
      if(aprobados){
        setColor('green')
        setStatus('Aprobado')
      }else if(rechazados){
        setColor('red')
        setStatus('Rechazado')
      }
    },[])

    const handleClick = (e) =>{
      e.preventDefault();
      /* setAlreadyState(true) */
      setColor('green')
      setStatus('Aprobado')
    }

    const handleClickRech = (e) =>{
      e.preventDefault();
      /* setAlreadyState(true) */
      setColor('red')
      setStatus('Rechazado')
    }

    const aprob = {
      state:'Aprobado',
      priceAuth: row?.RequestProduct?.priceAuth
    }
    const Rech = {
      state:'Rechazado',
      reasonForRejection:reaseon,
    }

    const all = {
      total: newTotal,
      state: 'editado',
      newMargen: (((Number(row?.RequestProduct?.priceAuth) - Number(row?.RequestProduct?.cost)) / Number(row?.RequestProduct?.priceAuth)) * 100).toFixed(2),
    } 

    const allnegative ={
      state: 'editado',
    }

    const handleUpdate = (e) => {
      e.preventDefault();
      setEnviando(true)
      if(reaseon !== ''){
        updateItem(row.RequestProduct.id,Rech)
        .then(()=>{
          handleClickRech(e)
          setEnviando(false)
          setModalReject(false)
        })
        .catch(()=>{
          setEnviando(false)
          setModalReject(false)
          Swal.fire({
            icon:'warning',
            title:'¡ERROR!',
            text:`Ha ocurrido un error al momento de editar el estado de este producto. Intentalo de nuevo.
            Si el problema persiste comunícate con el área de sistemas para darte una oportuna y rápida solución.`
          })
        })
      }else{
        setEnviando(false)
        setNoReason(true)
        setTimeout(() => setNoReason(false), 3000)
      }
    }

    /* Cambio de estado de los productos, envio de respuesta confirm y cambio de status en la tabla */
    const handleConfirm = (e,id) =>{
      e.preventDefault();

      ////logica para actualizar la variable allRequest
      //nueva lista de productos
      const nuevaLista = [...Selected]
      const indice = nuevaLista.findIndex(item=>item.id===id)
      if(indice !== -1){
        nuevaLista[indice].RequestProduct.state='Aprobado';
      }
      setSelected(nuevaLista)

      //logica de la funcion confirmar
      updateItem(row.RequestProduct.id,aprob)
      .then(()=>{
        updateRequest(allRequest.id,all)
        .then(()=>{
          if(alreadySend===''){
              sendAnswer(allRequest)              
              setColor('green')
              setStatus('Aprobado')
            }
        })
        .catch(()=>{
          setColor('')
          setStatus('')
        })
      })
      .catch(()=>{
        setColor('')
        setStatus('')
      })
    }

    /* update de estado, envio de respuesta reject y cambio de status en la tabla */
    const handleReject = (e,id) =>{
      e.preventDefault();

      ////logica para actualizar la variable allRequest
      //nueva lista de productos
      const nuevaLista = [...Selected]
      const indice = nuevaLista.findIndex(item=>item.id===id)
      if(indice !== -1){
        nuevaLista[indice].RequestProduct.state='Rechazado';
      }
      setSelected(nuevaLista)

      //logica de la funcion rechazar
      updateItem(row.RequestProduct.id,Rech)
      .then(()=>{
        updateRequest(allRequest.id,allnegative)
        .then(()=>{
          if(alreadySend===''){
            sendAnswer(allRequest)
            setColor('red')
            setStatus('Rechazado')
            /* setAlreadySend('enviado') */
            /* setAlreadySend(true)
            setAlreadyState(true) */
            }else{
              setColor('red')
              setStatus('Rechazado')
              /* setAlreadyState(true) */
            }
          })
      })
      .catch(()=>{
        Swal.fire({
          title:'¡ERROR!',
          text:'Hubo un error al momento de editar este producto. intentalo de nuevo, si el problema persiste comunicate con el área de sistemas.',
          showCancelButton:false,
          showConfirmButton:false,
          timer:4000,
        })
      })
    }

    return(
      <div className="d-flex justify-content-end align-items-end text-align-end w-100">
        {(user.role==='admin' || user.role==='aprobador') && (status === null || status === '') ? (
          <div className='d-flex'>

          {/* Boton para confirmar item */}
          <button onClick={(e)=>handleConfirm(e, row.id)}/* updateItem(row.RequestProduct.id,aprob),updateRequest(allRequest.id,all),handleClick(e), setAlreadySend(true), handleSendEmail(e) */
           title="Aprobar" className='btn btn-sm btn-success me-2'
          >
            Aprobar <FaCheckCircle className="ms-1 text-button"/>
          </button>

          {/* Boton para rechazar item */}
          <button onClick={(e)=>handleReject(e, row.id)}/* updateItem(row.RequestProduct.id,Rech),handleClickRech(e), setAlreadySend(true), handleSendEmail(e) */
            title="Rechazar" className='btn btn-sm btn-danger '
          >
            Rechazar <MdCancel className="ms-1 text-button"/>
          </button>
          
          </div>
        ):(
          status!=='' ?
          <span style={{color:color}} className="fw-bold"><strong>{status}</strong></span>
          :
          <span style={{color:'GrayText'}} className="fw-bold"><strong>Sin estado</strong></span>
        )}
      </div>
    )
  }

  const [newTotal, setNewTotal] = useState(allRequest?.total)

  const handlerChange = (id,e) => {
    //nuevo valor de precio por autorizar
    const numeroSinComas = e.replace(/,/g, '');
    const numero = parseFloat(numeroSinComas)

    //nueva lista de productos
    const nuevaLista = [...Selected]
    const indice = nuevaLista.findIndex(item=>item.id===id)
    /* localStorage.setItem('index',JSON.stringify(indice))  */
    if(indice !== -1){
      nuevaLista[indice].RequestProduct.priceAuth=numero;
    }
    const total = nuevaLista.reduce((acumular,item)=>{
        const numeroNormal = Number(parseFloat(item?.RequestProduct?.amount)*parseInt(item?.RequestProduct?.priceAuth))
        return acumular + numeroNormal;
    },0)
    setSelected(nuevaLista)
    setNewTotal(total)

  };

  useEffect(()=>{
    handleLook()
  },[])

  const handleLook = () => {
    const list = [...request];
    const encontrar = list?.map((element)=>{
      if(element?.RequestProduct?.state === 'Aprobado' || element?.RequestProduct?.state === 'Rechazado'){
        return true
      }else{
        return false
      }
    })
    const hashTrue = encontrar.some(value => value===true);

    setAlreadyState(hashTrue);
  }

  //logica para rechazar item de solicitud
  //editar el item
  const Rech = {
    state:'Rechazado',
    reasonForRejection:reaseon,
  }
  //editar la solicitud
  const allnegative ={
    state: 'editado',
  }
  //

  return (
    <div
      className="d-flex flex-column rounded m-0 p-2"
      style={{ height: "calc(100% - 60px)", width: "100%" }}
    >
      {/* <Modal show={modalReject} onHide={handleCloseModalReject} style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}} centered size="sm">
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
              </Modal.Body>
              <Modal.Footer>
                <button className='btn btn-sm btn-success m-1' variant="secondary" onClick={(e)=>(handleReject(e))}>
                  {enviando ? <strong>Enviando... <GiSandsOfTime /></strong>:<strong>Enviar</strong>}
                </button>
                <button className='btn btn-sm btn-danger m-1' variant="secondary" onClick={(e)=>handleCloseModalReject(e)}>
                  Close
                </button>
              </Modal.Footer>
            </Modal> */}
    {request && request.map((item, index) => (
      <div key={index}>
      <h5 className="titulo-produc fw-bold">{index +1}) {item.id} - {item.description}</h5>
      <div className="row">
        <div className="col col-12 col-lg-6 col-md-12">
          <h6 className="cant-cost"><strong>Cantidad:</strong> {`${(item?.RequestProduct?.amount).toLocaleString()} ${item.um}`} </h6>
        </div>
        <div className="col col-12 col-lg-6 col-md-12">
          <h6 className="cant-cost"><strong>Costo Promedio:</strong> $ {(Number(item?.RequestProduct?.cost).toLocaleString())} </h6>
        </div>
      </div>
      <Table striped bordered hover>
        <thead className="d-flex flex-row w-100">
          <tr className="d-flex flex-row w-100">
            <th className="d-flex w-75 ps-1"></th>
            <th className="d-flex w-100">Actual</th>
            <th className="d-flex w-100">Solicitud</th>
          </tr>
        </thead>
        <tbody>
            <React.Fragment key={index}>
              <tr className="d-flex w-100">
                <td className="fw-bold w-75 d-flex ps-1">Precio</td>
                <td className="w-100 d-flex">$ {Number(item?.RequestProduct?.price).toLocaleString()}</td>
                {/* <td>$ {Number(item?.RequestProduct?.priceAuth).toLocaleString()}</td> */}
                <td className="d-flex flex-row w-100 m-0 pt-0 pb-0">
                  <div className="d-flex flex-row w-100">
                  <label className="mt-2 me-0">$</label> 
                    <NumericFormat
                      thousandSeparator=","
                      decimalSeparator="."
                      id={item?.RequestProduct?.priceAuth}
                      className="form-control form-control-sm w-100 m-0 "
                      allowNegative={false}
                      decimalScale={0}
                      required
                      size='small'
                      style={{fontSize:11}}
                      disabled={(item.RequestProduct.state === 'Aprobado' || item.RequestProduct.state === 'Rechazado' || user.role === 'vendedor' || user.role === 'agencia' || user.role === 'precios') ? true : false }
                      placeholder="Campo obligatorio"
                      value={edited ? Selected?.RequestProduct?.priceAuth : item?.RequestProduct?.priceAuth}
                      onChange={(e)=>(handlerChange(item.id,e.target.value), setEdited(true))}
                    />
                  </div>
                </td>
              </tr>
              <tr className="d-flex w-100">
                <td className="fw-bold w-75 d-flex ps-1">Margen</td>
                <td className="d-flex w-100">{Number(item?.RequestProduct?.currentMargen).toLocaleString()} %</td>
                <td className="d-flex w-100">{(((Number(item?.RequestProduct?.priceAuth) - Number(item?.RequestProduct?.cost)) / Number(item?.RequestProduct?.priceAuth)) * 100).toFixed(2)} %</td>
              </tr>
            </React.Fragment>
        </tbody>
      </Table>
      <div className='d-flex p-1 flex-row w-100'>
        <HandleStatus row={item} setSend={setAlreadySend} setState={setAlreadyState}/>
      </div>
      <hr style={{border: '1px solid black', margin: '8px 0'}}/>
      {/* {index < request.lenght -1 && <hr style={{border: '1px solid #ccc', margin: '20px 0'}}/>} */}
      </div>
    ))}
      {/* <DataTable
        className="bg-light text-center border border-2 h-100 p-0 m-0"
        columns={columns}
        data={request}
        dense
        striped
        fixedHeader
      />

      <br/> */}
      
    </div>
  );
}

export default TableSingleRequest;
