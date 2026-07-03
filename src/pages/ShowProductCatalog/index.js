import { useEffect, useState, useContext, useRef, useCallback } from "react";
import ComboBox from "../../components/ComboBox";
import AddProducts from "../../components/AddProducts";
import AuthContext from "../../context/authContext";
import { createOrder, deleteOrder } from "../../services/orderService";
import { getAllAgencies } from "../../services/agencyService";
import { sendMail } from "../../services/mailService";
import { useNavigate, useParams } from "react-router-dom";
import { findOneCatalog , updateCatalogo, updateProdCatalog, verificarArchivo } from '../../services/catalogService'
import QuickPinchZoom, { makeHandlers } from 'react-quick-pinch-zoom';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { RiArrowGoBackFill } from "react-icons/ri";
import { Modal , Form } from "react-bootstrap";
import { styled } from '@mui/material/styles';
import { IoIosSave } from "react-icons/io";
import Button from '@mui/material/Button';
import { MdCancel } from "react-icons/md";
import { FiEdit3 } from "react-icons/fi";
import { config } from "../../config";
import Swal from "sweetalert2";
import "./styles.css";
import { sendEvidence } from "../../services/photoService";

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export default function ShowProductCatalog() {
  const { id } = useParams();
  const [data, setData] = useState({});
  const [info, setInfo] = useState({});
  const {user, setUser} = useContext(AuthContext);
  const [agencia, setAgencia] = useState(null);
  const [agencias, setAgencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  //variables de imagenes cargadas
  const [imgEmp, setImgEmp] = useState('');
  const [imgEmb, setImgEmb] = useState('');
  const [imgPres, setImgPres] = useState('');
  const [barCode, setBarCode] = useState('');

  //cargar imagenes
  const [uploadImgEmp, setUploadImgEmp] = useState('');
  const [uploadImgEmb, setIUploadmgEmb] = useState('');
  const [uploadImgPres, setUploadImgPres] = useState('');
  const [uploadBarCode, setUploadBarCode] = useState('');

  //imagen del modal
  const [imgSelected,setImgSelected] = useState('');
  const navigate = useNavigate();
  
  const [showModal, setShowModal] = useState(false);
  const closeModal = () => {
    setShowModal(false);
  };
  const openModal = (e, id) => {
    setShowModal(true);
    setImgSelected(id)
  };

  useEffect(() => {
    if(user && (user.role === 'admin' || user.role === 'vendedor' || user.role === 'comercial')){
      setLoading(true)
      findOneCatalog(id)
      .then(async({data})=>{
        setData(data);
        setInfo(data);

        const emp = `${id}-EMP.jpg`
        const emb = `${id}-EMB.jpg`
        const pres = `${id}-PRES.jpg`
        const bar = `${id}-BAR.jpg`
        const fotoEmp = `${config.apiUrl2}/catalog/obtener-archivo/${emp}`
        const fotoEmb = `${config.apiUrl2}/catalog/obtener-archivo/${emb}`
        const fotoPres = `${config.apiUrl2}/catalog/obtener-archivo/${pres}`
        const fotoBar = `${config.apiUrl2}/catalog/obtener-archivo/${bar}`
        const url = await verificarArchivo(fotoEmp)
        const url2 = await verificarArchivo(fotoEmb)
        const url3 = await verificarArchivo(fotoPres)
        const url4 = await verificarArchivo(fotoBar)
        if(url){
          setImgEmp(url)
          setUploadImgEmp(url)
        }
        if(url2){
          setImgEmb(url2)
          setIUploadmgEmb(url2)
        }
        if(url3){
          setImgPres(url3)
          setUploadImgPres(url3)
        }
        if(url4){
          setBarCode(url4)
          setUploadBarCode(url4)
        }
        setLoading(false)
      })
    }
  }, []);

  const handlerChangeInfo = (e) => {
    const { id, value } = e.target;
    console.log(value);
    setInfo({
      ...info,
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

  const handleUpdate = (e) => {
    e.preventDefault();
      Swal.fire({
        title: "¿Está seguro?",
        text: `Se realizará la actualización del producto: ${id}`,
        icon: "warning",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#198754",
        showCancelButton: true,
        cancelButtonText: "Cancelar",
      }).then(({ isConfirmed }) => {
        if (isConfirmed) {
          setLoading(true);
          updateProdCatalog(id, info)
          .then( async ({ data }) => {
              const f = new FormData();
              if(uploadImgEmp !== ''){
                const response = await fetch(uploadImgEmp);
                const imageBlob = await response.blob();
                f.append('evidence',imageBlob, `${id}-EMP.jpg`)
                f.append('tipo', 'EMP')
                f.append('id', id)
              }
              if(uploadImgEmb !== ''){
                const response = await fetch(uploadImgEmb);
                const imageBlob = await response.blob();
                f.append('evidence',imageBlob, `${id}-EMB.jpg`)
                f.append('tipo', 'EMB')
                f.append('id', id)
              }
              if(uploadImgPres !== ''){
                const response = await fetch(uploadImgPres);
                const imageBlob = await response.blob();
                f.append('evidence',imageBlob, `${id}-PRES.jpg`)
                f.append('tipo', 'PRES')
                f.append('id', id)
              }
              if(uploadBarCode !== ''){
                const response = await fetch(uploadBarCode);
                const imageBlob = await response.blob();
                f.append('evidence',imageBlob, `${id}-BAR.jpg`)
                f.append('tipo', 'BAR')
                f.append('id', id)
              }
              sendEvidence(f)
              .then(()=>{
                setLoading(false);
                Swal.fire({
                  title: "¡Actualización exitosa!",
                  text: `
                    El producto se ha actualizado de manera satisfactoria.
                  `,
                  icon: "success",
                  confirmButtonText: "Aceptar",
                }).then(() => {
                  window.location.reload();
                });
              })
              .catch((err) => {
                setLoading(false);
                Swal.fire({
                  title: "¡Ha ocurrido un error!",
                  text: `${err}
                    `,
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
                  Hubo un error al momento de guardar la información, intente de nuevo.
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
      if (isConfirmed) {
        setData({});
        setInfo({});
        setEditing(false);
        navigate('/commercial/catalog')
      };
    });
  };

  const handleSetEdit = (e) => {
    e.preventDefault();
    setEditing(true)
  }

  const pZRef = useRef(null);

  const onUpdate = useCallback(({ x, y, scale }) => {
    const { current: img } = pZRef;
    if (img) {
      const value = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
      img.style.transform = value;
    }
  }, []);

  //logica para saber si es celular
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900); // Establecer a true si la ventana es menor o igual a 768px
    };

    // Llama a handleResize al cargar y al cambiar el tamaño de la ventana
    window.addEventListener('resize', handleResize);
    handleResize(); // Llama a handleResize inicialmente para establecer el estado correcto

    // Elimina el event listener cuando el componente se desmonta
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Subir una imagen desde el dispositivo
  const handleUpload = (e) => {
    const file = e.target.files[0];
    const { id } = e.target;
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if(id === 'emp'){
          setUploadImgEmp(event.target.result)
        }else if(id === 'emb'){
          setIUploadmgEmb(event.target.result)
        }else if(id === 'pres'){
          setUploadImgPres(event.target.result)
        }else if(id === 'bar'){
          setUploadBarCode(event.target.result)
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      className="container d-flex flex-column w-100 py-3 mt-5"
      style={{ fontSize: 10.5 }}
    >
      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title className='d-flex justify-content-center w-100 fw-bold' style={{fontSize: isMobile ? '16px':'25px'}}>Imagen del {imgSelected === 'emp' ? 'producto' : 'empaque'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="formWeight">
            <div className="d-flex flex-column align-items-center mb-1 mt-2" style={{ background: '#f8f9fa', borderRadius: '10px', overflow: 'hidden' }}>
              {/* TransformWrapper controla los límites de zoom (mínimo 1x, máximo 8x) */}
              <TransformWrapper
                initialScale={1}
                minScale={1} 
                maxScale={8}
                centerOnInit={true}
              >
                {({ zoomIn, zoomOut, resetTransform }) => (
                  <>
                    {/* <div className="d-flex gap-2 mb-2 p-2" style={{ position: 'absolute', zIndex: 10 }}>
                      <button type="button" className="btn btn-sm btn-dark" onClick={() => zoomIn()}>➕</button>
                      <button type="button" className="btn btn-sm btn-dark" onClick={() => zoomOut()}>➖</button>
                      <button type="button" className="btn btn-sm btn-dark" onClick={() => resetTransform()}>🔄 Reiniciar</button>
                    </div> */}

                    {/* El componente que renderiza la imagen */}
                    <TransformComponent wrapperStyle={{ width: "100%", maxHeight: "72vh", cursor: 'zoom-in' }}>
                      <img
                        src={imgSelected === 'emp' ? imgEmp : imgEmb}
                        alt="Previsualización"
                        style={{ 
                          width: '100%', 
                          height: 'auto',
                          maxHeight: '72vh',
                          cursor: 'pointer'
                        }}
                      />
                    </TransformComponent>
                  </>
                )}
              </TransformWrapper>
            </div>
          {/* <div className="d-flex flex-column mb-1 mt-2">
            <img
              src={imgSelected === 'emp' ? imgEmp : imgEmb}
              alt="Previsualización"
              className="h-100"
              style={{ border: '2px solid #ccc', borderRadius: '10px' , cursor: 'pointer'}}
            />
          </div> */}
          </Form.Group>
        </Modal.Body>
      </Modal>
      <section className="d-flex flex-row justify-content-between align-items-center mb-2">
        <div className="d-flex flex-column">
          <h1 className="fs-6 fw-bold m-0">EL GRAN LANGOSTINO S.A.S.</h1>
          <span className="fw-bold">Nit: 835.001.216-8</span>
          <span>Tel: 5584982 - 3155228124</span>
        </div>
      </section>
      <form className="">
        <div className="bg-light rounded shadow-sm p-3 mb-3">
          <div className="d-flex flex-column gap-1">
            <div>
              <label className="fw-bold">CARACTERISTICAS DE PRODUCTO</label>
              <div className="row row-cols-sm-4">
                <div className="d-flex flex-column align-items-start">
                  <label>Referencia:</label>
                  <input
                    id="id"
                    type="number"
                    value={editing ? info.id : data.id}
                    disabled
                    className="form-control form-control-sm"
                    autoComplete="off"
                    required
                  />
                </div>
                <div className="d-flex flex-column align-items-start">
                  <label>Descripción:</label>
                  <input
                    id="description"
                    type="text"
                    value={editing ? info.description : data.description}
                    disabled={editing ? false : true}
                    onChange={(e)=>handlerChangeInfo(e)}
                    className="form-control form-control-sm"
                    autoComplete="off"
                    required
                  />
                </div>
                <div className="d-flex flex-column align-items-start">
                  <label>U.M.:</label>
                  <input
                    id="um"
                    type="text"
                    value={editing ? info.um : data.um}
                    disabled={editing ? false : true}
                    onChange={(e)=>handlerChangeInfo(e)}
                    className="form-control form-control-sm"
                    autoComplete="off"
                    required
                  />
                </div>
                <div className="d-flex flex-column align-items-start">
                  <label>Ref. alterna:</label>
                  <input
                    id="alternateRef"
                    type="text"
                    value={editing ? info.alternateRef : data.alternateRef}
                    onChange={(e)=>handlerChangeInfo(e)}
                    disabled={editing ? false : true}
                    className="form-control form-control-sm"
                    autoComplete="off"
                    required
                  />
                </div>
              </div>
            </div>
            {isMobile &&
              <hr className="my-1" />
            }
            {isMobile ? 
              <div>
                <div className="row row-cols-sm-2 gap-2 mt-2">
                  {/* img producto y empaque */}
                  <div className="d-flex justify-content-center flex-column" style={{height: '45vh'}}>
                    <label className="fw-bold" style={{fontSize: isMobile ? 13 : 18}}>Imagen del producto:</label>
                    <Button
                      id="emp"
                      component="label"
                      role={undefined}
                      variant="contained"
                      className='w-100 me-2'                  
                      color={uploadImgEmp ? 'success' : 'primary'}
                      startIcon={uploadImgEmp ? <CheckCircleOutlineIcon /> : <CloudUploadIcon />}
                    >
                      {uploadImgEmp ? 'Archivo cargado' : 'Subir imagen'}
                      <VisuallyHiddenInput
                        id="emp"
                        type="file"
                        onChange={(e)=>handleUpload(e)}
                        accept="image/*"
                      />
                    </Button>
                    {imgEmp ?
                      <img
                      src={imgEmp}
                      alt="Previsualización"
                      className="h-100"
                      style={{ border: '2px solid #ccc', borderRadius: '10px' , cursor: 'pointer'}}
                      onClick={(e)=>openModal(e,'emp')}
                      />
                      :
                      <small className="text-muted d-block text-center d-flex h-100 justify-content-center align-items-center" style={{fontSize: 13}}>No se ha subido esta imagen aún</small>
                    }
                  </div> 
                  <div className="d-flex justify-content-center flex-column" style={{height: '45vh'}}>
                    <label className="fw-bold" style={{fontSize: isMobile ? 13 : 18}}>Imagen del empaque:</label>
                    {imgEmb ?
                      <img
                        src={imgEmb}
                        alt="Previsualización"
                        className="d-flex h-100"
                        style={{ border: '2px solid #ccc', borderRadius: '10px' , cursor: 'pointer'}}
                        onClick={(e)=>openModal(e,'emb')}
                      />
                      :
                      <small className="text-muted d-block text-center d-flex h-100 justify-content-center align-items-center" style={{fontSize: 13}}>No se ha subido esta imagen aún</small>
                    }
                  </div> 

                  {/* bolsa de presentación y codigo de barras */}
                  <div className="d-flex justify-content-center flex-column" style={{height: '45vh'}}>
                    <label className="fw-bold" style={{fontSize: isMobile ? 13 : 18}}>Imagen presentación:</label>
                    {imgPres ?
                      <img
                        src={imgPres}
                        alt="Previsualización"
                        className="d-flex h-100"
                        style={{ border: '2px solid #ccc', borderRadius: '10px' , cursor: 'pointer'}}
                        onClick={(e)=>openModal(e,'pres')}
                      />
                      :
                      <small className="text-muted d-block text-center d-flex h-100 justify-content-center align-items-center" style={{fontSize: 13}}>No se ha subido esta imagen aún</small>
                    }
                  </div> 
                  <div className="d-flex justify-content-center flex-column" style={{height: '45vh'}}>
                    <label className="fw-bold" style={{fontSize: isMobile ? 13 : 18}}>Código de barras:</label>
                    {barCode ?
                      <img
                        src={barCode}
                        alt="Previsualización"
                        className="d-flex h-100"
                        style={{ border: '2px solid #ccc', borderRadius: '10px' , cursor: 'pointer'}}
                        onClick={(e)=>openModal(e,'bar')}
                      />
                      :
                      <small className="text-muted d-block text-center d-flex h-100 justify-content-center align-items-center" style={{fontSize: 13}}>No se ha subido esta imagen aún</small>
                    }
                  </div> 
                </div>
              </div>
              :
              /* codigo para imagenes en computador */
              <div>
                {/* img producto y empaque */}
                <div className="row row-cols-sm-2 mt-3">
                    <label className="fw-bold" style={{fontSize: 13}}>Imagen del producto:</label>
                    <label className="fw-bold" style={{fontSize: 13}}>Imagen del empaque:</label>
                </div>
                <div className="row row-cols-sm-2">
                  <div className="d-flex justify-content-center" style={{height: '45vh'}}>
                    {(!editing && imgEmp) ?
                      <img
                        src={imgEmp}
                        alt="Previsualización"
                        className="h-100"
                        style={{ border: '2px solid #ccc', borderRadius: '10px' , cursor: 'pointer'}}
                        onClick={(e)=>openModal(e,'emp')}
                      />
                      : (editing && uploadImgEmp) ?
                        <img
                          src={uploadImgEmp}
                          alt="Previsualización"
                          className="d-flex h-100"
                          style={{ border: '2px solid #ccc', borderRadius: '10px' , cursor: 'pointer'}}
                          onClick={(e)=>openModal(e,'emb')}
                        />
                        :
                        <small className="text-muted d-block text-center d-flex h-100 justify-content-center align-items-center" style={{fontSize: 13}}>No se ha subido esta imagen aún</small>
                    }
                  </div> 
                  <div className="d-flex justify-content-center" style={{height: '45vh'}}>
                    {(!editing && imgEmb) ?
                      <img
                        src={imgEmb}
                        alt="Previsualización"
                        className="d-flex h-100"
                        style={{ border: '2px solid #ccc', borderRadius: '10px' , cursor: 'pointer'}}
                        onClick={(e)=>openModal(e,'emb')}
                      />
                      : (editing && uploadImgEmb) ?
                        <img
                          src={uploadImgEmb}
                          alt="Previsualización"
                          className="d-flex h-100"
                          style={{ border: '2px solid #ccc', borderRadius: '10px' , cursor: 'pointer'}}
                          onClick={(e)=>openModal(e,'emb')}
                        />
                        :
                        <small className="text-muted d-block text-center d-flex h-100 justify-content-center align-items-center" style={{fontSize: 13}}>No se ha subido esta imagen aún</small>
                    }
                  </div> 
                </div>
                {editing &&
                  <div className="row row-cols-sm-2 mt-1">
                    <div>
                      <Button
                        id="emp"
                        component="label"
                        role={undefined}
                        variant="contained"
                        className="d-flex"
                        color={imgEmp ? 'success' : 'primary'}
                        startIcon={imgEmp ? <CheckCircleOutlineIcon /> : <CloudUploadIcon />}
                      >
                        {imgEmp !== '' ? 'Archivo cargado' : 'Subir imagen'}
                        <VisuallyHiddenInput
                          id="emp"
                          type="file"
                          onChange={(e)=>handleUpload(e)}
                          accept="image/*"
                        />
                      </Button>
                    </div>
                    <div>
                      <Button
                        id="emb"
                        component="label"
                        role={undefined}
                        variant="contained"
                        className="d-flex"
                        color={imgEmb ? 'success' : 'primary'}
                        startIcon={imgEmb ? <CheckCircleOutlineIcon /> : <CloudUploadIcon />}
                      >
                        {imgEmb !== '' ? 'Archivo cargado' : 'Subir imagen'}
                        <VisuallyHiddenInput
                          id="emb"
                          type="file"
                          onChange={(e)=>handleUpload(e)}
                          accept="image/*"
                        />
                      </Button>
                    </div>
                  </div> 
                }

                {/* bolsa de presentación y codigo de barras */}
                <div className="row row-cols-sm-2 mt-3">
                    <label className="fw-bold" style={{fontSize: 13}}>Imagen presentación:</label>
                    <label className="fw-bold" style={{fontSize: 13}}>Código de barras:</label>
                </div>
                <div className="row row-cols-sm-2">
                  <div className="d-flex justify-content-center" style={{height: '45vh'}}>
                    {(!editing && imgPres) ?
                      <img
                        src={imgPres}
                        alt="Previsualización"
                        className="h-100"
                        style={{ border: '2px solid #ccc', borderRadius: '10px' , cursor: 'pointer'}}
                        onClick={(e)=>openModal(e,'pres')}
                      />
                      : (editing && uploadImgPres) ?
                        <img
                          src={uploadImgPres}
                          alt="Previsualización"
                          className="h-100"
                          style={{ border: '2px solid #ccc', borderRadius: '10px' , cursor: 'pointer'}}
                          onClick={(e)=>openModal(e,'pres')}
                        />
                        :
                        <small className="text-muted d-block text-center d-flex h-100 justify-content-center align-items-center" style={{fontSize: 13}}>No se ha subido esta imagen aún</small>
                    }
                  </div> 
                  <div className="d-flex justify-content-center" style={{height: '45vh'}}>
                    {(!editing && barCode) ?
                      <img
                        src={barCode}
                        alt="Previsualización"
                        className="d-flex h-100"
                        style={{ border: '2px solid #ccc', borderRadius: '10px' , cursor: 'pointer'}}
                        onClick={(e)=>openModal(e,'bar')}
                      />
                      : (editing && uploadBarCode) ?
                        <img
                          src={uploadBarCode}
                          alt="Previsualización"
                          className="d-flex h-100"
                          style={{ border: '2px solid #ccc', borderRadius: '10px' , cursor: 'pointer'}}
                          onClick={(e)=>openModal(e,'bar')}
                        />
                        :
                        <small className="text-muted d-block text-center d-flex h-100 justify-content-center align-items-center" style={{fontSize: 13}}>No se ha subido esta imagen aún</small>
                    }
                  </div> 
                </div>
                {editing &&
                  <div className="row row-cols-sm-2 mt-1">
                    <div>
                      <Button
                        id="pres"
                        component="label"
                        role={undefined}
                        variant="contained"
                        className="d-flex"
                        color={imgPres ? 'success' : 'primary'}
                        startIcon={imgPres ? <CheckCircleOutlineIcon /> : <CloudUploadIcon />}
                      >
                        {imgPres !== '' ? 'Archivo cargado' : 'Subir imagen'}
                        <VisuallyHiddenInput
                          id="pres"
                          type="file"
                          onChange={(e)=>handleUpload(e)}
                          accept="image/*"
                        />
                      </Button>
                    </div>
                    <div>
                      <Button
                        id="bar"
                        component="label"
                        role={undefined}
                        variant="contained"
                        className="d-flex"
                        color={barCode ? 'success' : 'primary'}
                        startIcon={barCode ? <CheckCircleOutlineIcon /> : <CloudUploadIcon />}
                      >
                        {barCode !== '' ? 'Archivo cargado' : 'Subir imagen'}
                        <VisuallyHiddenInput
                          id="bar"
                          type="file"
                          onChange={(e)=>handleUpload(e)}
                          accept="image/*"
                        />
                      </Button>
                    </div>
                  </div> 
                }
              </div>
            }
          </div>
        </div>
        <div className="d-flex flex-column mb-3">
          <label className="fw-bold">OBSERVACIONES</label>
          <textarea
            id="observations"
            className="form-control"
            value={editing ? info.observations : data.observations}
            onChange={handlerChangeInfo}
            autoComplete="off"
            style={{ minHeight: 70, maxHeight: 100, fontSize: 12 }}
            disabled={editing ? false : true}
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
        <div className="d-flex flex-row gap-3 mb-3">
          {(!editing && (user.role === 'admin' || user.role === 'comercial')) ?
            <button
              className="btn btn-sm btn-primary fw-bold w-100"
              onClick={(e)=>handleSetEdit(e)}
            >
              <FiEdit3 /> EDITAR
            </button>
            : (user.role === 'admin' || user.role === 'comercial') &&
            <button
              onClick={(e)=>handleUpdate(e)}
              className="btn btn-sm btn-success fw-bold w-100"
            >
              <IoIosSave /> GUARDAR
            </button>
          }
          {!editing ?
            <button
              type="button"
              className="btn btn-sm btn-secondary fw-bold w-100"
              onClick={(e)=>navigate('/commercial/catalog')}
            >
              <RiArrowGoBackFill /> VOLVER
            </button>
            :
            <button
              type="button"
              className="btn btn-sm btn-danger fw-bold w-100"
              onClick={refreshForm}
            >
              <MdCancel /> CANCELAR
            </button>
          }
        </div>
      </form>
    </div>
  );
}
