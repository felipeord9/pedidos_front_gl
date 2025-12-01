import { useEffect, useRef, useState, useContext } from "react";
import AuthContext from "../../context/authContext";
import { createMultiple } from "../../services/clientsPosService";
import { VscGitPullRequestNewChanges } from "react-icons/vsc";
import { Modal } from "react-bootstrap";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import * as Fa from "react-icons/fa";
import "./styles.css";


function ExcelClientsPos() {
  const [clients, setClients] = useState({
    agregados: [],
  });
  const [loading, setLoading] = useState(false);
  const [datos, setDatos] = useState({
    cedulaPropietario: "",
    nombrePropietario: "",
    celularPropietario: "",
    correoPropietario: "",
    placa: "",
    tipo: "",
    concepto: "",
    numPlacas: "",
    servicio: "",
    observations: "",
  });
  const [errors, setErrors] = useState([]);
  const { user } = useContext(AuthContext);

  const handlerSubmit = (e) => {
    e.preventDefault();
    if (clients.agregados.length <= 0) {
      Swal.fire({
        title: "¡Atención!",
        text: "No hay clientes en la lista, agregue al menos uno",
        icon: "warning",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#198754",
        timer: 2500,
      });
    } else {
      setLoading(true);
      const body = {
        clients: clients,
        createdAt: new Date(),
      };
      createMultiple(body)
        .then(() => {
          setLoading(false);
          Swal.fire({
            title: "¡FELICIDADES!",
            text: "Se han registrado los clientes pos de forma exitosa",
            showConfirmButton: true,
            showCancelButton: false,
            confirmButtonColor: "green",
          }).then(() => {
            window.location.reload();
          });
        })
        .catch((error) => {
          setLoading(false);
          Swal.fire({
            title: `¡ERROR!`,
            text: "Ha ocurrido un error al momento de hacer el registro de los clientes pos. Vuelve a intentarlo mas tarde.",
            showConfirmButton: true,
            showCancelButton: false,
            confirmButtonColor: "red",
          });
        });
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];

    const reader = new FileReader();
    reader.onload = (event) => {
      const bstr = event.target.result;
      const workbook = XLSX.read(bstr, { type: "binary" });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" }); // defval evita undefined

      const newErrors = [];
      const list = [];

      jsonData.forEach((datos, rowIndex) => {
        const requiredFields = [
          "coId",
          "coDescription",
          "descripcion",
          "telefono",
          "direccion",
          "plazo",
        ];

        // Validar campos vacíos
        requiredFields.forEach((field) => {
          if (!datos[field] || datos[field].toString().trim() === "") {
            newErrors.push(
              `Fila ${rowIndex + 2} - Columna "${field}" está vacía.`
            );
          }
        });

        // Si no hay errores en esta fila, agregar a la lista
        if (!newErrors.length) {
          const newPlaca = {
            coId: datos.coId,
            coDescription: datos.coDescription,
            razonSocial: datos.descripcion.toUpperCase(),
            telefono: datos.telefono,
            direccion: datos.direccion.toUpperCase(),
            plazo: datos.plazo,
            createdAt: new Date(),
            createdBy: user.name,
            idCreator: user.id,
          };

          list.push(newPlaca);
        }
      });

      if (newErrors.length > 0) {
        setErrors(newErrors);
        /* setData([]); */ // No mostrar la tabla si hay errores
        setClients({ agregados: [], total: 0 });
      } else {
        setErrors([]);
        /* setData(jsonData); */ // Puedes mostrar el json original si gustas
        setClients({
          agregados: list,
          total: list.length,
        });
      }
    };

    reader.readAsBinaryString(file);
  };

  const deleteProductList = (e) => {
    const { id } = e.target.parentNode;
    Swal.fire({
      icon: "warning",
      title: "¡Cuidado!",
      html: `
        <div>¿Está seguro que desea eliminar la solicitud de la lista?</div>
        <div>${clients.agregados[id].cedulaPropietario} - ${clients.agregados[id].nombrePropietario} -  placa: ${clients.agregados[id].placa}</div>
      `,
      showConfirmButton: true,
      confirmButtonText: "Si, eliminar",
      confirmButtonColor: "#dc3545",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      allowEnterKey: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        let newList = [...clients.agregados];
        let newTotal = formater(clients?.length);
        if (newList?.length === 1) {
          newList = [];
        } else {
          newList.splice(id, 1);
        }
        setClients({
          agregados: newList,
          total: newTotal,
        });
      }
    });
  };

  const restoreProductList = (e) => {
    Swal.fire({
      icon: "warning",
      title: "¡Cuidado!",
      html: `
        <div>¿Está seguro que desea restaurar la lista de solicitudes?</div>
        <div>Vaciará la lista por completo, esta acción no se puede rehacer</div>
      `,
      showConfirmButton: true,
      confirmButtonText: "Si, restaurar",
      confirmButtonColor: "#dc3545",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      allowEnterKey: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        setClients({
          agregados: [],
          total: "0",
        });
      }
    });
  };

  const formater = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = "$1.";
    let arr = number.toString().split(".");
    arr[0] = arr[0].replace(exp, rep);
    return arr[1] ? arr.join(".") : arr[0];
  };

  return (
    <div
      className="container d-flex flex-column w-100 py-3 mt-5"
      style={{ fontSize: 10.5 }}
    >
      <div className="bg-light rounded shadow-sm p-3 mb-2">
        <div>
          <h6 className="fw-bold">EXPORTAR EXCEL CON CLIENTES POS</h6>
          <form className=" mt-1" /* onSubmit={handlerSubmit} */>
            <div className="mt-2">
              <h6>Subir Excel</h6>
              <input
                type="file"
                accept=".xlsx, .xls"
                className="d-flex w-100"
                onChange={handleFileUpload}
              />

              {errors?.length > 0 && (
                <div style={{ color: "red", marginTop: "10px" }}>
                  <h4>Errores encontrados:</h4>
                  <ul>
                    {errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {clients?.length > 0 && (
                <table
                  border="1"
                  style={{ marginTop: "20px", borderCollapse: "collapse" }}
                >
                  <thead>
                    <tr>
                      {Object.keys(clients[0]).map((key) => (
                        <th key={key} style={{ padding: "5px" }}>
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* {clients?.map((row, idx) => (
                      <tr key={idx}>
                        {Object.values(row).map((val, i) => (
                          <td key={i} style={{ padding: "5px" }}>
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))} */}
                  </tbody>
                </table>
              )}
            </div>
            <div className="table-responsive mt-2 mb-3 rounded" style={{maxHeight:'60vh'}}>
              <table className="table table-bordered table-hover align-middle text-center m-0 caption-top">
                <caption>SOLICITUDES AGREGADAS</caption>
                <thead className="table-light">
                  <tr>
                    <th style={{ width: 180 }}>coId</th>
                    <th style={{ width: 200 }}>coDescripcion</th>
                    <th style={{ width: 150 }}>Cliente</th>
                    <th style={{ width: 150 }}>Telefono</th>
                    <th style={{ width: 200 }}>Direccion</th>
                    <th style={{ width: 200 }}>Plazo</th>
                    <th style={{ width: 49 }}>
                      {clients?.length > 1 && (
                        <button
                          type="button"
                          className="d-flex align-items-center btn btn-danger m-auto p-0"
                          title="Restaurar"
                          onClick={restoreProductList}
                        >
                          <Fa.FaTrashRestore
                            style={{ width: 30, height: 30 }}
                            className="p-2"
                          />
                        </button>
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {clients.agregados?.map((elem, index) => (
                    <tr>
                      <td className="text-start">{elem.coId}</td>
                      <td>{elem.coDescription}</td>
                      <td className="text-center">{elem.razonSocial}</td>
                      <td className="text-center">{elem.telefono}</td>
                      <td className="text-center">{elem.direccion}</td>
                      <td>{elem.plazo}</td>
                      <td>
                        <button
                          id={index}
                          title="Borrar producto"
                          type="button"
                          className="d-flex align-items-center btn btn-danger m-auto p-0"
                          onClick={deleteProductList}
                        >
                          <Fa.FaTrash
                            id={index}
                            style={{ width: 30, height: 30 }}
                            className="p-2"
                          />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="fw-bold">CANTIDAD</td>
                    <td colSpan={5}></td>
                    <td className="fw-bold text-center">{clients?.total}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <Modal show={loading} centered>
              <Modal.Body>
                <div className="d-flex align-items-center">
                  <strong className="text-danger" role="status">
                    Cargando...
                  </strong>
                  <div
                    className="spinner-grow text-danger ms-auto"
                    role="status"
                  ></div>
                </div>
              </Modal.Body>
            </Modal>
            <div className="d-flex justify-content-center w-100 mt-3">
              <button
                type="submit"
                className="d-flex align-items-center justify-content-center btn btn-sm btn-primary bt-add"
                onClick={handlerSubmit}
              >
                REGISTRAR CLIENTES
                <VscGitPullRequestNewChanges
                  className="ms-1"
                  style={{ width: 20, height: 20 }}
                />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ExcelClientsPos;
