import { useState, useEffect } from "react";
import * as BsIcons from "react-icons/bs"
import TableSellers from "../../components/TableSellers";
import ModalSellers from "../../components/ModalSellers";
import { findSellers } from "../../services/sellerService"

export default function Sellers () {
  const [sellers, setSellers] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [suggestions, setSuggestions] = useState([])
  const [search, setSearch] = useState('')
  const [showModalSellers, setShowModalSellers] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    findAllSellersPOS()
  }, [])

  const findAllSellersPOS = () => {
    setLoading(true)
    findSellers()
      .then(({data}) => {
        setSellers(data)
        setSuggestions(data)
        setLoading(false)
      })
      .catch((error) => {
        setLoading(false)
      });
  }

  const searchSellers = (e) => {
    const { value } = e.target
    if(value !== "") {
      const filteredSellers = sellers.filter((elem) => {
        if(
          elem.id === parseInt(value) ||
          elem.description?.toLowerCase().includes(value.toLowerCase()) ||
          elem.mailCommercial?.toLowerCase().includes(value.toLowerCase())
        ) {
          return elem
        }
      })
      if(filteredSellers.length > 0) {
        setSuggestions(filteredSellers)
      } else {
        setSuggestions(sellers)
     }
    } else {
      setSuggestions(sellers)
    }
    setSearch(value)
  }

  return (
    <div className="d-flex flex-column container mt-5">
      <ModalSellers
        seller={selectedSeller}
        setSeller={setSelectedSeller}
        showModal={showModalSellers} 
        setShowModal={setShowModalSellers} 
        reloadInfo={findAllSellersPOS} 
      />
      <div className="d-flex flex-column gap-2 h-100">
        <div className="d-flex justify-content-end mt-2 gap-3">
          <input
            type="search"
            value={search}
            className="form-control form-control-sm w-100"
            placeholder="Buscar vendedor"
            onChange={searchSellers }
          />
          <button
            title="Nuevo vendedor"
            className="d-flex align-items-center text-nowrap btn btn-sm btn-danger text-light gap-1" 
            onClick={(e) => setShowModalSellers(!showModalSellers)}>
              Nuevo vendedor
              <BsIcons.BsPersonFillAdd style={{width: 15, height: 15}} />
          </button>
        </div>
        <TableSellers
          sellers={suggestions} 
          setShowModal={setShowModalSellers} 
          setSelectedSeller={setSelectedSeller}
          loading={loading} 
        />
      </div>
    </div>
  )
}