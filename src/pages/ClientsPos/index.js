import { useState, useEffect, useMemo, useContext } from "react";
import * as GoIcons from "react-icons/go"
import TableClientesPos from "../../components/TableClientesPos";
import { findClients, findClientsByAgency, findClientsBySeller } from "../../services/clientsPosService"
import ModalClients from "../../components/ModalClients";
import { useNavigate } from "react-router-dom";
import Badge from '@mui/material/Badge';
import { FaCartShopping } from "react-icons/fa6";
import Stack from '@mui/material/Stack';
import { IoBarChartSharp } from "react-icons/io5";
import { FaTableList } from "react-icons/fa6";
import AuthContext from "../../context/authContext";
import { DiagramaBarras } from "../../components/BarChart";
import PlazoPieChart from "../../components/PlazoPieChart";
import { getAllAgencies, getAllAgenciesPos } from "../../services/agencyService";
import { findSellers } from "../../services/sellerService";
import InteractivePlazoDonutChart from "../../components/PieChartPlazoXco";
import InteractivePlazoXseller from "../../components/PieChartPlazoXseller";
import InteractiveFotoXseller from "../../components/PieChartFotoXseller";
import InteractiveFotoXco from "../../components/PieChartFotoXco";
import { SiMicrosoftexcel } from "react-icons/si";
import * as FaIcons from "react-icons/fa";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import './styles.css'

export default function ClientsPos () {
  const { user, setUser } = useContext(AuthContext);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [suggestions, setSuggestions] = useState([])
  const [search, setSearch] = useState('')
  const [showModalClients, setShowModalClients] = useState(false)
  const [loading, setLoading] = useState(false);
  const [reportes, setReportes] = useState(false);
  const navigate = useNavigate();
  const [agencias, setAgencias] = useState({});
  const [sellers, setSellers] = useState({});
  const [filterAgencia, setFilterAgencia] = useState('');
  const [filterSeller, setFilterSeller] = useState('');
  const [filterDate, setFilterDate] = useState({
    initialDate: '',
    finalDate: '',
  });

  useEffect(() => {
    if(user.role === 'admin' || user.role === 'aprobador'){
      findAllClientsPOS();
    }else if(user.role === 'agencia'){
      findClientsByAgency(user.rowId)
      .then(({data})=>{
        setClients(data)
        setSuggestions(data)
        setLoading(false)
      })
      .catch((err)=>{
        setLoading(false)
      })
    }else if(user.role === 'vendedor'){
      findClientsBySeller(user.rowId)
      .then(({data})=>{
        setClients(data)
        setSuggestions(data)
        setLoading(false)
      })
      .catch((err)=>{
        setLoading(false)
      })
    }
    getAllAgenciesPos()
      .then((data)=>setAgencias(data))
    findSellers()
      .then(({data}) => {
        setSellers(data)
      })
  }, [])

  const findAllClientsPOS = () => {
    setLoading(true)
    findClients()
      .then(({data}) => {
        setClients(data)
        setSuggestions(data)
        setLoading(false)
      })
      .catch((error) => {
        setLoading(false)
      });
  }

  const searchClients= (e) => {
    const { value } = e.target
    if(value !== "") {
      const filteredUsers = clients.filter((elem) => {
        if(
          elem.coId.includes(value) ||
          elem.razonSocial.toLowerCase().includes(value.toLowerCase()) /* ||
          elem.coDescription.toLowerCase().includes(value.toLowerCase()) */
        ) {
          return elem
        }
      })
      if(filteredUsers.length > 0) {
        setSuggestions(filteredUsers)
      } else {
        setSuggestions([])
     }
    } else {
      setSuggestions(clients)
    }
    setSearch(value)
  }

  const handleChangeFilterDate = (e) => {
    const { id, value } = e.target;
    setFilterDate({
      ...filterDate,
      [id]: value,
    });
  };

  const removeFilterDate = () => {
    setFilterDate({
      initialDate: '',
      finalDate: '',
    });
    findAllClientsPOS();
  };  

  const getFilteredClientsByDate = () => {
    if(filterDate.finalDate !== '' && filterDate.initialDate !== ''){
        const initialDate = new Date(filterDate?.initialDate?.split('-').join('/')).toLocaleDateString();
        const finalDate = new Date(filterDate?.finalDate?.split('-').join('/')).toLocaleDateString();
        const filtered = clients.filter((elem) => {
          const splitDate = new Date(elem.createdAt).toLocaleDateString();
          if (splitDate >= initialDate && splitDate <= finalDate) {
            return elem;
          }
          return 0;
        });
        if(filtered.length > 0) {  
          setSuggestions(filtered)
        } else {
          setSuggestions([])
        }
      }else if((filterDate.finalDate !== '' && filterDate.initialDate === '')||(filterDate.finalDate === '' && filterDate.initialDate !== '')||(filterDate.finalDate === '' && filterDate.initialDate === '')){
        Swal.fire({
          icon:'warning',
          title:'¡ERROR!',
          text:'Para hacer un filtro por fecha debes de especificar la fecha inicial y la fecha final',
          confirmButtonColor:'red',
          confirmButtonText:'OK'
        })
      }
  }

  // Opcional: detección de pantalla pequeña
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

  // Función para aplicar estilos a los títulos
  const applyStylesToHeaders = (worksheet, data) => {
    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    const headers = Object.keys(data[0]);

    // Estilos para celdas de encabezado
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!worksheet[cellAddress]) continue;

      worksheet[cellAddress].s = {
        font: { bold: true },
        alignment: { horizontal: "center" },
        fill: { fgColor: { rgb: "DCE6F1" } }, // Fondo azul claro
      };
    }

    // Ancho dinámico para columnas
    const columnWidths = headers.map((key) => {
      const maxContent = Math.max(
        key.length,
        ...data.map((row) => (row[key] ? row[key].toString().length : 0))
      );
      return { wch: maxContent + 2 };
    });

    worksheet["!cols"] = columnWidths;
  };

  // Lógica para exportar la tabla a un Excel
  const exportToExcel = (data) => {
    const filteredData = data.map((item) => {
      const co = item?.coId;
      const rs = item?.razonSocial?.toUpperCase();
      const tel = item?.telefono;
      const dir = item?.direccion;
      const plazo = `${item?.plazo} días`;
      const creator = item?.createdBy;
      const photo = item?.fotoLocal === true ? 'Si' : 'No';
      const createdAt = item.createdAt !== null ? new Date(item?.createdAt).toLocaleString("es-CO") : '';
      const updater = item?.updatedBy;
      const updatedAt = item.updatedAt !== null ? new Date(item?.updatedAt).toLocaleString("es-CO") : '';

      return {
        'C.O.': co,
        'Razón social': rs,
        'Teléfono': tel,
        'Dirección': dir,
        'Plazo': plazo,
        'Creado por': creator,
        'Foto local': photo,
        'Fecha Creación': createdAt,
        'Actualizado por': updater,
        'Fecha Actualización': updatedAt,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    applyStylesToHeaders(worksheet, filteredData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array", cellStyles: true });
    const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });

    const filename = `Reporte_clientes_Pos ${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}`;
    saveAs(dataBlob, `${filename}.xlsx`);
  };
  
  return (
    <div className="d-flex flex-column container mt-5">
      {/* <ModalClients
        client={selectedClient}
        setClient={setSelectedClient}
        showModal={showModalClients} 
        setShowModal={setShowModalClients} 
        reloadInfo={findAllClientsPOS} 
      /> */}
      <div 
        className="d-flex flex-column gap-2 h-100"
      >
        {reportes ?
          <div className="mt-2"> 
            <div className="row row-cols-sm-1 bg-light rounded shadow-sm">
              <h5 className="d-flex justify-content-center w-100 mt-1">Reportes Individuales</h5>
              <div className="row row-cols-sm-4 mt-1">
                <div>
                  <label className=' mt-1'>Centro de Operación</label>
                  <select
                    className="form-select form-select-sm"
                    /* value={filterAgencia ? JSON.stringify(filterAgencia) : null} */
                    onChange={(e) => e.target.value === '' ? setFilterAgencia(null) : setFilterAgencia(JSON.parse(e.target.value))}
                    required
                  >
                    <option selected value="" disabled>
                      -- Seleccione el Centro de Operación --
                    </option>
                    <option value=''>
                      Ninguna
                    </option>
                    {agencias
                      ?.sort((a, b) => a.id - b.id)
                      .map((elem) => (
                        <option id={elem.id} value={JSON.stringify(elem)}>
                          {elem.id + " - " + elem.descripcion}
                        </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className=' mt-1'>Vendedores</label>
                  <select
                    className="form-select form-select-sm"
                    /* value={filterAgencia ? JSON.stringify(filterAgencia) : null} */
                    onChange={(e) => e.target.value === '' ? setFilterSeller(null) : setFilterSeller(JSON.parse(e.target.value))}
                    required
                  >
                    <option selected value="" disabled>
                      -- Seleccione el Vendedor(a) --
                    </option>
                    <option value=''>
                      Ninguno
                    </option>
                    {sellers
                      ?.sort((a, b) => a.id - b.id)
                      .map((elem) => (
                        <option id={elem.id} value={JSON.stringify(elem)}>
                          {elem.id + " - " + elem.description}
                        </option>
                    ))}
                  </select>
                </div>
                <div className=''>
                  <label className=' mt-1'>Desde</label>
                  <input
                    id="initialDate"
                    type="date"
                    value={filterDate.initialDate}
                    className="form-control form-control-sm"
                    max={filterDate.finalDate !== '' ? filterDate.finalDate : new Date().toISOString().split("T")[0]}
                    onChange={handleChangeFilterDate}
                  />
                </div>
                <div className=''>
                  <label className=' mt-1'>Hasta</label>
                  <div className="d-flex flex-row gap-1">
                    <input
                      id="finalDate"
                      type="date"
                      value={filterDate.finalDate}
                      className="form-control form-control-sm"
                      min={filterDate.initialDate}
                      max={new Date().toISOString().split("T")[0]}
                      onChange={handleChangeFilterDate}
                      disabled={filterDate.initialDate === '' ? true : false}
                    />
                    <button
                      title="Filtro por fecha"
                      type="button"
                      class="d-flex align-items-center btn btn-sm btn-primary"
                      onClick={(e)=>(
                        getFilteredClientsByDate()
                      )}
                    >
                      <FaIcons.FaFilter />
                    </button>
                  </div>
                </div>
              </div>
              {/* Diagramas individuales */}
              <div className="row row-cols-sm-4 mt-1">
                <div
                  className="mt-1"
                >
                  <h6>Plazos por C.O.</h6>
                  <InteractivePlazoDonutChart suggestions={suggestions} selectedCoId={filterAgencia} />
                </div>
                <div
                  className="mt-1"
                >
                  <h6>Pedidos por C.O con/sin foto</h6>
                  <InteractiveFotoXco suggestions={suggestions} selectedCoId={filterAgencia} />
                </div>
                <div
                  className="mt-1"
                >
                  <h6>Plazo por vendedor</h6>
                  <InteractivePlazoXseller suggestions={suggestions} selectedCoId={filterSeller} />
                </div>
                <div>
                  <h6>Pedidos por vendedor con/sin foto</h6>
                  <InteractiveFotoXseller suggestions={suggestions} selectedCoId={filterSeller} />
                </div>
              </div>
            </div>
            {/* Diagramas generales */}
            <div className="row row-cols-sm-1 bg-light rounded shadow-sm mt-2">
              <h5 className="d-flex justify-content-center w-100 mt-1">Reportes Generales</h5>
              <div className="row row-cols-sm-2">
                <div
                  className="mt-1"
                  style={{
                    overflowX: "auto", // 👈 permite desplazarse horizontalmente
                    whiteSpace: "nowrap",
                  }}
                >
                  <h6>Reporte de Clientes POS por C.O.</h6>
                  <DiagramaBarras suggestions={clients} />
                </div>
                <div>
                  <PlazoPieChart suggestions={clients} />
                </div>
              </div>
            </div>
          </div>
          :
          <div className="d-flex flex-column gap-2 h-100">
            <div className="d-flex div-top w-100 mt-2 gap-2">
              <div className="d-flex flex-row gap-1 w-100">
                <input
                  type="search"
                  value={search}
                  className="form-control form-control-sm w-100"
                  placeholder="Buscar cliente por razón social o por C.O."
                  onChange={searchClients}
                />
                <div class="btn-group">
                  <button
                    type="button"
                    class="btn btn-sm btn-primary dropdown-toggle dropdown-toggle-split"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <FaIcons.FaFilter className="me-1" />
                    <span class="visually-hidden">Toggle Dropdown</span>
                  </button>
                  <ul class="dropdown-menu p-1 m-0">
                    {/* <label className="d-flex w-100 ms-2 text-primary fw-bold">Intervalo de tiempo:</label> */}
                    <li className="d-flex div-top gap-2 mb-2">
                      <div>
                        <label className="fw-bold">Desde</label>
                        <input
                          id="initialDate"
                          type="date"
                          value={filterDate.initialDate}
                          className="form-control form-control-sm"
                          max={filterDate.finalDate}
                          onChange={handleChangeFilterDate}
                        />
                      </div>
                      <div>
                        <label className="fw-bold">Hasta</label>
                        <input
                          id="finalDate"
                          type="date"
                          value={filterDate.finalDate}
                          className="form-control form-control-sm"
                          min={filterDate.initialDate}
                          disabled={filterDate.initialDate === ''}
                          onChange={handleChangeFilterDate}
                        />
                      </div> 
                    </li>
                    <li className="div-top d-flex gap-2">
                      <button
                        className="btn btn-sm btn-primary w-100"
                        onClick={getFilteredClientsByDate}
                      >
                        Filtrar
                      </button>
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
                  onClick={() => exportToExcel(suggestions)}
                >
                  <FaIcons.FaDownload />
                </button>
              </div>
              <button
                title="Nuevo cliente"
                className="d-flex align-items-center text-nowrap btn btn-sm btn-danger text-light gap-1" 
                onClick={(e) => navigate('/add/clientes/pos')}>
                  Nuevo cliente
                  <GoIcons.GoPersonAdd style={{width: 15, height: 15}} />
              </button>
            </div>
            <TableClientesPos 
              clients={suggestions} 
              setShowModal={setShowModalClients} 
              setSelectedClient={setSelectedClient}
              loading={loading}
            />
          </div>
        }

        {/* Bola flotante */}
        {(user.role === 'admin' || user.role === 'aprobador') &&
          <div
            onClick={() => (setReportes(!reportes), setSuggestions(clients), setFilterAgencia(null), setFilterSeller(null))}
            style={{
              position: 'fixed',
              bottom: 30,
              right: 20,
              backgroundColor: '#ff4d4f',
              color: 'white',
              borderRadius: '50%',
              width: 50,
              height: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: 18,
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              cursor: 'pointer',
            }}
            title="Reportes"
          >
            <Stack spacing={4} direction="row" sx={{ color: 'white' }}>
              <Badge color="primary" /* badgeContent={<IoBarChartSharp />} */>
                {/* <FaCartShopping
                  style={{color:'white', padding:7}}
                /> */}
                {reportes ?
                  <FaTableList />
                  :
                  <IoBarChartSharp />
                }
              </Badge>
            </Stack>
          </div>
        }
      </div>
    </div>
  )
}