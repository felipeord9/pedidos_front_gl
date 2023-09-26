import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as HiIcons from "react-icons/hi";
import * as FaIcons from "react-icons/fa";
import * as XLSX from "xlsx";
import TableOrders from "../../components/TableOrders";
import AuthContext from "../../context/authContext";
import {
  findOrders,
  findOrdersBySeller,
  findOrdersByAgency,
} from "../../services/orderService";

export default function Orders() {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [filterDate, setFilterDate] = useState({
    initialDate: null,
    finalDate: null,
  });
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const refTable = useRef();

  useEffect(() => {
    getAllOrders();
  }, []);

  const getAllOrders = () => {
    findOrders()
      .then(({ data }) => {
        setOrders(data);
        setSuggestions(data);
      })
      .catch(() => {
        findOrdersBySeller(user.rowId)
          .then(({ data }) => {
            setOrders(data);
            setSuggestions(data);
          })
          .catch(() => {
            findOrdersByAgency(user.rowId).then(({ data }) => {
              setOrders(data);
              setSuggestions(data);
            });
          });
      });
  };

  const getFilteredOrders = () => {
    if (filterDate.initialDate && filterDate.finalDate) {
      console.log(filterDate);
      const initialDate = new Date(filterDate.initialDate.split('-').join('/')).toLocaleDateString();
      const finalDate = new Date(filterDate.finalDate.split('-').join('/')).toLocaleDateString();
      console.log(initialDate, finalDate)
      const filteredOrders = orders.filter((elem) => {
        const splitDate = new Date(elem.createdAt).toLocaleDateString();
        console.log(splitDate);
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
    getAllOrders();
  };

  const findOrder = (e) => {
    e.preventDefault();
    if (search.length > 0) {
      const [co, id] = search.split("-");
      const order = orders.find(
        (elem) => elem.coId === co && elem.rowId === id
      );
      if (!order) {
        getAllOrders();
      } else {
        setSuggestions([order]);
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
        <div className="d-flex justify-content-center mt-2 gap-2">
          <form
            className="position-relative d-flex justify-content-center w-100"
            onSubmit={findOrder}
          >
            <input
              type="search"
              value={search}
              className="form-control form-control-sm pe-4"
              placeholder="Buscar pedido (Ej: 005-1)"
              onChange={(e) => setSearch(e.target.value.toUpperCase())}
            />
            <button
              type="submit"
              className="position-absolute btn btn-sm"
              style={{ right: 0 }}
            >
              <FaIcons.FaSearch />
            </button>
          </form>
          <div class="btn-group">
            <button
              title="Filtro por fecha"
              type="button"
              class="d-flex align-items-center btn btn-sm btn-primary"
              onClick={getFilteredOrders}
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
              <li className="d-flex flex-row gap-2">
                <input
                  id="initialDate"
                  type="date"
                  value={filterDate.initialDate}
                  className="form-control form-control-sm"
                  max={filterDate.finalDate}
                  onChange={handleChangeFilterDate}
                />
                -
                <input
                  id="finalDate"
                  type="date"
                  value={filterDate.finalDate}
                  className="form-control form-control-sm"
                  min={filterDate.initialDate}
                  onChange={handleChangeFilterDate}
                />
              </li>
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
          <button
            title="Nuevo pedido"
            className="d-flex align-items-center text-nowrap btn btn-sm btn-danger text-light gap-1 h-100"
            onClick={(e) => navigate("/pedido")}
          >
            Nuevo pedido
            <HiIcons.HiDocumentAdd style={{ width: 15, height: 15 }} />
          </button>
        </div>
        <TableOrders ref={refTable} orders={suggestions} />
      </div>
    </div>
  );
}
