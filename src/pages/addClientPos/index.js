import { useEffect, useState, useContext, useRef } from "react";
import { useNavigate, useParams } from 'react-router-dom'
import Swal from "sweetalert2";
import { Modal } from "react-bootstrap";
import AuthContext from "../../context/authContext";
import ClientContext from "../../context/clientContext";
import { findClients , findClientByPk , findClientByName , createClientsPOS , updateClientsPOS } from '../../services/clientsPosService'
import { getAllAgencies , findAgencyByPk } from "../../services/agencyService";
import { renombrarArchivo, sendEvidence, verificarArchivo } from "../../services/evidence";
import { FaFileDownload } from "react-icons/fa";
import { config } from "../../config";
import "./styles.css";

export default function AddClientPos() {
  const { user, setUser } = useContext(AuthContext);
  const { client, setClient } = useContext(ClientContext);
  const [agencia, setAgencia] = useState(null);
  const [clientsPOS, setClientsPOS] = useState([]);
  const [agencias, setAgencias] = useState([]);
  const [search, setSearch] = useState({
    id:'',
    razonSocial:'',
    telefono: '',
    direccion: '',
    plazo: '',
  });
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(false);
  const selectBranchRef = useRef();
  const selectPlazoRef = useRef();
  const navigate = useNavigate();
  const [previewPhoto, setPreviewPhoto] = useState(null); // Foto en previsualización
  const [showModal, setShowModal] = useState(false);
  const [evidence, setEvidence] = useState(null);
  const [typeEvidence, setTypeEvidence] = useState(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [suggestionsClients, setSuggestionsClients] = useState([]);
  const [editando, setEditando] = useState(false);
  const refClient = useRef();
  const { id } = useParams();
  const [foto, setFoto] = useState(null);

  useEffect(() => {
    getAllAgencies().then((data) => setAgencias(data));
    if(id){
      setLoading(true);
      findClientByPk(id)
      .then( async ({data}) =>{
        const co = agencias.find((co) => co.id === data.coId)
        const foto = `local_${data.id}.jpg`
        const directFoto = `${config.apiUrl2}/upload/obtener-archivo/${foto}`
        const url = await verificarArchivo(directFoto)
        if(url){
          setFoto(url);
        }
        setAgencia(JSON.stringify(co))
        setSearch(data)
        setInfo(data)
        setEditando(true)
        setLoading(false)
      })
    }
  }, []);

  useEffect(() => {
    findClients()
      .then(({data}) => {
        setClientsPOS(data)
        setSuggestionsClients(data)
        setLoading(false)
      })
  },[])

  const handlerChangeSearch = (e) => {
    const { id, value } = e.target;
    console.log(value);
    setSearch({
      ...search,
      [id]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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
          const body = {
            coId: agencia.id,
            coDescription: agencia.descripcion,
            razonSocial: search.razonSocial.toUpperCase(),
            telefono: search.telefono,
            direccion: search.direccion.toUpperCase(),
            plazo: search.plazo,
            createdAt: new Date(),
            createdBy: user.name,
            idCreator: user.id,
            agency: agencia,
          };
          findClientByName(agencia.id, search.razonSocial.toUpperCase())
          .then(()=>{
            setLoading(false);
            Swal.fire({
              title: "¡Ha ocurrido un error!",
              text: `
                El cliente con razón social: ${search.razonSocial}, ya se encuentra creado
                 en nuestra base de datos para el centro de operación: ${agencia.id}.
                Verifica la información e intentalo de nuevo mas tarde.
                `,
              icon: "warning",
              confirmButtonText: "Aceptar",
            });
          })
          .catch((err) => {
            createClientsPOS(body)
              .then(({ data }) => {
                if(evidence !== null){
                  const f = new FormData();
                  f.append('evidence', evidence, 'evidence.jpg')
                  f.append('id', data.id)
                  f.append('name', data.razonSocial)
                  f.append("info", JSON.stringify(body))
                  sendEvidence(f)
                  .then(()=>{
                    setLoading(false);
                    Swal.fire({
                      title: "¡Creación exitosa!",
                      text: `
                        Se ha registrado el cliente POS: ${data.razonSocial} satisfactoriamente
                         para el centro de operación ${data.coId}.
                      `,
                      icon: "success",
                      confirmButtonText: "Aceptar",
                    }).then(() => {
                      setSearch({
                        direccion:'',
                        plazo:'',
                        telefono:'',
                        razonSocial:'',
                        id:'',
                      })
                      setAgencia(null);
                      setPreviewPhoto(null);
                      setEditando(false);
                      setClienteSeleccionado(null);
                      setSuggestionsClients([]);
                      window.location.reload()
                    });
                  })
                  .catch(()=>{
                    setLoading(false);
                    Swal.fire({
                      title: "¡Ha ocurrido un error!",
                      text: `
                        Hubo un error al momento de registrar la evidencia del cliente POS, intente de nuevo.
                        Si el problema persiste por favor comuniquese con el área de sistemas.`,
                      icon: "warning",
                      confirmButtonText: "Aceptar",
                    });
                  })
                }else{
                  setLoading(false);
                  Swal.fire({
                    title: "¡Creación exitosa!",
                    text: `
                      Se ha registrado el cliente POS: ${data.razonSocial} satisfactoriamente.
                    `,
                    icon: "success",
                    confirmButtonText: "Aceptar",
                  }).then(() => {
                    setSearch({
                      direccion:'',
                      plazo:'',
                      telefono:'',
                      razonSocial:'',
                      id:'',
                    })
                    setAgencia(null);
                    setPreviewPhoto(null);
                    setEditando(false);
                    setClienteSeleccionado(null);
                    setSuggestionsClients([]);
                    window.location.reload()
                  });
                }
              })
              .catch((err) => {
                setLoading(false);
                Swal.fire({
                  title: "¡Ha ocurrido un error!",
                  text: `
                    Hubo un error al momento de registrar el cliente POS, intente de nuevo.
                    
                    Si el problema persiste por favor comuniquese con el área de sistemas.`,
                  icon: "warning",
                  confirmButtonText: "Aceptar",
                });
              });
          });
        }
      });
  };

  const handleUpdate= (e) => {
    e.preventDefault();
      Swal.fire({
        title: "¿Está seguro?",
        text: "Se realizará la actualización del cliente POS",
        icon: "warning",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#198754",
        showCancelButton: true,
        cancelButtonText: "Cancelar",
      }).then(({ isConfirmed }) => {
        if (isConfirmed) {
          setLoading(true);
          const body = {
            coId: search.coId,
            coDescription: search.coDescription,
            razonSocial: search.razonSocial,
            telefono: search.telefono,
            direccion: search.direccion,
            plazo: search.plazo,
            updatedAt: new Date(),
            updatedBy: user.name,
            idUpdater: user.id,
          };
          findClientByName(search.coId, search.razonSocial.toUpperCase())
          .then(()=>{
            setLoading(false);
            Swal.fire({
              title: "¡Ha ocurrido un error!",
              text: `
                El cliente con razón social: ${search.razonSocial}, ya se encuentra creado
                 en nuestra base de datos para el centro de operación: ${agencia.id}.
                Verifica la información e intentalo de nuevo mas tarde.
                `,
              icon: "warning",
              confirmButtonText: "Aceptar",
            });
          })
          .catch((err)=>{
            updateClientsPOS(search.id, body)
              .then(({ data }) => {
                if(evidence !== null){
                  const f = new FormData();
                  f.append('evidence', evidence, 'evidence.jpg')
                  f.append('id', search.id)
                  f.append('name', search.razonSocial)
                  f.append("info", JSON.stringify(body))
                  sendEvidence(f)
                  .then(()=>{
                    setLoading(false);
                    Swal.fire({
                      title: "Actualización exitosa!",
                      text: `
                        Se ha actualizado el cliente POS: ${data.razonSocial} satisfactoriamente.
                      `,
                      icon: "success",
                      confirmButtonText: "Aceptar",
                    }).then(() => {
                      setSearch({
                        direccion:'',
                        plazo:'',
                        telefono:'',
                        razonSocial:'',
                        id:'',
                      })
                      setAgencia(null);
                      setPreviewPhoto(null);
                      setEditando(false);
                      setClienteSeleccionado(null);
                      setSuggestionsClients([]);
                      window.location.reload()
                    });
                  })
                  .catch(()=>{
                    setLoading(false);
                    Swal.fire({
                      title: "¡Ha ocurrido un error!",
                      text: `
                        Hubo un error al momento de actualizar la evidencia del cliente POS, intente de nuevo.
                        Si el problema persiste por favor comuniquese con el área de sistemas.`,
                      icon: "warning",
                      confirmButtonText: "Aceptar",
                    });
                  })
                }else{
                    setLoading(false);
                    Swal.fire({
                      title: "Actualización exitosa!",
                      text: `
                        Se ha actualizado el cliente POS: ${data.razonSocial} satisfactoriamente.
                      `,
                      icon: "success",
                      confirmButtonText: "Aceptar",
                    }).then(() => {
                      setSearch({
                        direccion:'',
                        plazo:'',
                        telefono:'',
                        razonSocial:'',
                        id:'',
                      })
                      setAgencia(null);
                      setPreviewPhoto(null);
                      setEditando(false);
                      setClienteSeleccionado(null);
                      setSuggestionsClients([]);
                      window.location.reload()
                    });
                }
              })
              .catch((err) => {
                setLoading(false);
                Swal.fire({
                  title: "¡Ha ocurrido un error!",
                  text: `
                    Hubo un error al momento de actualizar el cliente POS, intente de nuevo.
                    Si el problema persiste por favor comuniquese con el área de sistemas.`,
                  icon: "error",
                  confirmButtonText: "Aceptar",
                });
              });

          })
        }
      });
  };

  //manejador del input para el porducto
  const handlerChangeCliente = (e) => {
    const { value } = e.target;
    setClienteSeleccionado(null);
    if (value !== "" && value !== null) {
      const filter = clientsPOS.filter((elem) =>
        elem.razonSocial.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestionsClients(filter);
    } else {
      setSuggestionsClients(clientsPOS);
      setClienteSeleccionado(null)
      setSearch({
        direccion:'',
        id:'',
        plazo:'',
        razonSocial:'',
        telefono:''
      })
    }
    refClient.current.selectedIndex = 0;
    setSearch({
      ...search,
      razonSocial: value
    })
  };

  //funcion para buscar producto por descripcion cuando lo seleccionen en el select
  const findCientByDescrip = (e) => {
    const { value } = e.target;
    const item = clientsPOS.find((elem)=> elem.razonSocial.toLowerCase() === value.toLowerCase());
    if(item){
      setClienteSeleccionado(item)
      setSearch(item)
      const foto = `local_${item.id}.jpg`
      const directFoto = `${config.apiUrl2}/upload/obtener-archivo/${foto}`
      const url = verificarArchivo(directFoto)
      if(url){
        setFoto(url);
      }
    }else{
      setClienteSeleccionado(null)
      setSearch({
        direccion:'',
        id:'',
        plazo:'',
        razonSocial:'',
        telefono:''
      })
    }
  }

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
      if (isConfirmed) {
        setSearch({
          direccion:'',
          plazo:'',
          telefono:'',
          id:'',
          razonSocial:'',
        })
        setAgencia(null)
        setPreviewPhoto(null);
        setEditando(false);
        setClienteSeleccionado(null);
        setSuggestionsClients([]);
        navigate('/clientes/pos');
      }
    });
  };

  const refreshUpdate= () => {
    Swal.fire({
      title: "¿Está seguro?",
      text: "Se descartará todo el proceso que lleva",
      icon: "warning",
      confirmButtonText: "Aceptar",
      confirmButtonColor: "#dc3545",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        setSearch({
          direccion:'',
          plazo:'',
          telefono:'',
          razonSocial:'',
          id:'',
        })
        setAgencia(null);
        setPreviewPhoto(null);
        setEditando(false);
        setClienteSeleccionado(null);
        setSuggestionsClients([]);
        navigate('/clientes/pos')
      }
    });
  };
  
/* Logica para tomar la foto de evidencia */
  //se agrega toda esta parte
  const camaraRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const startCamera = async () => {
    try {
      const backStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: "environment" } },
        audio: false,
      });
      setStream(backStream);
      if (camaraRef.current) {
        camaraRef.current.srcObject = backStream;
      }
    } catch (err) {
      alert("❌ Cámara trasera no disponible. Probando cámara frontal...");
      try {
        const frontStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });
        setStream(frontStream);
        if (camaraRef.current) {
          camaraRef.current.srcObject = frontStream;
        }
      } catch (fallbackErr) {
        console.error("❌ No se pudo acceder a ninguna cámara:", fallbackErr);
        setError("No se encontró ninguna cámara en el dispositivo.");
      }
    }
  };
  // Abrir el modal para un campo específico
  const openModal = (e) => {
    setShowModal(true);
    /* setPreviewPhoto(null); */ // Resetear previsualización
  };
  // Cerrar el modal
  const closeModal = (e) => {
    setShowModal(false);
    
    /* Se agrega esta parte */
    // 🔴 Detener la cámara después de capturar la imagen
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (camaraRef.current) {
      camaraRef.current.srcObject = null;
    }
    /*  */
    /* setPreviewPhoto(null); */ // Resetear previsualización
  };
  // Capturar la foto y guardarla en el estado correspondiente
  const capturePhoto = () => {
    const video = camaraRef.current;
    const canvas = canvasRef.current;

    if (video && canvas && canvas.getContext) {
      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg");
      setPreviewPhoto(dataUrl);

      // 🔴 Detener la cámara después de capturar la imagen
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
  };

  //descartar foto en el modal
  const discardPhoto = (e) => {
    setPreviewPhoto(null); // Mostrar previsualización
    setEvidence(null);
    setTypeEvidence('Foto');
    startCamera(e);
  };
  // Guardar la foto en el estado correspondiente
  const savePhoto = async () => {
    const response = await fetch(previewPhoto);
    const imageBlob = await response.blob();
    setEvidence((imageBlob))
    closeModal();
  };
  // Subir una imagen desde el dispositivo
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewPhoto(event.target.result); // Mostrar previsualización
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      className="container d-flex flex-column w-100 py-3 mt-5"
      style={{ fontSize: 10.5 }}
    >
      <section className="div-top justify-content-between align-items-center mb-2">
        <div className="d-flex flex-column">
          <h1 className="text-center fs-5 fw-bold">{editando ? 'EDITAR' : 'AGREGAR'} CLIENTE POS</h1>
        </div>
        <div className="d-flex flex-column">
          <h1 className="fs-6 fw-bold m-0">EL GRAN LANGOSTINO S.A.S.</h1>
          <label className="fw-bold">Nit: 835001216</label>
          <label>Tel: 5584982 - 3155228124</label>
        </div>
      </section>
      <form className="" onSubmit={editando ? handleUpdate : handleSubmit}>
        <div className="bg-light rounded shadow-sm p-3 mb-3">
          <div className="d-flex flex-column gap-1">
            <div>
              <label className="fw-bold">CENTRO DE OPERACIÓN</label>
              {editando ?
                <input
                  id="razonSocial"
                  autoComplete="off"
                  value={(search.coId !== null && search.coId !== '') ? `${search.coId} - ${search.coDescription}` : ''}
                  onChange={(e) => handlerChangeSearch(e)}
                  className="form-control form-control-sm"
                  style={{textTransform:'uppercase'}}
                  disabled
                />
                :
                <select
                  ref={selectBranchRef}
                  className="form-select form-select-sm"
                  /* value={(agencia)} */
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
              }
            </div>
            <div>
              <label className="fw-bold">CLIENTE</label>
              <div className="row row-cols-sm-2">
                <div className='d-flex flex-column'>
                  <label className='me-2'>Razón social</label>
                  {editando ?
                    <div className="d-flex align-items-center position-relative w-100">
                      <input
                        id="razonSocial"
                        type="search"
                        autoComplete="off"
                        placeholder="Selecciona un producto"
                        value={
                          clienteSeleccionado ?
                          clienteSeleccionado.razonSocial :
                          search?.razonSocial
                        }
                        onChange={handlerChangeCliente}
                        className="form-control form-control-sm input-select"
                        style={{textTransform:'uppercase'}}
                        disabled = {clienteSeleccionado}
                      />
                      <select
                        ref={refClient}
                        id="razonSocial"
                        className="form-select form-select-sm"
                        /* value={
                          clienteSeleccionado && clienteSeleccionado.razonSocial
                        } */
                        onChange={(e)=>findCientByDescrip(e)}
                        
                        disabled = {clienteSeleccionado}
                      >
                        <option value="" selected disabled>
                          -- SELECCIONE EL CLIENTE --
                        </option>
                        {suggestionsClients
                          ?.sort((a,b)=>a.id - b.id)
                          .map((elem) => (
                          <option key={elem.id} value={elem.razonSocial}>
                            {elem.razonSocial}
                          </option>
                        ))}
                      </select>
                    </div>
                    :
                    <div className="d-flex flex-column align-items-start">
                      <input
                        id="razonSocial"
                        autoComplete="off"
                        placeholder="INGRESE LA RAZON SOCIAL DEL CLIENTE"
                        value={search.razonSocial}
                        onChange={(e) => handlerChangeSearch(e)}
                        className="form-control form-control-sm"
                        style={{textTransform:'uppercase'}}
                      />
                    </div>
                  }
                </div>
                <div className="d-flex flex-column align-items-start">
                  <label>Teléfono:</label>
                  <input
                    id="telefono"
                    type="number"
                    value={search.telefono}
                    className="form-control form-control-sm"
                    placeholder="INGRESE EL TELÉFONO DEL CLIENTE"
                    onChange={(e) => { handlerChangeSearch(e)}}
                    min={0}
                    required
                  />
                </div>
              </div>
              <div className="row row-cols-sm-2 mt-1">
                <div className="d-flex flex-column align-items-start">
                  <label>Dirección:</label>
                  <input
                    id="direccion"
                    type="text"
                    value={search.direccion}
                    onChange={(e) => handlerChangeSearch(e)}
                    className="form-control form-control-sm"
                    placeholder="INGRESE LA DIRECCIÓN DEL CLIENTE"
                    required
                    style={{textTransform:'uppercase'}}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label>Plazo del crédito</label>
                  <select
                    id="plazo"
                    ref={selectPlazoRef}
                    value={search.plazo}
                    className="form-select form-select-sm"
                    onChange={(e) => handlerChangeSearch(e)}
                    required
                  >
                    <option selected value="" disabled>
                      -- Seleccione el plazo del crédito --
                    </option>
                    <option value='1'>1 día</option>
                    <option value='8'>8 días</option>
                    <option value='15'>15 días</option>
                  </select>
                  </div>
            </div>
            </div>
            <hr className="my-1" />
            <div className="row row-cols-sm-2">
              <div className="d-flex flex-column align-items-start">
                <label>Creador por:</label>
                <input
                  type="text"
                  value={editando ? search.createdBy : user.name}
                  className="form-control form-control-sm"
                  disabled
                />
              </div>
              <div className="d-flex flex-column align-items-start">
                <label>Fecha creación:</label>
                <input
                  type={editando ? 'text' : 'date'}
                  value={editando ?  new Date(search.createdAt).toLocaleString("es-CO") : new Date().toISOString().split("T")[0]}
                  className="form-control form-control-sm"
                  disabled
                />
              </div>
            </div>
            <hr className="my-1" />
            {(
              search.updatedAt !== null && search.updatedAt !== '' &&
              search.updatedBy !== null && search.updatedBy !== '' && editando
            ) &&
              <div>  
                <div className="row row-cols-sm-2">
                  <div className="d-flex flex-column align-items-start">
                    <label>Actualizado por:</label>
                    <input
                      type="text"
                      value={editando ? search.updatedBy : user.name}
                      className="form-control form-control-sm"
                      disabled
                    />
                  </div>
                  <div className="d-flex flex-column align-items-start">
                    <label>Fecha actualización:</label>
                    <input
                      type={editando ? 'text' : 'date'}
                      value={editando ?  new Date(search.updatedAt).toLocaleString("es-CO") : new Date().toISOString().split("T")[0]}
                      className="form-control form-control-sm"
                      disabled
                    />
                  </div>
                </div>
                <hr className="my-1" />
              </div>
            }
            <div className="w-100">
              <div className="row row-cols-sm-2 mb-1">
                <label className="fw-bold">FOTO DEL ESTABLECIMIENTO</label>
                <div className="d-flex flex-row">
                  {(foto && editando) &&
                    <a 
                      className="" 
                      style={{fontSize:12}} 
                      href={foto} 
                      download={`local_${search.id}_${search.razonSocial}.jpg`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaFileDownload />Descargar evidencia
                    </a>
                  }
                </div>
              </div>
              <div className="mt-1">
                <div
                  style={{
                    width: "100%",
                    height: 30,
                    border: (previewPhoto) ? "2px solid green" : "2px solid #ccc",
                    display: "flex", 
                    justifyContent: "center",
                    alignItems: "center",
                    cursor: "pointer",
                    borderRadius: 5
                  }}
                  onClick={(e) => (openModal("backTp","Tarjeta de propiedad trasera"), setTypeEvidence('Foto'), startCamera(e))}
                >
                  {previewPhoto ? (
                    <div
                      style={{color:'green'}}  
                    >
                      Haz Click aquí para ver la foto
                    </div>
                  ):"Haz Click aquí para tomar la foto"}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Modal para tomar fotos */}
        <Modal show={showModal} onHide={closeModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>Capturar evidencia:</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {(!previewPhoto && typeEvidence === 'Foto') ? (
              <div>
                <video
                  ref={camaraRef}
                  autoPlay
                  playsInline
                  style={{ width: '100%', height: '100%', border: '2px solid #ccc', borderRadius: '10px' }}
                />                
                <canvas ref={canvasRef} style={{ display: "none" }} />
              </div>
            ):( typeEvidence === 'Foto' &&
              <img
                src={previewPhoto}
                alt="Previsualización"
                style={{ width: '100%', height: '100%', border: '2px solid #ccc', borderRadius: '10px' }}
              />
            )}
          </Modal.Body>
          <Modal.Footer>
            {typeEvidence === null &&
              <div className="d-flex gap-2">
                <button
                  onClick={(e)=>(setTypeEvidence('Foto'), startCamera(e))}
                  style={{
                    padding: "10px 20px",
                    fontSize: "16px",
                    backgroundColor: "#007bff",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                  }}
                >
                  Foto
                </button>
              </div>
            }
            {typeEvidence === 'Foto' &&
              <div>
              {!previewPhoto ? (
                <div className="d-flex gap-2">
                  <button
                    onClick={(e)=>capturePhoto(e)}
                    style={{
                      padding: "10px 20px",
                      fontSize: "16px",
                      backgroundColor: "#007bff",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                    }}
                  >
                    Capturar
                  </button>
                  <label
                    style={{
                      padding: "10px 20px",
                      fontSize: "16px",
                      backgroundColor: "#6c757d",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    Subir
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUpload}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
              ) : (
                <>
                  <button
                    onClick={savePhoto}
                    style={{
                      padding: "10px 20px",
                      fontSize: "16px",
                      backgroundColor: "#28a745",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      marginRight: "10px",
                    }}
                  >
                    Guardar
                  </button>
                  <button
                    onClick={(e) => discardPhoto(e)}
                    style={{
                      padding: "10px 20px",
                      fontSize: "16px",
                      backgroundColor: "#dc3545",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                    }}
                  >
                    Descartar
                  </button>
                </>
                )} 
                </div> 
              }
            </Modal.Footer>
          </Modal>
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
        {editando ? 
          <div className="div-top gap-3 mb-3">
            <button
              type="submit"
              className="btn btn-sm btn-success fw-bold w-100"
            >
              ACTUALIZAR
            </button>
            <button
              type="button"
              className="btn btn-sm btn-danger fw-bold w-100"
              onClick={refreshUpdate}
            >
              DESCARTAR
            </button>
          </div>
          :
          <div className="div-top gap-3 mb-3">
            <button
              type="submit"
              className="btn btn-sm btn-success fw-bold w-100"
            >
              CREAR
            </button>
            {/* <button
              onClick={(e)=>setEditando(true)}
              className="btn btn-sm btn-primary fw-bold w-100"
            >
              EDITAR
            </button> */}
            <button
              type="button"
              className="btn btn-sm btn-danger fw-bold w-100"
              onClick={refreshForm}
            >
              CANCELAR
            </button>
          </div>
        }
      </form>
    </div>
  );
}
