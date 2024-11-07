import { useState, useEffect, useRef , useContext } from "react";
import { useNavigate } from "react-router-dom";
import * as FaIcons from "react-icons/fa";
import * as VscIcons from "react-icons/vsc";
import { MdPriceChange } from "react-icons/md";
import { findRequests , findRequeBySeller , findRequeByAprob , findRequeByCreater } from '../../services/requestService'
import TableSolicitudes from "../../components/tableSolicitudes";
import AuthContext from "../../context/authContext";
import Swal from "sweetalert2";
import './styles.css'

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [filterDate, setFilterDate] = useState({
    initialDate: null,
    finalDate: null,
  });
  const { user, setUser } = useContext(AuthContext);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const refTable = useRef();

  useEffect(() => {
    getAllRequests();
  }, []);

  const getAllRequests = () => {
    setLoading(true)
    if(user.role==='vendedor' || user.role==='agencia'){
      findRequeByCreater(user.name)
        .then(({ data }) => {
          setRequests(data);
          setSuggestions(data);
          setLoading(false)
          setType('')
        })
        .catch((error) => {
          setLoading(false)
        });
    }else if(user.role==='aprobador'){
      findRequeByAprob(user.email)
        .then(({ data }) => {
          setRequests(data);
          setSuggestions(data);
          setLoading(false)
          setType('')
        })
        .catch((error) => {
          setLoading(false)
        });
    }else{
      findRequests()
        .then(({ data }) => {
          setRequests(data);
          setSuggestions(data);
          setLoading(false)
          setType('')
        })
        .catch((error) => {
          setLoading(false)
        });
    }
  };

  const getFilteredRequest = () => {
    if (filterDate.initialDate && filterDate.finalDate) {
      const initialDate = new Date(filterDate.initialDate.split('-').join('/')).toLocaleDateString();
      const finalDate = new Date(filterDate.finalDate.split('-').join('/')).toLocaleDateString();
      const filteredRequests = requests.filter((elem) => {
        const splitDate = new Date(elem.createdAt).toLocaleDateString();
        if (splitDate >= initialDate && splitDate <= finalDate) {
          return elem;
        }
        return 0;
      });

      setSuggestions(filteredRequests);
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
    getAllRequests();
  };

  const searchRequest = (e) => {
    const { value } = e.target
    if(value !== "") {
      const filteredUsers = suggestions.filter((elem) => {
        if(
          elem.install.toLowerCase().includes(value.toLowerCase())
        ) {
          return elem
        }
      })
      if(filteredUsers.length > 0) {
        setSuggestions(filteredUsers)
      } else {
        setSuggestions(suggestions)
     }
    } else {
      setSuggestions(suggestions)
    }
    setSearch(value)
  }

  const searchCliente = (e) => {
    const { value } = e.target
    if(value !== "") {
      const filteredUsers = suggestions.filter((elem) => {
        if(
          elem.nameClient.toLowerCase().includes(value.toLowerCase()) ||
          elem.nitClient.includes(value)
        ) {
          return elem
        }
      })
      if(filteredUsers.length > 0) {
        setSuggestions(filteredUsers)
      } else {
        setSuggestions(requests)
     }
    } else {
      setSuggestions(requests)
    }
    setSearch(value)
  }

  const findRequest = (e) => {
    e.preventDefault();
    if (search.length > 0) {
      const [co, id] = search.split("-");
      let filterRequests;
      if(co && id) {
        filterRequests = requests.find((elem) => elem.coId === co && elem.rowId === id)
        setSuggestions([filterRequests])
      } else {
        filterRequests = requests.filter((elem) => elem.state.includes(search.toLowerCase()))
        setSuggestions(filterRequests)
      }
    } else {
      getAllRequests();
    }
  };

  const handleLookFor = (e) =>{
    const { value } = e.target;
    if(value==='nuevas'){
      const filtro = requests.filter((item)=>item.state === 'nueva')
      setSuggestions(filtro)
      setType('nuevas')
    }else{
      const filtro = requests.filter((item)=>item.state === 'editado')
      setSuggestions(filtro)
      setType('editadas')
    }
  }

  const [type, setType] = useState('')

  return (
    <div className="d-flex flex-column container mt-5">
      {/* <ModalSingleRequest 
        request={selected}
        setRequest={setSelected}
        showModal={showModalSingleRequest} 
        setShowModal={setShowModalSingleRequest} 
        reloadInfo={getAllRequests} 
      /> */}
      <div className="d-flex flex-column h-100 gap-2">
        <div className="div-head justify-content-center mt-2 gap-2">
          <form
            className="position-relative d-flex justify-content-center w-100"
            onSubmit={findRequests}
          >
            {(user.role === 'admin' || user.role ==='precios' || user.role ==='aprobador') &&
              <input
              type="search"
              value={search}
              className="form-control form-control-sm"
              style={{paddingRight: 35}}
              placeholder="Buscar socilitudes por instalación"
              onChange={searchRequest}
            />}
            {(user.role === 'agencia' || user.role ==='vendedor') &&
              <input
              type="search"
              value={search}
              className="form-control form-control-sm"
              style={{paddingRight: 35}}
              placeholder="Buscar socilitudes por NIT ó razón social"
              onChange={searchCliente}
            />}
          </form>
            {(user.role === 'admin' || user.role ==='precios' || user.role ==='aprobador') &&
              <select
                id="head-dropdown"
                className="head-dropdown btn btn-sm btn-primary"
                value={type}
                onChange={(e)=>handleLookFor(e)}
              >
                <option className="head-dropdown" selected value="" disabled>
                  -- Seleccione una opción --
                </option>
                <option className="head-dropdown" value='nuevas'>Nuevas solicitudes</option>
                <option className="head-dropdown" value='editadas'>Solicitudes revisadas</option>
              </select> 
            }
            {(user.role==='vendedor' || user.role==='admin' || user.role==='agencia') &&
              <button
                title="Nueva solicitud"
                className="align-items-center head-dropdown justify-content-center text-nowrap btn btn-sm btn-success text-light h-100"
                onClick={(e)=>navigate('/Auth/price')}
              >
                Nueva Solicitud
                <MdPriceChange />
              </button>
            }
        </div>
        <TableSolicitudes 
          ref={refTable} 
          requests={suggestions} 
          
          selectedRequest={selectedRequest}  
          setSelectedRequest={setSelectedRequest}
          
          getAllRequests={getAllRequests}
          /* setShowModal={setShowModalSingleRequest} */  
          selected={selected}
          setSelected={setSelected}
          loading={loading} 
        />
      </div>
    </div>
  );
}
