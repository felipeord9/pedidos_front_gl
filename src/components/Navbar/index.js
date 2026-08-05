import { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as FiIcons from "react-icons/fi";
import * as FaIcons from "react-icons/fa";
import AuthContext from "../../context/authContext";
import useUser from "../../hooks/useUser";
import { NavBarData } from "./NavbarData";
import Badge from '@mui/material/Badge';
import Stack from '@mui/material/Stack';
import { LuRefreshCcw } from "react-icons/lu";
import { compareProducts, create2, createCatalogo, findCatalog, update2 } from "../../services/catalogService";
import { updateNotification } from "../../services/notificationService";
import { Modal, Button, Form } from "react-bootstrap";
import Logo from "../../assets/logo-el-gran-langostino.png";
import Swal from 'sweetalert2'
import "./styles.css";

export default function Navbar() {
  const { isLogged, logout } = useUser();
  const [showSideBar, setShowSidebar] = useState(false);
  const { user, setUser } = useContext(AuthContext);
  const [buscando, setBuscando] = useState(false);
  const navigate = useNavigate();

  //modal para crear
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const closeModal = () => {
    setSelectedProduct('');
    setShowModal(false);
  };
  const openModal = (e, notifi) => {
    setShowModal(true);
    setSelectedProduct(notifi)
  };

  //modal para editar
  const [showModalUpdate, setShowModalUpdate] = useState(false);
  const closeModalUpdate = () => {
    setSelectedProduct('');
    setShowModalUpdate(false);
  };
  const openModalUpdate = (e, notifi) => {
    setSelectedProduct(notifi)
    setShowModalUpdate(true);
  };

  const handleClickImg = (e) => {
    if(user.role==='aprobador'){
      return navigate('/clientes/pos')
    }else if (user.role==='comercial') {
      return navigate('/commercial/catalog')
    } else{
      return navigate('/inicio')
    }
  }

  const [notificaciones, setNotificaciones] = useState([]);

  // Contamos solo las que no han sido leídas para el círculo rojo flotante
  const noLeidas = notificaciones.filter(n => !n.leida).length;

  const marcarComoLeidas = (e, id) => {
    const changes = {
      leido: true
    }
    updateNotification(id, changes)
    setNotificaciones(
      notificaciones.map((n) => (n.id === id ? { ...n, leida: true } : n))
    );
    const notifi = notificaciones.find((item)=>item.id === id)
    if(notifi.concept === 'crear'){
      openModal(e, notifi)
    }else if(notifi.concept === 'editar'){
      openModalUpdate(e, notifi)
      /* navigate(`/show/product/${notifi.producId}`) */
    }
  };

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

  const handleCompare = (e) => {
    e.preventDefault();
    setBuscando(true)
    compareProducts()
    .then((todasLasNotificaciones)=>{
      const mapeadas = todasLasNotificaciones.map((product) => ({
        id: product.id,
        producId: product.producId,
        texto: product.tipoNotificacion,
        leida: product.leido,
        concept: product.concept,
      }));

      // 3. Actualizamos el estado de React de manera correcta (Sin usar .push)
      setNotificaciones(mapeadas);
      setBuscando(false);
    })
  }

  const handleCreateProduct = (e) => {
    e.preventDefault();
    const body = {
      id: selectedProduct.producId
    }
    create2(body)
    .then(()=>{
      setSelectedProduct('');
      setShowModal(false);
      Swal.fire({
        icon:'success',
        title:'¡Correcto!',
        text:'Se ha creado el producto de manera satisfactoria, ¿Deseas completar la información?.',
        showConfirmButton:true,
        confirmButtonColor: 'green',
        confirmButtonText: 'Sí',
        showDenyButton: true,
        denyButtonColor: 'red',
        denyButtonText: 'No',
      })
      .then(({isConfirmed, isDenied})=>{
        if(isConfirmed){
          navigate(`/show/product/${selectedProduct.producId}`);
        }else if(isDenied){
          window.location.reload();
        }
      })
    })
    .catch(()=>{
      Swal.fire({
        icon:'warning',
        title:'¡ERROR!',
        text:'Ha ocurrido un error al momento de crear el producto en el sistema, intenta mas tarde o comunícate con el área de sistemas.',
        showConfirmButton:true,
        confirmButtonColor: 'red'
      })
    })
  }

  const handleUpdate = (e) => {
    e.preventDefault();
    const body = {
      id: selectedProduct.producId
    }
    update2(body)
    .then(()=>{
      setSelectedProduct('');
      setShowModalUpdate(false);
      Swal.fire({
        icon:'success',
        title:'¡Correcto!',
        text:'Se ha actualizado el producto de manera satisfactoria, ¿Deseas completar la información?.',
        showConfirmButton:true,
        confirmButtonColor: 'green',
        confirmButtonText: 'Sí',
        showDenyButton: true,
        denyButtonColor: 'red',
        denyButtonText: 'No',
      })
      .then(({isConfirmed, isDenied})=>{
        if(isConfirmed){
          navigate(`/show/product/${selectedProduct.producId}`);
        }else if(isDenied){
          window.location.reload();
        }
      })
    })
    .catch(()=>{
      Swal.fire({
        icon:'warning',
        title:'¡ERROR!',
        text:'Ha ocurrido un error al momento de actualizar el producto en el sistema, intenta mas tarde o comunícate con el área de sistemas.',
        showConfirmButton:true,
        confirmButtonColor: 'red'
      })
    })
  }

  return (
    <>
      {isLogged && (
        <div
          className="position-fixed bg-light shadow w-100"
          style={{ fontSize: 11, left: 0, height: "50px", zIndex: 2 }}
        >
          {/* Modal para crear productos nuevos */}
          <Modal show={showModal} onHide={closeModal} centered>
            <Modal.Header closeButton>
              <Modal.Title className='d-flex justify-content-center w-100 fw-bold' style={{fontSize: isMobile ? '16px':'25px'}}>Creación de producto</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group controlId="formWeight">
                <label>Se va a proceder a hacer la creación del producto: <strong>{selectedProduct.producId}</strong> en nuestro sistema, ¿Desea continuar?</label>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <div className="d-flex justify-content-center gap-2 mt-2 w-100" >
                <button
                  className="btn btn-sm btn-success w-50"
                  style={{fontSize: isMobile && 12}}
                  onClick={(e)=>handleCreateProduct(e)}
                >
                  Crear
                </button>
                <button
                  className="btn btn-sm btn-danger w-50"
                  style={{fontSize: isMobile && 12}}
                  onClick={(e)=>closeModal()}
                >
                  Cancelar
                </button>
              </div>
            </Modal.Footer>
          </Modal>

          {/* Modal para editar productos */}
          <Modal show={showModalUpdate} onHide={closeModalUpdate} centered>
            <Modal.Header closeButton>
              <Modal.Title className='d-flex justify-content-center w-100 fw-bold' style={{fontSize: isMobile ? '16px':'25px'}}>Edición de producto</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group controlId="formWeight">
                <label>Se va a proceder a hacer la actualización del producto: <strong>{selectedProduct.producId}</strong> en nuestro sistema, ¿Desea continuar?</label>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <div className="d-flex justify-content-center gap-2 mt-2 w-100" >
                <button
                  className="btn btn-sm btn-success w-50"
                  style={{fontSize: isMobile && 12}}
                  onClick={(e)=>handleUpdate(e)}
                >
                  Actualizar
                </button>
                <button
                  className="btn btn-sm btn-danger w-50"
                  style={{fontSize: isMobile && 12}}
                  onClick={(e)=>closeModalUpdate()}
                >
                  Cancelar
                </button>
              </div>
            </Modal.Footer>
          </Modal>

          <div className={`d-flex flex-row justify-content-between align-items-center w-100 h-100 ${isMobile ? 'px-2' : 'px-4'} shadow`}>
            <div
              id="logo-header"
              className="d-flex flex-row align-items-center gap-2"
            >
              <span className="menu-bars m-0" style={{ cursor: "pointer" }}>
                <FaIcons.FaBars
                  className="text-danger"
                  onClick={(e) => setShowSidebar(!showSideBar)}
                />
              </span>
              <img
                src={Logo}
                width={100}
                className="navbar-img"
                /* onClick={(e) => navigate("/inicio")} */
                onClick={(e)=>handleClickImg(e)}
                alt=""
                style={{ cursor: "pointer" }}
              />
            </div>

            <div className="d-flex flex-row align-items-center">
              <div
                className="d-flex align-items-center position-relative bg-danger rounded-pill p-2 pe-4"
                style={{ right: "-20px", height: 25 }}
              >
                <span className="text-light text-nowrap m-0">{user.name}</span>
              </div>
              <div
                id="btn-session"
                className="dropdown"
                style={{ width: "40px", height: "40px" }}
              >
                <button
                  className="d-flex align-items-center btn btn-danger rounded-circle w-100 h-100 m-0 p-0 border border-2 border-light overflow-hidden"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  data-bs-offset="0,10"
                >
                  <FaIcons.FaUser className="w-100" />
                </button>
                <ul
                  className="dropdown-menu text-center p-0 rounded-3"
                  style={{ width: "250px" }}
                >
                  <li className="border-bottom">
                    <p className="fw-bold mt-1 mb-1">
                      {user.role.toUpperCase()}
                    </p>
                  </li>
                  <li style={{ cursor: "pointer" }} className="border-bottom">
                    <Link
                      to="/cambiar/contrasena"
                      className="text-decoration-none"
                    >
                      <p className="dropdown-item fw-bold m-0">
                        CAMBIAR CONTRASEÑA
                      </p>
                    </Link>
                  </li>
                  <li style={{ cursor: "pointer" }} onClick={(e) => logout()}>
                    <p className="d-flex justify-content-center align-items-center gap-2 dropdown-item fw-bold text-danger m-0">
                      CERRAR SESIÓN
                      <FiIcons.FiLogOut />
                    </p>
                  </li>
                </ul>
              </div>
              {/* ================= SECCIÓN DE CAMPANA DE NOTIFICACIONES ================= */}
              {(user.role === 'admin' || user.role === 'comercial') &&
                <div 
                  className="dropdown ms-1 btn btn-primary"
                  style={{
                    position: 'relative',
                    color: 'white',
                    borderRadius: '50%',
                    width: 37,
                    height: 37,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: 18,
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    cursor: 'pointer',
                  }}
                >
                  <button
                    className="btn p-1 position-relative d-flex align-items-center justify-content-center"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{ background: 'transparent', boxShadow: 'none'}}
                  >
                    <FaIcons.FaBell className="text-white" style={{ cursor: 'pointer' , fontSize: 18 }} />
                    
                    {noLeidas > 0 && (
                      <span 
                        className="position-absolute top-0 start-50 translate-middle badge rounded-circle bg-danger border border-light d-flex align-items-center justify-content-center"
                        style={{ fontSize: '9px', width: '16px', height: '16px', padding: 0 }}
                      >
                        {noLeidas}
                      </span>
                    )}
                  </button>

                  {/* Menú desplegable de las notificaciones */}
                  <ul 
                    className="dropdown-menu dropdown-menu-end shadow rounded-3 p-0 mt-2"
                    style={{ width: "280px", maxHeight: "350px", overflowY: "auto" }}
                  >
                    <li className="p-2 border-bottom bg-danger text-light rounded-top-3 text-center fw-bold">
                      NOTIFICACIONES
                    </li>
                    
                    {notificaciones.length === 0 ? (
                      <li className="p-3 text-center text-muted">No tienes notificaciones</li>
                    ) : (
                      notificaciones
                      .slice()
                      .sort((a, b) => b.id - a.id)
                      .map((notif) => (
                        <li
                          key={notif.id} 
                          className="border-bottom dropdown-item p-2 text-wrap" 
                          style={{ whiteSpace: 'normal', cursor: 'pointer' }}
                          // CAMBIO CLAVE: Al hacer clic a la fila, se marca individualmente
                          onClick={(e) => marcarComoLeidas(e, notif.id)}
                        >
                          <div className="d-flex align-items-center justify-content-between gap-2">
                            <p 
                              className={`m-0 ${!notif.leida ? 'fw-bold text-dark' : 'text-secondary'}`} 
                              style={{ fontSize: '11px', flex: 1 }}
                            >
                              {notif.texto}
                            </p>

                            {/* PUNTO AZUL INDICADOR: Solo se renderiza si leida es false */}
                            {!notif.leida && (
                              <span 
                                className="bg-primary rounded-circle" 
                                style={{ width: '8px', height: '8px', flexShrink: 0 }} 
                                title="No leído"
                              />
                            )}
                          </div>
                        </li>
                      ))
                    )}
                    <li 
                      className="p-1 bg-primary text-light rounded-top-3 text-center fw-bold"
                      onClick={(e)=>{
                        e.stopPropagation();
                        handleCompare(e)
                      }}
                    >
                      <LuRefreshCcw className="me-1"/>
                      {buscando ?
                        'Cargando...'
                        :
                        'Refresh' 
                      }
                    </li>
                  </ul>
                </div>
              }
            </div>
          </div>

          <nav
            className={showSideBar ? "bg-light nav-menu active" : "nav-menu"}
          >
            <ul
              className="nav-menu-items"
              onClick={(e) => setShowSidebar(!showSideBar)}
            >
              {NavBarData.map((item, index) => {
                if (item.access.includes(user.role)) {
                  return (
                    <li key={index} className={item.cName}>
                      <Link to={item.path}>
                        {item.icon}
                        <span>{item.title}</span>
                      </Link>
                    </li>
                  );
                }
              })}
            </ul>
            <ul
              className="nav-menu-items"
              onClick={(e) => setShowSidebar(!showSideBar)}
            >
              <li className="text-center text-secondary">
                <span className="m-0">Gran Langostino S.A.S - v2.6.0</span>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}
