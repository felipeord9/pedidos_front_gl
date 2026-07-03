import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as HiIcons from "react-icons/hi";
import * as FaIcons from "react-icons/fa";
import * as VscIcons from "react-icons/vsc";
import * as XLSX from "xlsx";
import TableCatalog from "../../components/TableCatalog";
import AuthContext from "../../context/authContext";
import { MdPriceChange } from "react-icons/md";
import { PiMagnifyingGlassFill } from "react-icons/pi";
import {
  findOrders,
  findOrdersBySeller,
  findOrdersByAgency,
  findInitialOrders,
  findInitialBySeller,
  findInitialByAgency,
} from "../../services/orderService";
import { HiDocumentArrowDown } from "react-icons/hi2";
import { 
  findCatalog,
  getAllProductsPg, 
  createProduct, 
  updateProduct 
} from '../../services/catalogService';
import {
  findFamilias
} from '../../services/familiaService'
import { saveAs } from "file-saver";
import Swal from "sweetalert2";
import './styles.css'

export default function CommercialCatalog() {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [filterDate, setFilterDate] = useState({
    initialDate: null,
    finalDate: null,
  });
  const [search, setSearch] = useState("");
  const [searchFamily, setSearchFamily] = useState('');
  const [searchDescrip, setSearchDescrip] = useState("");
  const [loading, setLoading] = useState(false);
  const [familias, setFamilias] = useState([]);
  const [selectedFamily, setSelectedFamily] = useState('')
  const navigate = useNavigate();
  const refTable = useRef();
  const [typeFillDate, setTypeFillDate] = useState('');
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);
  const selectRefFamilia = useRef();

  useEffect(() => {
    getAll();
    findFamilias()
    .then(({data})=>{
      setFamilias(data)
    })
  }, []);

  const getAll = () => {
    setLoading(true)
    findCatalog()
      .then(({ data }) => {
        setProducts(data);
        setSuggestions(data);
        setLoading(false);
      })
      .catch(() => {
        console.log('error')
      });
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
    getAll();
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
    const newData = products.map((value) => flattenObject(value));
    const worksheet = XLSX.utils.json_to_sheet(newData);
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      `GL-catálogo-${date.toDateString("es-CO")}`
    );
    XLSX.writeFile(workbook, "GL-Catálogo.xlsx");
    //navigate("/formulario");
  };

  const findOrder = (e) => {
    e.preventDefault();
    if (search.length > 0) {
      const filteredUsers = products.filter((elem) => {
        if(
          parseInt(elem.id) === parseInt(search) /* ||
          elem.familyDescrip.toLowerCase().includes(search.toLowerCase()) */
        ) {
          return elem
        }
      })
      if(filteredUsers.length > 0) {
        setSuggestions(filteredUsers)
      } else {
        setSuggestions(products)
     }
    } else {
      getAll();
    }
  };

  const completeSearch = (e) =>{
    e.preventDefault();
    let result = products;

    //filtro por referencia
    if(search !== ''){
      const filtered = result.filter((elem) => {
      const dato = elem.id;
        if(parseInt(elem.id) === parseInt(search)) {
          return elem
        }
      })
      if(filtered.length > 0) {  
        result = filtered
      } else {
        result = []
      }
    }
    //filtro por familia
    if(searchFamily !== ''){
      const valor = searchFamily.toUpperCase()
      const filtered = result.filter((elem) => {
        if(elem.familyDescrip !== null){
          const dato = elem.familyDescrip.toUpperCase();
            if(dato === valor) {
              return elem
            }
          }
        })
        if(filtered.length > 0) {  
          result = filtered
        } else {
          result = []
        }
    }

    //buscar por descripcion
    if(searchDescrip !== ''){
      const valor = searchDescrip.toUpperCase()
      const filtered = result.filter((elem) => {
        if(elem.description !== null){
          const dato = elem.description.toUpperCase();
            if(dato.includes(valor)) {
              return elem
            }
          }
        })
        if(filtered.length > 0) {  
          result = filtered
        } else {
          result = []
        }
    }

    //cargar los resultados
    if(result.length > 0) {  
      setSuggestions(result)
    } else {
      setSuggestions([])
    }
  }

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

  //exportar a excel la informacion
  const exportToExcel = (data) => {
    const filteredData = data.map((item) => {
      const ref = item.id ? item?.id : '';
      const description = item.description ? item?.description?.toUpperCase() : '';
      const um = item.um ? item?.um?.toUpperCase() : '';
      const alternateRef = item.alternateRef ? item?.alternateRef : '';
      const familia = item.familyDescrip ? item?.familyDescrip.toUpperCase() : '';
      const observations = item.observations ? item?.observations : '';

      return {
        'Referencia': ref,
        'Descripción': description,
        'U.M.': um,
        'Ref. Alternativa': alternateRef,
        'Familia': familia,
        'Observaciones': observations,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(filteredData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array", cellStyles: true });
    const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });

    const filename = `GL-Catálogo ${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}`;
    saveAs(dataBlob, `${filename}.xlsx`);
  };

  return (
    <div className="d-flex flex-column container mt-5">
      <div className="d-flex flex-column h-100 gap-2">
        <div className="div-botons justify-content-center mt-2 gap-2 w-100">
          <div className="d-flex flex-row w-100 gap-2">
            <form
              className={`position-relative ${isMobile ? 'd-flex flex-column gap-2' : 'd-flex flex-row gap-3'} justify-content-center w-100`}
              onSubmit={findOrder}
            >
              <input
                type="number"
                value={search}
                className="form-control form-control-sm"
                placeholder="Buscar por referencia"
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                ref={selectRefFamilia}
                className="form-select form-select-sm w-100"
                onChange={(e) => setSearchFamily(e.target.value)}
                required
              >
                <option selected value='' disabled>
                  -- Buscar por familia --
                </option>
                <option value=''>
                  TODAS
                </option>
                {familias
                  .sort((a, b) => a.id - b.id)
                  .map((elem) => (
                    <option id={elem.id} value={(elem.description)}>
                      {elem.description}
                    </option>
                  ))}
              </select>
              <input
                type="text"
                value={searchDescrip}
                className="form-control form-control-sm"
                placeholder="Buscar por Descripción"
                onChange={(e) => setSearchDescrip(e.target.value)}
              />
            </form>
            {/* <button
              title="Descargar Excel"
              className="btn btn-sm btn-success"
              onClick={(e) => handleDownload()}
            >
              <FaIcons.FaDownload />
            </button> */}
          </div> 
          <div className='d-flex flex-row gap-2 justify-content-center'>
            <div className="div-botons">
              <button
                title="Buscar"
                className="d-flex align-items-center text-nowrap btn btn-sm btn-primary text-light gap-1 h-100"
                onClick={(e) => completeSearch(e)}
              >
                BUSCAR
                <PiMagnifyingGlassFill style={{ width: 15, height: 15 }} />
              </button>
            </div> 
            <button
              title="Descargar Excel"
              className="btn btn-sm btn-success"
              onClick={(e) => exportToExcel(suggestions)}
              style={{fontSize: 14}}
            >
              <HiDocumentArrowDown style={{fontSize:16}}/>
            </button>
          </div>
        </div>
        <TableCatalog ref={refTable} products={suggestions} getAll={getAll} loading={loading} />
      </div>
    </div>
  );
}
