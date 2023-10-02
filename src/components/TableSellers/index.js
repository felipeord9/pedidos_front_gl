import * as FiIcons from 'react-icons/fi';
import DataTable from 'react-data-table-component'

export default function TableSellers({ sellers, loading, setSelectedSeller, setShowModal }) {
  const columns = [
    {
      id: "id",
      name: "Id.",
      selector: (row) => row.id,
      sortable: true,
      width: '90px'
    },
    {
      id: "name",
      name: "Nombre",
      selector: (row) => row.description,
      sortable: true,
    },
    {
      id: "mail",
      name: "Correo",
      selector: (row) => row.mailCommercial,
      sortable: true,
    },
    {
      id: "options",
      name: "Acciones",
      center: true,
      cell: (row, index, column, id) => (
        <div className='d-flex gap-2 p-1'>
          <button title="Editar usuario" className='btn btn-sm btn-primary' onClick={(e) => {
            setSelectedSeller(row)
            setShowModal(true)
          }}>
            <FiIcons.FiEdit />
          </button>
        </div>
      ),
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
        data={sellers}
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
        paginationPerPage={50}
        paginationRowsPerPageOptions={[15, 25, 50, 100]}
        noDataComponent={
        <div style={{padding: 24}}>Ningún resultado encontrado.</div>}
      />
    </div>
  )
}