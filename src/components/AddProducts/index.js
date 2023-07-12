import { useEffect, useState } from "react";
import * as Bi from "react-icons/bi";
import TableProducts from "../TableProducts";
import { getAllProducts, getOneProduct } from "../../services/productService";

function AddProducts({productosAgr, setProductosAgr}) {
  const [products, setProducts] = useState();
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [datos, setDatos] = useState({
    idProducto: "",
    description: "",
    cantidad: "",
    listaPrecios: "",
    precio: "",
  });

  useEffect(() => {
    getAllProducts().then((res) => setProducts(res));
  }, []);

  const handlerChange = (e) => {
    const { id, value } = e.target;
    setDatos({
      ...datos,
      [id]: value,
    });
  };

  const findById = (e) => {
    const { value } = e.target;
    const item = products.find((elem) => elem.id === parseInt(value));

    if (item) {
      setProductoSeleccionado(item);
    } else {
      setProductoSeleccionado(null);
    }
  };

  const findByDescription = () => {};

  const handlerSubmit = (e) => {
    e.preventDefault();
    if (!productoSeleccionado) {
      return 0;
    }
    const list = [...productosAgr.agregados];
    const newProducto = {
      id: productoSeleccionado.id,
      description: productoSeleccionado.description,
      amount: datos.cantidad,
      um: productoSeleccionado.um,
      price: datos.precio,
      total: datos.cantidad * datos.precio,
    };
    const newTotal = productosAgr.total + newProducto.total;

    list.push(newProducto);
    setProductosAgr({
      agregados: list,
      total: newTotal,
    });
    cleanForm();
  };

  const cleanForm = () => {
    setProductoSeleccionado(null);
    setDatos({
      idProducto: "",
      description: "",
      cantidad: "",
      listaPrecios: "",
      precio: "",
    });
  };

  return (
    <>
      <div className="bg-light rounded shadow-sm p-3 mb-3">
        <div>
          <label className="fw-bold">AGREGAR PRODUCTOS</label>
          <form className="row row-cols-sm-2 row-cols-sm-3">
            <div className="col w-25">
              <label>Referencia:</label>
              <input
                id="idProducto"
                type="number"
                value={datos.idProducto}
                className="form-control form-control-sm"
                min={1000}
                onChange={(e) => {
                  handlerChange(e);
                  findById(e);
                }}
                required
              />
            </div>
            <div className="w-50">
              <label>Descripción:</label>
              <input
                type="description"
                value={productoSeleccionado?.description || ""}
                className="form-control form-control-sm"
                disabled
                required
              />
            </div>
            <div className="w-25">
              <label>U.M.:</label>
              <input
                type="text"
                value={productoSeleccionado?.um || ""}
                className="form-control form-control-sm"
                disabled
                required
              />
            </div>
            <div className="">
              <label>Cantidad:</label>
              <input
                id="cantidad"
                type="number"
                value={datos.cantidad}
                min={0}
                className="form-control form-control-sm"
                onChange={handlerChange}
                required
              />
            </div>
            <div className="">
              <label>Lista de precios:</label>
              <input
                id="listaPrecios"
                value={datos.listaPrecios}
                className="form-control form-control-sm"
                autoComplete="off"
                onChange={handlerChange}
              />
            </div>
            <div className="">
              <label>Precio:</label>
              <input
                id="precio"
                type="number"
                min={0}
                value={datos.precio}
                className="form-control form-control-sm"
                onChange={handlerChange}
                required
              />
            </div>
            <div className="d-flex justify-content-end w-100 mt-2">
              <button
                type="submit"
                className="d-flex align-items-center btn btn-sm btn-primary"
                onClick={handlerSubmit}
              >
                Agregar producto
                <Bi.BiCartAdd style={{ width: 20, height: 20 }} />
              </button>
            </div>
          </form>
        </div>
        <TableProducts list={productosAgr} setList={setProductosAgr} />
      </div>
    </>
  );
}

export default AddProducts;
