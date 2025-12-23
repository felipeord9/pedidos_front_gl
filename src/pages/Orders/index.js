import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as HiIcons from "react-icons/hi";
import * as FaIcons from "react-icons/fa";
import * as VscIcons from "react-icons/vsc";
import * as XLSX from "xlsx";
import TableOrders from "../../components/TableOrders";
import AuthContext from "../../context/authContext";
import { MdPriceChange } from "react-icons/md";
import {
  findOrders,
  findOrdersBySeller,
  findOrdersByAgency,
  findInitialOrders,
  findInitialBySeller,
  findInitialByAgency,
} from "../../services/orderService";
import './styles.css'
import Swal from "sweetalert2";

export default function Orders() {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [filterDate, setFilterDate] = useState({
    initialDate: null,
    finalDate: null,
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const refTable = useRef();
  const [typeFillDate, setTypeFillDate] = useState('');
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);

  useEffect(() => {
    getAllOrders();
  }, []);

  const getAllOrders = () => {
    setLoading(true)
    findInitialOrders()
      .then(({ data }) => {
        setOrders(data);
        setSuggestions(data);
        setLoading(false);
        setHasLoadedInitial(true);
      })
      .catch(() => {
        findInitialBySeller(user.rowId)
          .then(({ data }) => {
            setOrders(data);
            setSuggestions(data);
            setLoading(false);
            setHasLoadedInitial(true);
          })
          .catch(() => {
            findInitialByAgency(user.rowId).then(({ data }) => {
              setOrders(data);
              setSuggestions(data);
              setLoading(false);
              setHasLoadedInitial(true);
            });
          });
      });
  };

  useEffect(() => {
    // 2. Carga Completa en Segundo Plano
    const fetchAll = async () => {
      if (!hasLoadedInitial || isLoadingAll) return; // Esperar a que la inicial se complete
      
      setIsLoadingAll(true);
      try {
        findOrders()
        .then(({ data }) => {
          setOrders(data);
          setSuggestions(data);
          setLoading(false);
          setHasLoadedInitial(false);
        })
        .catch(() => {
          findOrdersBySeller(user.rowId)
            .then(({ data }) => {
              setOrders(data);
              setSuggestions(data);
              setLoading(false);
              setHasLoadedInitial(false);
            })
            .catch(() => {
              findOrdersByAgency(user.rowId).then(({ data }) => {
                setOrders(data);
                setSuggestions(data);
                setLoading(false);
                setHasLoadedInitial(false);
              });
            });
        });
      } catch (error) {
        console.error('Error fetching all orders:', error);
      } finally {
        setIsLoadingAll(false);
      }
    };
    
    // Si la carga inicial se completó, lanzamos la carga completa
    if (hasLoadedInitial) {
        fetchAll(); 
    }
    
  }, [hasLoadedInitial]); // Se ejecuta cuando la carga inicial ha terminado

  const getFilteredOrders = async () => {
    if (filterDate.initialDate && filterDate.finalDate) {

      const initialDate = new Date(filterDate.initialDate);
      await initialDate.setDate(initialDate.getDate() + 1);
      await initialDate.setHours(1, 1, 1, 1);

      const finalDate = new Date(filterDate.finalDate);
      await finalDate.setDate(finalDate.getDate() + 1);
      await finalDate.setHours(23, 59, 59, 999);

      const filteredOrders = await orders.filter((elem) => {
        const splitDate = new Date(elem.createdAt)
        if (initialDate <= splitDate && splitDate <= finalDate) {
          return elem;
        }
        return 0;
      });

      setSuggestions(filteredOrders);
    }
  };

  const getFilteredOrdersByDelivery = () => {
    if (filterDate.initialDate && filterDate.finalDate) {
      const initialDate = new Date(filterDate.initialDate);
      /* initialDate.setDate(initialDate.getDate() + 1); */

      const finalDate = new Date(filterDate.finalDate);
      finalDate.setDate(finalDate.getDate() + 1);

      const filteredOrders = orders.filter((elem) => {
        const splitDate = new Date(elem.deliveryDate);
        if (splitDate >= initialDate && splitDate <= finalDate) {
          return elem;
        }
        return 0;
      });

      setSuggestions(filteredOrders);
    }
  };

  const handleChangeFilterDate = (e) => {
    const { id, value } = e.target;
    setFilterDate({
      ...filterDate,
      [id]: value,
    });
  };

  const removeFilterDate = () => {
    setFilterDate({
      initialDate: 0,
      finalDate: 0,
    });
    setTypeFillDate('');
    getAllOrders();
  };

  const findOrder = (e) => {
    e.preventDefault();
    if (search.length > 0) {
      const [co, id] = search.split("-");
      let filterOrders;
      if(co && id) {
        filterOrders = orders.find((elem) => elem.coId === co && elem.rowId === id)
        setSuggestions([filterOrders])
      } else {
        filterOrders = orders.filter((elem) => elem.state.includes(search.toLowerCase()))
        setSuggestions(filterOrders)
      }
    } else {
      getAllOrders();
    }
  };

  const flattenObject = (obj, prefix = "") => {
    delete obj.items;
    return Object.keys(obj).reduce((acc, key) => {
      const pre = prefix.length ? prefix + "." : "";
      if (typeof obj[key] === "object" && obj[key] !== null) {
        Object.assign(acc, flattenObject(obj[key], pre + key));
      } else {
        acc[pre + key] = obj[key];
      }

      delete acc.userId;
      delete acc["user.id"];
      delete acc["user.email"];
      delete acc["user.password"];
      delete acc["user.recoveryToken"];
      delete acc["user.createdAt"];

      return acc;
    }, {});
  };

  const handleDownload = () => {
    const date = new Date();
    const workbook = XLSX.utils.book_new();
    const newData = orders.map((value) => flattenObject(value));
    console.log(orders);
    const worksheet = XLSX.utils.json_to_sheet(newData);
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      `Pedidos-${date.toDateString("es-CO")}`
    );
    XLSX.writeFile(workbook, "Pedidos.xlsx");
    //navigate("/formulario");
  };

  return (
    <div className="d-flex flex-column container mt-5">
      <div className="d-flex flex-column h-100 gap-2">
        <div className="div-botons justify-content-center mt-2 gap-2 w-100">
          <div className="d-flex flex-row w-100 gap-2">
            <form
              className="position-relative d-flex justify-content-center w-100"
              onSubmit={findOrder}
            >
              <input
                type="search"
                value={search}
                className="form-control form-control-sm"
                style={{paddingRight: 35}}
                placeholder="Buscar pedido (Ej: 005-1)"
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                type="submit"
                className="position-absolute btn btn-sm"
                style={{ right: 0 }}
              >
                  {search.length ? <FaIcons.FaSearch /> : <VscIcons.VscDebugRestart />}
              </button>
            </form>
            <div class="btn-group">
              <button
                title="Filtro por fecha"
                type="button"
                class="d-flex align-items-center btn btn-sm btn-primary"
                onClick={(e)=>(
                  typeFillDate === 'creacion' ? getFilteredOrders() : getFilteredOrdersByDelivery()
                )}
              >
                <FaIcons.FaFilter />
              </button>
              <button
                type="button"
                class="btn btn-sm btn-primary dropdown-toggle dropdown-toggle-split"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <span class="visually-hidden">Toggle Dropdown</span>
              </button>
              <ul class="dropdown-menu p-0 m-0">
                {/* <label className="d-flex w-100 text-primary fw-bold ms-2">Tipo de filtro:</label> */} 
                <li
                  className="d-flex w-100 flex-row gap-4 mb-1"
                >
                  <button
                    className="btn btn-sm btn-secondary w-50 ms-2 mt-1"
                    style={{
                      backgroundColor: typeFillDate === '' ? 'grey' : typeFillDate === 'creacion' ? 'blue' : 'grey',
                      color:'white',
                      whiteSpace:'nowrap',
                      paddingLeft: 21,
                      paddingRight: 21
                    }}
                    onClick={(e)=>(
                      setTypeFillDate('creacion'),
                      e.stopPropagation() // Evitar que el dropdown se cierre
                    )}
                  >
                    Fecha creación
                  </button>
                  <button
                    className="btn btn-sm btn-secondary w-50 me-2 mt-1"
                    style={{
                      backgroundColor: typeFillDate === '' ? 'grey' : typeFillDate === 'entrega' ? 'blue' : 'grey',
                      color:'white',
                      whiteSpace:'nowrap',
                      paddingLeft: 24,
                      paddingRight: 24
                    }}
                    onClick={(e)=>(
                      setTypeFillDate('entrega'),
                      e.stopPropagation()
                    )}
                  >
                    Fecha entrega
                  </button>
                </li>
                {/* <label className="d-flex w-100 ms-2 text-primary fw-bold">Intervalo de tiempo:</label> */}
                {typeFillDate !== '' &&
                  <li className="d-flex flex-row gap-2 mb-2">
                  <input
                    id="initialDate"
                    type="date"
                    value={filterDate.initialDate}
                    className="form-control form-control-sm ms-2"
                    max={filterDate.finalDate}
                    onChange={handleChangeFilterDate}
                    disabled={typeFillDate === ''}
                  />
                  -
                  <input
                    id="finalDate"
                    type="date"
                    value={filterDate.finalDate}
                    className="form-control form-control-sm me-2"
                    min={filterDate.initialDate}
                    disabled={typeFillDate === '' || filterDate.initialDate === null}
                    onChange={handleChangeFilterDate}
                  />
                  
                </li>
                }
                <li>
                  <button
                    className="btn btn-sm btn-danger w-100"
                    onClick={removeFilterDate}
                  >
                    Borrar filtro
                  </button>
                </li>
              </ul>
            </div>
            <button
              title="Descargar Excel"
              className="btn btn-sm btn-success"
              onClick={(e) => handleDownload()}
            >
              <FaIcons.FaDownload />
            </button>
          </div> 
          <div className="div-botons">
            <button
              title="Nuevo pedido"
              className="d-flex align-items-center text-nowrap btn btn-sm btn-danger text-light gap-1 h-100"
              onClick={(e) => navigate("/pedido")}
            >
              Nuevo pedido
              <HiIcons.HiDocumentAdd style={{ width: 15, height: 15 }} />
            </button>
            <button
              title="Nuevo pedido"
              className="d-flex align-items-center text-nowrap btn btn-sm btn-success text-light gap-1 h-100"
              onClick={(e)=>navigate('/Auth/price')}
            >
              Nueva Solicitud
              <MdPriceChange />
            </button>
          </div> 
        </div>
        <TableOrders ref={refTable} orders={suggestions} getAllOrders={getAllOrders} loading={loading} />
      </div>
    </div>
  );
}
