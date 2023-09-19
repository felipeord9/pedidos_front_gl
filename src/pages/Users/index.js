import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as GoIcons from "react-icons/go"
import TableUsers from "../../components/TableUsers"
import { findUsers } from "../../services/userService"

export default function Orders() {
  const [users, setUsers] = useState([]);
  const [suggestions, setSuggestions] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    getAllUsers()
  }, []);

  const getAllUsers = () => {
    setLoading(true)
    findUsers()
      .then(({ data }) => {
        setUsers(data)
        setSuggestions(data)
        setLoading(false)
      })
      .catch((error) => {
        console.log(error)
        setLoading(false)
      });
  }

  const searchUsers = (e) => {
    const { value } = e.target
    if(value !== "") {
      const filteredUsers = users.filter((elem) => {
        if(
          elem.rowId.includes(value) ||
          elem.name.toLowerCase().includes(value.toLowerCase()) ||
          elem.role.toLowerCase().includes(value.toLowerCase())
        ) {
          return elem
        }
      })
      if(filteredUsers.length > 0) {
        setSuggestions(filteredUsers)
      } else {
        setSuggestions(users)
     }
    } else {
      setSuggestions(users)
    }
    setSearch(value)
  }

  return (
    <div className="d-flex flex-column container mt-5">
      <div className="d-flex flex-column gap-2 mt-2 h-100">
        <div className="d-flex justify-content-end gap-3">
          <input
            type="search"
            value={search}
            className="form-control form-control-sm w-100"
            placeholder="Buscar usuario"
            onChange={searchUsers}
          />
          <button 
            className="d-flex align-items-center text-nowrap btn btn-sm btn-danger text-light gap-1" 
            onClick={(e) => alert('Esta acción no está disponible aún')}>
              Nuevo usuario
              <GoIcons.GoPersonAdd style={{width: 15, height: 15}} />
          </button>
        </div>
        <TableUsers users={suggestions} loading={loading}/>
      </div>
    </div>
  )
} 