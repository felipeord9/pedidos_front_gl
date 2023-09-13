import { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component'

function TableOrders({ orders }) {
  const [loading, setLoading] = useState(false)
  const columns = [
    {
      id: "no",
      name: "No.",
      selector: (row) => row.id,
      sortable: true,
      width: '66px'
    },
    {
      id: "row_co_id",
      name: "No. Ped.",
      selector: (row) => `${row.coId}-PDV-${row.rowId}`,
      width: '110px'
    },
    {
      id: "co_id",
      name: "Id. C.O",
      selector: (row) => row.coId,
      width: '83px'
    },
    {
      id: "co_description",
      name: "Desc. C.O",
      selector: (row) => row.coDescription,
      sortable: true,
      width: '200px'
    },
    {
      id: "client_id",
      name: "Id. Cliente",
      selector: (row) => row.clientId,
      sortable: true,
      width: '110px'
    },
    {
      id: "client_description",
      name: "Razón Social Cliente",
      selector: (row) => row.clientDescription,
      sortable: true,
      width: '157px'
    },
    {
      id: "branch_id",
      name: "Id. Sucursal",
      selector: (row) => row.branchId,
      sortable: true,
      width: '110px'
    },
    {
      id: "branch_description",
      name: "Desc. Sucursal",
      selector: (row) => row.branchDescription,
      sortable: true,
      width: '200px'
    },
    {
      id: "seller_id",
      name: "Id. Vendedor",
      selector: (row) => row.sellerId,
      sortable: true,
      width: '117px'
    },
    {
      id: "seller_description",
      name: "Desc. Vendedor",
      selector: (row) => row.sellerDescription,
      sortable: true,
      width: '200px'
    },
    {
      id: "created_at",
      name: "Fecha Creación",
      selector: (row) => new Date(row.createdAt).toLocaleString("es-CO"),
      sortable: true,
      width: '180px'
    },
    {
      id: "total",
      name: "Total",
      selector: (row) => formater(row.total),
      sortable: true,
      width: '175px'
    },
    {
      id: "notes",
      name: "Observaciones",
      selector: (row) => formater(row.observations),
      sortable: true,
      width: '550px'
    },
  ];

  const formater = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = "$1.";
    let arr = number.toString().split(".");
    arr[0] = arr[0].replace(exp, rep);
    return arr[1] ? arr.join(".") : arr[0];
  };

  return (
    <div
        className="d-flex flex-column rounded"
        style={{ height: "calc(100% - 60px)", width: '100%' }}
      >
        <DataTable
          className="text-center border border-2 h-100"
          columns={columns}
          data={orders}
          fixedHeaderScrollHeight={200}
          progressPending={loading}
          progressComponent={
            <div class="d-flex align-items-center text-primary gap-2 mt-2">
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
          paginationPerPage={10}
          paginationRowsPerPageOptions={[10, 20, 40]}
        />
      </div>
  )
}

export default TableOrders