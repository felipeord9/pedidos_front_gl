import { useEffect, useRef, useState } from "react";
import * as Bi from "react-icons/bi";
import TableProducts from "../TableProducts";
import { getAllProducts } from "../../services/productService";

function AddProducts({ productosAgr, setProductosAgr }) {
  const [products, setProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [datos, setDatos] = useState({
    idProducto: "",
    description: "",
    cantidad: "",
    listaPrecios: "",
    precio: "",
  });
  const ref = useRef();

  useEffect(() => {
    getAllProducts().then((res) => {
      setProducts(res);
      setSuggestions(res);
    });
  }, []);

  const formater = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = "$1.";
    let arr = number.toString().split(".");
    arr[0] = arr[0].replace(exp, rep);
    return arr[1] ? arr.join(".") : arr[0];
  };

  const handlerChangePrice = (e) => {
    const { id, value } = e.target;
    setDatos({
      ...datos,
      [id]: formater(value.split(".").join("")),
    });
  };

  const handlerChangeSuggestions = (e) => {
    const { value } = e.target;
    setProductoSeleccionado(null);
    if (value !== "") {
      const filter = products.filter((elem) =>
        elem.item.descripcion.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filter);
    } else {
      setSuggestions(products);
    }
    ref.current.selectedIndex = 0;
    setDatos({
      ...datos,
      idProducto: "",
      description: value,
    });
  };

  const handlerChange = (e) => {
    const { id, value } = e.target;
    setDatos({
      ...datos,
      [id]: value,
    });
  };

  const findById = (e) => {
    const { value } = e.target;
    const item = products.find((elem) => parseInt(elem.item.codigo) === parseInt(value));

    if (item) {
      setProductoSeleccionado(item);
    } else {
      setProductoSeleccionado(null);
    }
  };

  const handlerSubmit = (e) => {
    e.preventDefault();
    if (!productoSeleccionado || !datos.cantidad || !datos.precio) {
      return 0;
    }
    const list = [...productosAgr.agregados];
    const newProducto = {
      id: productoSeleccionado.item.codigo,
      description: productoSeleccionado.item.descripcion,
      amount: Number(datos.cantidad),
      um: productoSeleccionado.item.um,
      price: datos.precio,
      total: formater(
        Number(datos.cantidad) * Number(datos.precio.split(".").join(""))
      ),
    };
    const newTotal = formater(
      Number(productosAgr.total.split(".").join("")) +
        Number(newProducto.total.split(".").join(""))
    );

    list.push(newProducto);
    setProductosAgr({
      agregados: list,
      total: newTotal,
    });
    cleanForm();
  };
  
  const cleanForm = () => {
    setSuggestions(products)
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
      <div className="bg-light rounded shadow-sm p-3 mb-2">
        <div>
          <label className="fw-bold">AGREGAR PRODUCTOS</label>
          <form className="row row-cols-sm-2" /* onSubmit={handlerSubmit} */>
            <div className="col w-25">
              <label>Referencia:</label>
              <input
                id="idProducto"
                type="number"
                placeholder="Completa este campo para agregar"
                value={
                  productoSeleccionado
                    ? parseInt(productoSeleccionado.item.codigo)
                    : datos.idProducto
                }
                className="form-control form-control-sm"
                min={1000}
                aria-controls="off"
                onChange={(e) => {
                  handlerChange(e);
                  findById(e);
                }}
                required
              />
            </div>
            <div className="w-50">
              <label>Descripción:</label>
              <div className="d-flex align-items-center position-relative w-100">
                <input
                  id="description"
                  type="search"
                  autoComplete="off"
                  placeholder="Selecciona un producto para agregarlo"
                  value={
                    productoSeleccionado
                      ? productoSeleccionado?.item.descripcion
                      : datos.description
                  }
                  onChange={handlerChangeSuggestions}
                  className="form-control form-control-sm input-select"
                  required={productoSeleccionado ? false : true}
                />
                <select
                  ref={ref}
                  className="form-select form-select-sm"
                  onChange={findById}
                  required
                >
                  <option value="" selected disabled>
                    -- SELECCIONE --
                  </option>
                  {suggestions.sort((a, b) => parseInt(a.item.codigo) - parseInt(b.item.codigo)).map((elem, index) => (
                    <option key={index} value={elem.item.codigo}>
                      {elem.item.codigo} - {elem.item.descripcion}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="w-25">
              <label>U.M.:</label>
              <input
                type="text"
                value={productoSeleccionado?.item.um || ""}
                className="form-control form-control-sm"
                disabled
                required
              />
            </div>
            <div className="w-50">
              <label>Cantidad:</label>
              <input
                id="cantidad"
                type="number"
                placeholder="Completa este campo para agregar"
                value={datos.cantidad}
                min={0.1}
                className="form-control form-control-sm"
                onChange={handlerChange}
                required
              />
            </div>
            {/* <div className="">
              <label>Lista de precios:</label>
              <input
                id="listaPrecios"
                value={datos.listaPrecios}
                className="form-control form-control-sm"
                autoComplete="off"
                onChange={handlerChange}
              />
            </div> */}
            <div className="w-50">
              <label>Precio:</label>
              <input
                id="precio"
                type="number"
                placeholder="Completa este campo para agregar"
                min={50}
                value={datos.precio}
                className="form-control form-control-sm"
                onChange={handlerChangePrice}
              />
            </div>
            <div className="d-flex justify-content-center w-100 mt-2">
              <button
                type="submit"
                className="d-flex align-items-center justify-content-center btn btn-sm btn-primary w-100"
                onClick={handlerSubmit}
              >
                AGREGAR PRODUCTO
                <Bi.BiCartAdd style={{ width: 20, height: 20 }} />
              </button>
            </div>
          </form>
        </div>
      </div>
      <TableProducts
        list={productosAgr}
        setList={setProductosAgr}
        formater={formater}
      />
    </>
  );
}

export default AddProducts;
