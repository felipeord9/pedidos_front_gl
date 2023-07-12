import { useState } from "react";
import * as Fa from "react-icons/fa";

function TableProducts({ list, setList }) {
  const deleteProductList = (e) => {
    const {id} = e.target.parentNode
    let newList = [...list.agregados]
    let newTotal = list.total - newList[id].total
    if(newList.length === 1) {
      newList = []
    } else {
      newList.splice(id, 1)
    }
    setList({
      agregados: newList,
      total: newTotal
    })
  };

  return (
    <div className="table-responsive mt-2">
      <table className="table table-light table-bordered table-striped table-hover align-middle text-center m-0">
        <thead>
          <tr>
            <th style={{ width: 15 }}>Ref.</th>
            <th>Descripción</th>
            <th style={{ width: 50 }}>Cantidad</th>
            <th style={{ width: 15 }}>UM</th>
            <th>Precio</th>
            <th>Valor total</th>
            <th style={{width: 49}}></th>
          </tr>
        </thead>
        <tbody>
          {list.agregados.map((elem, index) => (
            <tr>
              <td>{elem.id}</td>
              <td className="text-start">{elem.description}</td>
              <td>{elem.amount}</td>
              <td>{elem.um}</td>
              <td className="text-end">${elem.price}</td>
              <td className="text-end">${elem.total}</td>
              <td>
                <button
                  id={index}
                  type="button"
                  className="d-flex align-items-center btn btn-danger m-auto p-0"
                  onClick={deleteProductList}
                >
                  <Fa.FaTrash id={index} style={{width: 30, height: 30}} className="p-2" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td className="fw-bold">TOTAL</td>
            <td colSpan={4}></td>
            <td className="fw-bold text-end">${list.total}</td>
            <td className="fw-bold text-end"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default TableProducts;