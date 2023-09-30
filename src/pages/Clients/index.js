import { useState, useEffect } from "react";
import * as GoIcons from "react-icons/go"
import TableClients from "../../components/TableClients";
import { getAllClientsPOS } from "../../services/clientService"
import ModalClients from "../../components/ModalClients";

export default function Clients () {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [suggestions, setSuggestions] = useState([])
  const [search, setSearch] = useState('')
  const [showModalClients, setShowModalClients] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    findAllClientsPOS()
  }, [])

  const findAllClientsPOS = () => {
    setLoading(true)
    getAllClientsPOS()
      .then((data) => {
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
          elem.nit.includes(value) ||
          elem.razonSocial.toLowerCase().includes(value.toLowerCase())
        ) {
          return elem
        }
      })
      if(filteredUsers.length > 0) {
        setSuggestions(filteredUsers)
      } else {
        setSuggestions(clients)
     }
    } else {
      setSuggestions(clients)
    }
    setSearch(value)
  }
  
  return (
    <div className="d-flex flex-column container mt-5">
      <ModalClients
        client={selectedClient}
        setClient={setSelectedClient}
        showModal={showModalClients} 
        setShowModal={setShowModalClients} 
        reloadInfo={findAllClientsPOS} 
      />
      <div className="d-flex flex-column gap-2 h-100">
        <div className="d-flex justify-content-end mt-2 gap-3">
          <input
            type="search"
            value={search}
            className="form-control form-control-sm w-100"
            placeholder="Buscar cliente"
            onChange={searchClients}
          />
          <button
            title="Nuevo cliente"
            className="d-flex align-items-center text-nowrap btn btn-sm btn-danger text-light gap-1" 
            onClick={(e) => setShowModalClients(!showModalClients)}>
              Nuevo cliente
              <GoIcons.GoPersonAdd style={{width: 15, height: 15}} />
          </button>
        </div>
        <TableClients 
          clients={suggestions} 
          setShowModal={setShowModalClients} 
          setSelectedClient={setSelectedClient}
          loading={loading}
        />
      </div>
    </div>
  )
}