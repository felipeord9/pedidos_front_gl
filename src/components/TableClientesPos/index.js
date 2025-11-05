import * as FiIcons from 'react-icons/fi';
import DataTable from 'react-data-table-component'
import { useNavigate } from 'react-router-dom';

export default function TableClientsPos({ clients, loading, setSelectedClient, setShowModal }) {
  const navigate = useNavigate();
  const columns = [
    {
      id: "options",
      name: "",
      center: true,
      cell: (row, index, column, id) => (
        <div className='d-flex gap-2 p-1'>
          <button title="Editar usuario" className='btn btn-sm btn-primary' onClick={(e) => {
            navigate(`/edit/client/pos/${row.id}`)
          }}>
            <FiIcons.FiEdit />
          </button>
        </div>
      ),
      width: '50px'
    },
    {
      id: "co",
      name: "C.O.",
      selector: (row) => row.coId,
      sortable: true,
      width: '88px'
    },
    {
      id: "razonSocial",
      name: "Razón social",
      selector: (row) => row.razonSocial,
      sortable: true,
      width: '350px'
    },
    {
      id: "telefono",
      name: "Teléfono",
      selector: (row) => row.telefono,
      sortable: true,
    },
    {
      id: "direccion",
      name: "Dirección",
      selector: (row) => row.direccion,
      sortable: true,
      width: '200px'
    },
    {
      id: "plazo",
      name: "Plazo",
      selector: (row) => `${row.plazo} días`,
      sortable: true,
      width: '100px'
    },
    {
      id: "createdBy",
      name: "Creador por",
      selector: (row) => row.createdBy,
      sortable: true,
      width: '200px'
    },
    {
      id: "fotoLocal",
      name: "Foto",
      selector: (row) => row.fotoLocal === true ? '✅' : '❌',
      sortable: true,
      width: '90px'
    },
    {
      id: "createdAt",
      name: "Fecha creación",
      selector: (row) => new Date(row.createdAt).toLocaleString("es-CO"),
      sortable: true,
      width: '200px'
    },
    {
      id: "updatedBy",
      name: "Actualizado por",
      selector: (row) => row.updatedBy,
      sortable: true,
      width: '200px'
    },
    {
      id: "updatedAt",
      name: "Fecha Actualización",
      selector: (row) => row.updatedAt !== null && new Date(row.updatedAt).toLocaleString("es-CO"),
      sortable: true,
      width: '200px'
    },
  ]
  
  return (
    <div
      className="d-flex flex-column rounded"
      style={{ height: "calc(100% - 60px)", width: '100%' }}
    >
      <DataTable
        className="bg-light text-center border border-2 h-100 w-100"
        columns={columns}
        data={clients}
        fixedHeaderScrollHeight={200}
        progressPending={loading}
        progressComponent={
          <div class="d-flex align-items-center text-danger gap-2 mt-2">
            <strong>Cargando...</strong>
            <div
              class="spinner-border spinner-border-sm ms-auto"
              role="status"
              aria-hidden="true"
            ></div>
          </div>
        }
        dense
        striped
        fixedHeader
        pagination
        paginationComponentOptions={{
          rowsPerPageText: "Filas por página:",
          rangeSeparatorText: "de",
          selectAllRowsItem: false,
        }}
        paginationPerPage={15}
        paginationRowsPerPageOptions={[15, 25, 50]}
        noDataComponent={
        <div style={{padding: 24}}>Ningún resultado encontrado.</div>}
      />
    </div>
  )
}