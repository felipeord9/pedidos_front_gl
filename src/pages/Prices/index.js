import { useEffect, useState, useContext, useRef } from "react";
import Swal from "sweetalert2";
import { Modal } from "react-bootstrap";
import ComboBox from "../../components/ComboBox";
import AuthContext from "../../context/authContext";
import ClientContext from "../../context/clientContext";
import { createRequest , sendMail } from "../../services/requestService";
import { getAllClients } from "../../services/clientService";
import { getAllAgencies } from "../../services/agencyService";
import { getAllProducts } from "../../services/productService";
import {  NumericFormat  }  from  'react-number-format' ;
import { MdAssignmentAdd } from "react-icons/md";
import { getAllinstalaciones } from "../../services/instalacionService";
import TableProductsRequest from '../../components/tablaRequest'
import "./styles.css";
import { getOneCostByInstall , getByinstallAndItem } from "../../services/margenService";
import { getOne } from "../../services/precioService";

export default function Prices() {
  const { user } = useContext(AuthContext);
  const { client, setClient } = useContext(ClientContext);
  /* const [agencia, setAgencia] = useState(null); */
  const [sucursal, setSucursal] = useState(null);
  const [invoiceType, setInvoiceType] = useState(false);
  const [destination, setDestination] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [search, setSearch] = useState({
    idCliente: "",
    descCliente: "",
    deliveryDate: "",
    observations: "",
    order: "",
  });
  const [loading, setLoading] = useState(false);
  const selectBranchRef = useRef();
  const limitDeliveryDateField = new Date()
  limitDeliveryDateField.setHours(2)

  //lista donde se alojaran todos los productos que se agregen a la solicitud
  const [productosAgr, setProductosAgr] = useState({
    agregados: [],
    total: "0",
  });  

  //contante donde se guardaran las instalaciones para luego hacer la busqueda
  const [Instalaciones, setInstalaciones] = useState([]);

  const [products, setProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  //constante donde se ajolara la informacion del producto seleccionado
  const [datos, setDatos] = useState({
    idProducto: "",
    description: "",
    cantidad: "",
    costoPromedio: "",
    precio: "",
    precioAuth:'',
    existencia:'',
    margenActual:'',
    margenNueva:'',
  });
  const ref = useRef();

  //equivalencia entre el id de la instancia y la id de la lista de precio
  const listaPrecios = [
    { IdInstalacion: '001' , IdListaPrecio: '998' },
    { IdInstalacion: '004' , IdListaPrecio: '025' },
    { IdInstalacion: '005' , IdListaPrecio: '025' },
    { IdInstalacion: '007' , IdListaPrecio: '007' },
    { IdInstalacion: '008' , IdListaPrecio: '023' },
    { IdInstalacion: '010' , IdListaPrecio: '803' },
    { IdInstalacion: '011' , IdListaPrecio: '803' },
    { IdInstalacion: '012' , IdListaPrecio: '087' },
    { IdInstalacion: '013' , IdListaPrecio: '086' },
    { IdInstalacion: '014' , IdListaPrecio: '160' },
    { IdInstalacion: '015' , IdListaPrecio: '024' },
    { IdInstalacion: '016' , IdListaPrecio: '085' },
    { IdInstalacion: '017' , IdListaPrecio: '084' },
    { IdInstalacion: '023' , IdListaPrecio: '802' },
    { IdInstalacion: '025' , IdListaPrecio: '250' },
    { IdInstalacion: '026' , IdListaPrecio: '251' },
    { IdInstalacion: '027' , IdListaPrecio: '161' },
    { IdInstalacion: '030' , IdListaPrecio: '025' },
    { IdInstalacion: '034' , IdListaPrecio: '086' },
    { IdInstalacion: '035' , IdListaPrecio: '161' },
    { IdInstalacion: '036' , IdListaPrecio: '161' },
  ];

  //funcion para hacer la busqueda en el input de la descricion del producto
  // y para que cuando se borre se eliminen tambien los otros campos de texto
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
      costoPromedio:'',
      cantidad:'',
      existencia:'',
      precio:'',
      precioAuth:'',
      description: value,
      margenActual:'',
      margenNueva:'',
    });
    setPrecio('')
  };

  //funcion para borrar los demas campos de texto cuando se borre cuando se borre 
  //un numero de la referencia del producto
  const handlerChangeRefer = (e) => {
    e.preventDefault();
    ref.current.selectedIndex = 0;
    setDatos({
      ...datos,
      idProducto: "",
      costoPromedio:'',
      cantidad:'',
      existencia:'',
      precio:'',
      precioAuth:'',
      description: '',
      margenActual:'',
      margenNueva:'',
    });
    setPrecio('')
  };

  //funciones para traer instancias de la base de datos
  useEffect(() => {
    getAllClients().then((data) => setClientes(data));
    getAllProducts().then((res) => {
      setProducts(res);
      setSuggestions(res);
    });
    getAllinstalaciones().then((data) => setInstalaciones(data));
  }, []);

  const [precio, setPrecio] = useState({})

  const [currentMargen, setCurrentMargen] = useState('')
  const [newMargen, setNewMargen] = useState('')
  const [costoPromedio, setCostoPromedio] = useState('')

  const busquedaDeCosto = (e) => {
    e.preventDefault();
    /* getByinstallAndItem('001','2490') */
    getOneCostByInstall('017')
    .then((data)=>{
      Swal.fire({
        text:`${JSON.stringify(data)}`
      })
    })
  }

  const findItem = (e) => {
    const { value } = e.target;
    const item = products.find((elem) => parseInt(elem.item.codigo) === parseInt(value));

    if (item) {
      setProductoSeleccionado(item);
    } else {
      setProductoSeleccionado(null);
    }
  };

  //funcion para hacer la busqueda con referencia 
  const findByIdProduct = (e) => {

    const { value } = e.target;

    if(/^\d{4}$/.test(value)){

      // Muestra la barra de carga
      let timerInterval;
      Swal.fire({
        title: 'Buscando...',
        text: 'Por favor, espera...',
        timer: 2000,
        timerProgressBar: true,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
          const timer = Swal.getPopup().querySelector("b");
          timerInterval = setInterval(() => {
            
          }, 100);
        },
        willClose: () => {
          clearInterval(timerInterval);
        },
        onBeforeOpen: () => {
          Swal.showLoading();
        },
        showConfirmButton: false,
      });

      //inicializar parametros de busqueda
      setPrecio({})
      setDatos({
        ...datos,
        precio:''
      })
      setProductoSeleccionado(null);
      //filtrar el item y guardarlo en la constante "idExt"
      const item = products.find((elem) => parseInt(elem.item.codigo) === parseInt(value));
      const idExt = item && item.itemId
  
      //buscar costo por instalacion seleccionada
      getByinstallAndItem(sugesInstall,idExt)
      .then((data)=>{
        let datos = data
  
        //filtramos los costo encontrados para descartar cuanod el costo promedio es 0
        const last = datos.filter((item)=>item.costoPromedio !== 0 && item.ultimocosto !== 0 && item.ultimaFecha !== null)
  
        //filtrar por id del item seleccionado
        const idItemSelected = last.filter((item)=>item.IdItemExt === idExt)
  
        //descartar si no hay existencia
        const filNotExit = idItemSelected.filter((item)=>item.existencia !== 0 )
  
        let costo = null;
        costo = filNotExit.map((item)=>item.costoPromedio)
        let existencia = null;
        existencia = filNotExit.map((item)=>item.existencia)
  
        const cost = filNotExit.map((item)=>item.costoPromedio)

        if(costo !== null && existencia !== null){
          setDatos({
            ...datos,
            costoPromedio: costo,
            existencia: existencia
          })
          setCostoPromedio(cost)
        }
  
        if(filNotExit.length !== 0 ){
          setProductoSeleccionado(item);
  
          //buscar precio por id de item
          getOne(idExt)
            .then((data)=>{
              const precios = data
              const precio = precios.filter((item)=>item.precioMinimo !== 0 && item.precioMaximo !== 0)

              //funcion para reducir el resultado por fechas y dejar la fecha del precio mas actual
              const reduce = precio.reduce((acc, item)=>{
                // Si no existe el IdListaPrecio en el acumulador, lo añadimos
                if (!acc[item.IdListaPrecio]) {
                  acc[item.IdListaPrecio] = item;
                } else {
                  // Comparamos las fechas y mantenemos la más actualizada
                  const fechaActual = new Date(acc[item.IdListaPrecio].fechaActivacion);
                  const fechaNueva = new Date(item.fechaActivacion);
                  
                  if (fechaNueva > fechaActual) {
                    acc[item.IdListaPrecio] = item;
                  }
                }
                return acc;
              },{})

              //volvemos objeto tipo lista al resultado del filtro
              const resultado = Object.values(reduce);
              //encontramos la lista de precio que coincide con id de la instalacion que seleccionaron
              const idListaPrecio = listaPrecios.find((item)=>item.IdInstalacion === sugesInstall)
              //guardamos el id de la lista en una constante
              const idList = idListaPrecio && idListaPrecio.IdListaPrecio
              //filtramos los resultados de lista de precios por fecha con el id de la lista del item
              const listAndPrice = resultado.filter((item)=>item.IdListaPrecio===idList)
              //guardamos en una constante el precio minimo del item resultante
              const uniquePrice = listAndPrice.map((item)=>item.precioMinimo)

              //funcion para calcular la margen actual y nueva margen
              const ActualMargen = (uniquePrice - costo) / uniquePrice

              if(reduce.length !== 0 && resultado.length !== 0 && listAndPrice.length !== 0 && uniquePrice){
                setDatos({
                  ...datos,
                  precio: uniquePrice,
                  margenActual: ActualMargen,
                })
                setPrecio(uniquePrice)
                setCurrentMargen(ActualMargen)
                Swal.close();
              }else{
                Swal.close();
                Swal.fire({
                  icon:'question',
                  title:`¡ATENCION!`,
                  text:'No hay precio unitario establecido para este producto. ¿Desea hacer la solicitud de todas formas?',
                  confirmButtonText:'SI',
                  denyButtonText:'NO',
                })
                .then(({ isConfirmed , isDenied }) => {
                  if(isDenied){
                    cleanForm()
                  }
                })
              }
            })
            .catch((error)=>{
              Swal.fire({
                icon:'question',
                title:`¡ATENCION!`,
                text:'No hay precio unitario establecido para este producto. ¿Desea hacer la solicitud de todas formas?',
                confirmButtonText:'SI',
                denyButtonText:'NO',
              })
              .then(({ isConfirmed , isDenied }) => {
                if(isDenied){
                  cleanForm()
                }
              })
            })
          }else{
            Swal.close();
            cleanForm()
            Swal.fire({
              icon:'error',
              title:'¡ERROR!',
              text:'No hay existencia a la fecha ó no hay un costo promedio unitario asignado para este item en esta instalación. Elige uno diferente.',
              showConfirmButton:true,
            })
            setProductoSeleccionado(null);
        }
      })
      .catch((error)=>{
        Swal.fire({
          icon:'warning',
          title:`¡ATENCION!`,
          text:'No hay costo promedio unitario establecido para este producto ó no hay existencia del item. Elige uno diferente',
          showCancelButton:false,
          showConfirmButton:false,
          timer:6000
        })
        .then(() => {
          setProductoSeleccionado({})
        })
      })
    }

  };

  //funcion para hacer la busqueda por la descrpcion del item
  /* const findByDescProduct = (e) => {

    const { value } = e.target;
      // Muestra la barra de carga
      let timerInterval;
      Swal.fire({
        title: 'Buscando...',
        text: 'Por favor, espera...',
        timer: 2000,
        timerProgressBar: true,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
          const timer = Swal.getPopup().querySelector("b");
          timerInterval = setInterval(() => {
            
          }, 100);
        },
        willClose: () => {
          clearInterval(timerInterval);
        },
        onBeforeOpen: () => {
          Swal.showLoading();
        },
        showConfirmButton: false,
      });

      //inicializar parametros de busqueda
      setPrecio({})
      setDatos({
        ...datos,
        precio:''
      })
      setProductoSeleccionado(null);
      //filtrar el item y guardarlo en la constante "idExt"
      const item = products.find((elem) => parseInt(elem.item.codigo) === parseInt(value));
      const idExt = item && item.itemId
  
      //buscar costo por instalacion seleccionada
      getOneCostByInstall(sugesInstall)
      .then((data)=>{
        let datos = data
  
        //filtramos los costo encontrados para descartar cuanod el costo promedio es 0
        const last = datos.filter((item)=>item.costoPromedio !== 0 && item.ultimocosto !== 0 && item.ultimaFecha !== null)
  
        //filtrar por id del item seleccionado
        const idItemSelected = last.filter((item)=>item.IdItemExt === idExt)
  
        //descartar si no hay existencia
        const filNotExit = idItemSelected.filter((item)=>item.existencia !== 0 )
  
        let costo = null;
        costo = filNotExit.map((item)=>item.costoPromedio)
        let existencia = null;
        existencia = filNotExit.map((item)=>item.existencia)
  
        if(costo !== null && existencia !== null){
          setDatos({
            ...datos,
            costoPromedio: costo,
            existencia: existencia
          })
        }
  
        if(filNotExit.length !== 0 ){
          setProductoSeleccionado(item);
  
          //buscar precio por id de item
          getOne(idExt)
            .then((data)=>{
              const precios = data
              const precio = precios.filter((item)=>item.precioMinimo !== 0 && item.precioMaximo !== 0)
              const reduce = precio.reduce((acc, item)=>{
                // Si no existe el IdListaPrecio en el acumulador, lo añadimos
                if (!acc[item.IdListaPrecio]) {
                  acc[item.IdListaPrecio] = item;
                } else {
                  // Comparamos las fechas y mantenemos la más actualizada
                  const fechaActual = new Date(acc[item.IdListaPrecio].fechaActivacion);
                  const fechaNueva = new Date(item.fechaActivacion);
                  
                  if (fechaNueva > fechaActual) {
                    acc[item.IdListaPrecio] = item;
                  }
                }
                return acc;
              },{})
              const resultado = Object.values(reduce);
              const idListaPrecio = listaPrecios.find((item)=>item.IdInstalacion === sugesInstall)
              const idList = idListaPrecio && idListaPrecio.IdListaPrecio
              const listAndPrice = resultado.filter((item)=>item.IdListaPrecio===idList)
              const uniquePrice = listAndPrice.map((item)=>item.precioMinimo)
              const ActualMargen = (uniquePrice - costo) / uniquePrice

              if(reduce.length !== 0 && resultado.length !== 0 && listAndPrice.length !== 0 && uniquePrice){
                setDatos({
                  ...datos,
                  precio: uniquePrice,
                  margenActual: ActualMargen,
                })
                setPrecio(uniquePrice)
                setCurrentMargen(ActualMargen)
                Swal.close();
              }else{
                Swal.close();
                Swal.fire({
                  icon:'question',
                  title:`¡ATENCION!`,
                  text:'No hay precio unitario establecido para este producto. ¿Desea hacer la solicitud de todas formas?',
                  confirmButtonText:'SI',
                  denyButtonText:'NO',
                })
                .then(({ isConfirmed , isDenied }) => {
                  if(isDenied){
                    cleanForm()
                  }
                })
              }
            })
            .catch((error)=>{
              Swal.fire({
                icon:'question',
                title:`¡ATENCION!`,
                text:'No hay precio unitario establecido para este producto. ¿Desea hacer la solicitud de todas formas?',
                confirmButtonText:'SI',
                denyButtonText:'NO',
              })
              .then(({ isConfirmed , isDenied }) => {
                if(isDenied){
                  cleanForm()
                }
              })
            })
          }else{
            Swal.close();
            cleanForm()
            Swal.fire({
              icon:'error',
              title:'¡ERROR!',
              text:'No hay existencia a la fecha ó no hay un costo promedio unitario asignado para este item en esta instalación. Elige uno diferente.',
              showConfirmButton:true,
            })
            setProductoSeleccionado(null);
        }
      })
      .catch((error)=>{
        Swal.fire({
          icon:'warning',
          title:`¡ATENCION!`,
          text:'No hay costo promedio unitario establecido para este producto ó no hay existencia del item. Elige uno diferente',
          showCancelButton:false,
          showConfirmButton:false,
          timer:6000
        })
        .then(() => {
          setProductoSeleccionado({})
        })
      })
  }; */

  //funcion para buscar cliente por nit
  const findById = (id, array, setItem) => {
    const item = array.find((elem) => elem.nit === id);
    if (item) {
      setItem(item);
    } else {
      setItem(null);
      setSucursal(null);
      selectBranchRef.current.selectedIndex = 0;
    }
  };

  const [sugesInstall, setSuggesInstall] = useState('')
  const handleFiltroInstall = async (e) => {
    setProductoSeleccionado(null);
    setPrecio({});
    setDatos({
      ...datos,
      precio:'',
      costoPromedio:'',
      cantidad:'',
      idProducto:'',
      description:'',
      existencia:'',
      precioAuth:'',
      margenActual:'',
      margenNueva:'',
    })

    //buscar id de la instalacion
    const instal = Instalaciones.find((elem) => parseInt(elem.id)=== parseInt(e.id));
    const id = instal && instal.id 

    setSuggesInstall(id)
  }

  const handlerChange = (e) => {
    const { id, value } = e.target;
    setDatos({
      ...datos,
      [id]: value,
    });
  };

  const handlerChangeSearch = (e) => {
    const { id, value } = e.target;
    console.log(value);
    setSearch({
      ...search,
      [id]: value,
    });
  };

  const formater = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = "$1.";
    let arr = number.toString().split(".");
    arr[0] = arr[0].replace(exp, rep);
    return arr[1] ? arr.join(".") : arr[0];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
      Swal.fire({
        title: "¿Está seguro?",
        text: "Se generará una nueva solicitud de precio",
        icon: "warning",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#198754",
        showCancelButton: true,
        cancelButtonText: "Cancelar",
      }).then(({ isConfirmed }) => {
        if (isConfirmed) {
          setLoading(true);
          const installDesc = Instalaciones.find((item)=>{
            if(item.id === sugesInstall){
              return item.descripcionInsta
            }
          })
          const body = {
            //variables de request
            install: `${sugesInstall}-${installDesc.descripcionInsta}`,
            nitClient: client ? client.nit : search.idCliente,
            nameClient: client && client.razonSocial,
            branchClient: `${sucursal.id}-${sucursal.descripcion}`,
            destination: destination,
            emisor: user.email,
            state: 'nueva',
            observations: search.observations,
            createdAt: new Date(),
            createdBy: user.name,

            //variables de request-product
            reference: productoSeleccionado ? parseInt(productoSeleccionado.item.codigo) : datos.idProducto,
            descripProduct: productoSeleccionado ? productoSeleccionado?.item.descripcion : datos.description,
            um: productoSeleccionado?.item.um,
            kgUnit: datos.cantidad,
            price: datos.precio,
            cost: datos.costoPromedio,
            priceAuth: datos.precioAuth,
            currentMargen: datos.margenActual,
            newMargen: datos.margenNueva,
            productosAgr: productosAgr,
          };
          createRequest(body)
            .then(( {data} ) => {
              sendMail(body)
                .then(() => {
                  setLoading(false);
                  Swal.fire({
                    title: "¡Envío Exitoso!",
                    text: `
                      La solicitud de precio para el cliente
                       ${data.nameClient} de NIT ${data.nitClient}
                       se ha realizado satisfactoriamente.
                      Por favor revise el correo y verifique la información.
                    `,
                    icon: "success",
                    confirmButtonText: "Aceptar",
                  }).then(() => {
                    window.location.reload();
                  });
                })
                .catch((err) => {
                  setLoading(false);
                  Swal.fire({
                    title: "¡Ha ocurrido un error!",
                    text: `
                    Hubo un error al momento de enviar la solicitud, intente de nuevo.
                    Si el problema persiste por favor comuniquese con su jefe inmediato o con el área de sistemas
                    para darle una pronta y oportuna solución.`,
                    icon: "error",
                    confirmButtonText: "Aceptar",
                  });
                });
            })
            .catch((err) => {
              setLoading(false);
              Swal.fire({
                title: "¡Ha ocurrido un error!",
                text: `
                  Hubo un error al momento de registrar su solicitud, intente de nuevo.
                  Si el problema persiste por favor comuniquese con su jefe inmediato o con el área de sistemas
                  para darle una pronta y oportuna solución.`,
                icon: "error",
                confirmButtonText: "Aceptar",
              });
            });
        }
      });
  };

  const refreshForm = () => {
    Swal.fire({
      title: "¿Está seguro?",
      text: "Se descartará todo el proceso que lleva",
      icon: "warning",
      confirmButtonText: "Aceptar",
      confirmButtonColor: "#dc3545",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
    }).then(({ isConfirmed }) => {
      if (isConfirmed) window.location.reload();
    });
  };

  const cleanForm = () => {
    setSuggestions(products)
    setProductoSeleccionado(null);
    setDatos({
      idProducto: "",
      description: "",
      cantidad: "",
      costoPromedio: "",
      precio: "",
      precioAuth:'',
      existencia:'',
      margenActual:'',
      margenNueva:'',
    });
    setPrecio('');
    setNewMargen('');
    setCurrentMargen('');
  };

  /* const handleLimit = (e) => {
    const inputValue = e.target.value;
    // Verificar si el valor es un número entre 1 y 100
    if (inputValue === '' || (parseInt(inputValue) >= 0 && parseInt(inputValue) <= 100)) {
      setDatos({
        ...datos,
        porcentajeAuth: inputValue
      });
    }else{
      setDatos({
        ...datos,
        porcentajeAuth: ''
      });
    }
  }; */

  const handlerAddProduct = (e) => {
    e.preventDefault();

    // Muestra la barra de carga
    let timerInterval;
    Swal.fire({
      title: 'Buscando...',
      text: 'Por favor, espera...',
      timer: 4000,
      timerProgressBar: true,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
        const timer = Swal.getPopup().querySelector("b");
        timerInterval = setInterval(() => {}, 200);
      },
      willClose: () => {
        clearInterval(timerInterval);
      },
      onBeforeOpen: () => {
        Swal.showLoading();
      },
      showConfirmButton: false,
    });

    //inicializar parametros de busqueda
    setPrecio({})
    setDatos({
      ...datos,
      precio:''
    })
    const auth = datos.precioAuth
    const monto = datos.cantidad

    //filtrar el item y guardarlo en la constante "idExt"
    const item = products.find((elem) => parseInt(elem.item.codigo) === parseInt(datos.idProducto));
    const idExt = item && item.itemId

    //filtrar el item y guardarlo en la constante "idExt"
    const item2 = products.find((elem) => parseInt(elem.item.codigo) === parseInt(datos.idProducto));
    const idItem = item2 && item.id

    /* logica para buscar costo por item e instalacion */
      //buscar costo por instalacion seleccionada
      getOneCostByInstall(sugesInstall)
      .then((data)=>{
        let datos = data
  
        //filtramos los costo encontrados para descartar cuanod el costo promedio es 0
        const last = datos.filter((item)=>item.costoPromedio !== 0 && item.ultimocosto !== 0 && item.ultimaFecha !== null)
  
        //filtrar por id del item seleccionado
        const idItemSelected = last.filter((item)=>item.IdItemExt === idItem)
  
        //descartar si no hay existencia
        const filNotExit = idItemSelected.filter((item)=>item.existencia !== 0 )
  
        //guardamos en una constante el costo del producto
        let costo = null;
        costo = filNotExit.map((item)=>item.costoPromedio)
        //guardamos en una constante la existencia del producto
        let existencia = null;
        existencia = filNotExit.map((item)=>item.existencia)

        if(costo !== null && existencia !== null){
          setDatos({
            ...datos,
            costoPromedio: filNotExit.costoPromedio,
            existencia: filNotExit.existencia,
          })
        }
  
        if(filNotExit.length !== 0){
          /* logica para buscar el precio de item por instalacion */
          //buscar precio por id de item
          getOne(idExt)
          .then((data)=>{
              const precios = data

              // filtramos el resultado de la busqueda para quitar los item que tiene precio = 0
              const precio = precios.filter((item)=>item.precioMinimo !== 0 && item.precioMaximo !== 0)

              //funcion para reducir el resultado por fechas y dejar la fecha del precio mas actual
              const reduce = precio.reduce((acc, item)=>{
                // Si no existe el IdListaPrecio en el acumulador, lo añadimos
                if (!acc[item.IdListaPrecio]) {
                  acc[item.IdListaPrecio] = item;
                } else {
                  // Comparamos las fechas y mantenemos la más actualizada
                  const fechaActual = new Date(acc[item.IdListaPrecio].fechaActivacion);
                  const fechaNueva = new Date(item.fechaActivacion);
                  
                  if (fechaNueva > fechaActual) {
                    acc[item.IdListaPrecio] = item;
                  }
                }
                return acc;
              },{})

              //volvemos objeto tipo lista al resultado del filtro
              const resultado = Object.values(reduce);
              //encontramos la lista de precio que coincide con id de la instalacion que seleccionaron
              const idListaPrecio = listaPrecios.find((item)=>item.IdInstalacion === sugesInstall)
              //guardamos el id de la lista en una constante
              const idList = idListaPrecio && idListaPrecio.IdListaPrecio
              //filtramos los resultados de lista de precios por fecha con el id de la lista del item
              const listAndPrice = resultado.filter((item)=>item.IdListaPrecio===idList)
              //guardamos en una constante el precio minimo del item resultante
              const uniquePrice = listAndPrice.map((item)=>item.precioMinimo)

              //funcion para calcular la margen actual y nueva margen
              const ActualMargen = ((uniquePrice - costo) / uniquePrice) * 100
              //tranformar precio por autorizar a numero entero
              const authToMargen = auth.split(",").join("")
              //hallar el nuevo margen
              const NuevaMargen =( (authToMargen - costo) / authToMargen) * 100

              if(reduce.length !== 0 && resultado.length !== 0 &&  listAndPrice.length !== 0 && uniquePrice){
                setDatos({
                  ...datos,
                  precio: listAndPrice.precioMinimo,
                  margenActual: ActualMargen,
                  margenNueva: NuevaMargen
                })
                
                setPrecio(uniquePrice)
                setCurrentMargen(ActualMargen)
                /* setDatos({
                  ...datos,
                  precio: uniquePrice,
                  margenActual: ActualMargen,
                })
                setPrecio(uniquePrice)
                setCurrentMargen(ActualMargen)
                Swal.close(); */
          
                if (!productoSeleccionado || !auth || !monto) {
                  return 0;
                } 
                const list = [...productosAgr.agregados];
                
                const newProducto = {
                  id: productoSeleccionado ? productoSeleccionado.item.codigo : datos.idProducto,
                  description: productoSeleccionado ? productoSeleccionado.item.descripcion : datos.description,
                  um: productoSeleccionado ? productoSeleccionado?.item.um : datos.cantidad || " ",
                  amount: monto,
                  costo: costo,
                  existencia: existencia,
                  price: uniquePrice,
                  priceAuth: auth,
                  currentMargen: ActualMargen.toFixed(2),
                  newMargen: NuevaMargen.toFixed(2),
                  total: formater(
                    auth.split(",").join("") * monto
                  ),
                };
                const newTotal = formater(
                  Number(productosAgr.total.split(".").join("")) + Number(newProducto.total.split(".").join(""))
                );
            
                list.push(newProducto);
                setProductosAgr({
                  agregados: list,
                  total: newTotal,
                });
                cleanForm();
                Swal.close();
              }else{
                Swal.close();
                Swal.fire({
                  icon:'question',
                  title:`¡ATENCION!`,
                  text:'No hay precio unitario establecido para este producto. ¿Desea hacer la solicitud de todas formas?',
                  confirmButtonText:'SI',
                  denyButtonText:'NO',
                })
                .then(({ isConfirmed , isDenied }) => {
                  if(isDenied){
                    cleanForm()
                  }
                })
              }
            })
            .catch((error)=>{
              Swal.fire({
                icon:'question',
                title:`¡ERROR!${error}`,
                text:'No hay precio unitario establecido para este producto. ¿Desea hacer la solicitud de todas formas?',
                confirmButtonText:'SI',
                confirmButtonColor:'green',
                showDenyButton:true,
                denyButtonText:'NO',
              })
              .then(({ isConfirmed , isDenied }) => {
                if(isDenied){
                  cleanForm()
                }
              })
            })
          }else{
            Swal.close();
            cleanForm()
            Swal.fire({
              icon:'error',
              title:'¡ERROR!',
              text:'No hay existencia a la fecha ó no hay un costo promedio unitario asignado para este item en esta instalación. Elige uno diferente.',
              /* timer:5000, */
              showConfirmButton:true,
            })
            setProductoSeleccionado(null);
        }
      })
      .catch((error)=>{
        Swal.fire({
          icon:'warning',
          title:`¡ATENCION!`,
          text:'No hay costo promedio unitario establecido para este producto ó no hay existencia del item. Elige uno diferente',
          showCancelButton:false,
          showConfirmButton:false,
          timer:6000
        })
        .then(() => {
          setProductoSeleccionado({})
        })
      })

      //definimos la margen actual y la nueva margen
      /* .then(()=>{
        const ActualMargen = (datos.precio - datos.costoPromedio) / datos.precio
        const NuevaMargen = (datos.precioAuth - datos.costoPromedio) / datos.precioAuth
  
        if (!productoSeleccionado || !datos.cantidad || !datos.precioAuth ) {
          return 0;
        } 
        const list = [...productosAgr.agregados];
        
        const newProducto = {
          id: productoSeleccionado ? productoSeleccionado.item.codigo : datos.idProducto,
          description: productoSeleccionado ? productoSeleccionado.item.descripcion : datos.description,
          um: productoSeleccionado ? productoSeleccionado?.item.um : datos.cantidad || " ",
          amount: datos.cantidad,
          costo: datos.costoPromedio,
          existencia: datos.existencia,
          price: datos.precio,
          priceAuth: datos.precioAuth,
          currentMargen: ActualMargen,
          newMargen: NuevaMargen,
          total: formater(
            datos.precioAuth.split(",").join("") * datos.cantidad
          ),
        };
        const newTotal = formater(
          Number(productosAgr.total.split(".").join("")) + Number(newProducto.total.split(".").join(""))
        );
    
        list.push(newProducto);
        setProductosAgr({
          agregados: list,
          total: newTotal,
        });
        cleanForm();
        Swal.close();
      }) */
  };

  const [typeClient, setTypeClient] = useState('estandar');
  const changeType = (e) => {
    if(typeClient === 'estandar'){
      setTypeClient('pos')
      const find = clientes.find((elem)=>elem.nit==='222222222222')
      setClient(find)
    }else if(typeClient === 'pos'){
      setTypeClient('estandar')
      setClient(null)
    }
    setInvoiceType(!invoiceType);
    /* setClient(null); */
    /* setSucursal(null); */
    selectBranchRef.current.selectedIndex = 0;
  };

  return (
    <div
      className="container d-flex flex-column w-100 py-3 mt-5"
      style={{ fontSize: 10.5 }}
    >
      <h1 className="text-center fs-5 fw-bold"><strong>SOLICITUD DE AUTORIZACIÓN DE PRECIOS</strong></h1>
      <section className="d-flex justify-content-between align-items-center mb-2">
       <div className="d-flex row w-100">
        <div className="d-flex flex-column col col-12 col-lg-6 col-md-12">
          <h1 className="fs-6 fw-bold m-0 ">EL GRAN LANGOSTINO S.A.S.</h1>
          <span className="fw-bold">Nit: 835001216</span>
          <span>Tel: 5584982 - 3155228124</span>
        </div>
        <div className="dir-type col col-12 col-lg-6 col-md-12">
          <div className="d-flex flex-column align-items-center mt-2">
            <strong>Tipo de Cliente</strong>
            <div className="d-flex flex-row align-items-center gap-2">
              <span id="estandar" className={!invoiceType && "text-primary"}>Estándar</span>
              <button
                className="position-relative d-flex align-items-center btn bg-body-secondary rounded-pill toggle-container p-0 m-0"
                value={typeClient}
                onClick={(e)=>changeType(e)}
              >
                <div
                  className={
                    !invoiceType
                      ? "d-flex align-items-center justify-content-center position-absolute bg-primary rounded-circle toggle"
                      : "d-flex align-items-center justify-content-center position-absolute bg-success rounded-circle toggle active"
                  }
                ></div>
              </button>
              <span id="pos" className={invoiceType ? "text-success" : undefined}>
                POS
              </span>
            </div>
          </div>
        </div>
       </div> 
      </section>
      <form className="" onSubmit={handleSubmit}>
        <div className="bg-light rounded shadow-sm p-3 mb-3">
          <div className="d-flex flex-column gap-1">
            <div>
              <label className="fw-bold">INSTALACIÓN</label>
              <select
                ref={selectBranchRef}
                className="form-select form-select-sm"
                onChange={(e) => (handleFiltroInstall(JSON.parse(e.target.value)))}
                required
              >
                <option selected value="" disabled>
                  -- Seleccione la Instalación --
                </option>
                {Instalaciones
                  .sort((a, b) => a.id - b.id)
                  .map((elem) => (
                    <option id={elem.id} value={JSON.stringify(elem)}>
                      {elem.id + " - " + elem.descripcionInsta}
                    </option>
                  ))}
              </select>
            </div>
            {/* <button onClick={(e)=>busquedaDeCosto(e)}>click</button>
            {JSON.stringify(productoSeleccionado)} */}
            <div>
              <div className="row row-cols-sm-2">
                <div className="d-flex flex-column align-items-start">
                  <label className="" style={{fontSize:11}}>NIT/Cédula:</label>
                  <input
                    id="idCliente"
                    type="number"
                    value={client ? client.nit : search.idCliente}
                    className="form-control form-control-sm"
                    placeholder="Buscar por NIT/Cédula"
                    onChange={(e) => {
                      const { value } = e.target;
                      handlerChangeSearch(e);
                      findById(value, clientes, setClient);                    
                    }}
                    min={0}
                    required
                  />
                </div>
                <div className="d-flex flex-column align-items-start">
                  <label className="" style={{fontSize:11}}>Razón Social:</label>
                  <ComboBox
                    options={clientes}
                    id="razon-social"
                    item={client}
                    setItem={setClient}
                  />
                </div>
              </div>
              <div className="row row-cols-sm-2">
                <div className="my-1">
                  <label className="" style={{fontSize:11}}>SUCURSAL</label>
                  <select
                    ref={selectBranchRef}
                    className="form-select form-select-sm"
                    onChange={(e) => setSucursal(JSON.parse(e.target.value))}
                    disabled={client ? false : true}
                    required
                  >
                    <option selected value="" disabled>
                      -- Seleccione la Sucursal --
                    </option>
                    {client?.sucursales
                      .sort((a, b) => a.id - b.id)
                      .map((elem) => (
                        <option id={elem.id} value={JSON.stringify(elem)}>
                          {elem.id + " - " + elem.descripcion}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="my-1">
                  <label className="" style={{fontSize:11}}>Solicitud para:</label>
                  <select
                    ref={selectBranchRef}
                    className="form-select form-select-sm"
                    onChange={(e) => setDestination(e.target.value)}
                    required
                  >
                    <option selected value="" disabled>
                      -- Seleccione a quien va dirigida la Solicitud --
                    </option>
                    <option value='gerencia@granlangostino.com'>Dubian Salazar</option>
                    <option value='gerencia1@granlangostino.com'>Harley Velez</option>
                    <option value='gerencia2@granlangostino.com'>Jorge Eugenio Salazar</option>
                    <option value='jefe.comercial@granlangostino.com'>Isabella Velez</option>
                    <option value='jefecomercial.david@granlangostino.com'>Juan David Salazar</option>
                  </select>
                </div>
              </div>
            </div>
            <hr className="my-1 mb-2 mt-2" />

        <div className="bg-light rounded mb-2">
            <h5 className="fw-bold">Productos de la solicitud</h5>
            <form className="row" /* onSubmit={handlerSubmit} */>
              <div className="col col-12 col-lg-4 lg-md-12">
                <label className="" style={{fontSize:12}}>Referencia:</label>
                <input
                  id="idProducto"
                  type="number"
                  placeholder="Buscar producto por Referencia"
                  value={
                    productoSeleccionado
                      ? parseInt(productoSeleccionado.item.codigo)
                      : datos.idProducto
                  }
                  disabled={sugesInstall === '' ? true : false }
                  className="form-control form-control-sm"
                  min={1000}
                  aria-controls="off"
                  onChange={(e) => {
                    handlerChange(e);
                    findItem(e);
                    /* findByIdProduct(e); */
                    /* handlerChangeRefer(e); */
                  }}
                  required
                />
              </div>
              <div className=" col col-12 col-lg-4 lg-md-12">
                <label className="" style={{fontSize:12}}>Descripción:</label>
                <div className="d-flex align-items-center position-relative w-100">
                  <input
                    id="description"
                    type="search"
                    autoComplete="off"
                    placeholder="Buscar Productor por Descripción"
                    value={
                      productoSeleccionado
                        ? productoSeleccionado?.item.descripcion
                        : datos.description
                    }
                    disabled={sugesInstall === '' ? true : false }
                    onChange={handlerChangeSuggestions}
                    className="form-control form-control-sm input-select"
                    required={productoSeleccionado ? false : true}
                  />
                  <select
                    ref={ref}
                    className="form-select form-select-sm"
                    onChange={findItem/* findByDescProduct */}
                    required
                    disabled={sugesInstall === '' ? true : false }

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
              <div className="col col-12 col-lg-4 lg-md-12">
                <label className="" style={{fontSize:12}}>U.M.:</label>
                <input
                  id="unidades"
                  type="text"
                  value={productoSeleccionado?.item.um || ""}
                  className="form-control form-control-sm"
                  disabled
                  required
                />
              </div>
              <div className="col col-12 col-lg-6 lg-md-12 mt-1">
                <label className="" style={{fontSize:12}}>Cantidad:</label>
                <input
                  id="cantidad"
                  type="number"
                  placeholder="Completa este campo para agregar"
                  value={datos.cantidad}
                  min={0.1}
                  disabled={sugesInstall === '' ? true : false }
                  className="form-control form-control-sm"
                  onChange={handlerChange}
                  required
                  autoComplete="off"
                />
              </div>
              
              {/* <div className="col col-12 col-lg-4 lg-md-12 mt-1">
                <label className="" style={{fontSize:12}}>Existencia:</label>
                <input
                  id="existencia"
                  type="number"
                  value={datos.existencia}
                  disabled
                  className="form-control form-control-sm"
                  required
                />
              </div> */}
              <div className="col col-12 col-lg-6 lg-md-12 mt-1">
                {/* <label className="" style={{fontSize:12}}>Costo Promedio unitario:</label>
                <input
                  id="costoPromedio"
                  type="number"
                  value={datos.costoPromedio}
                  disabled
                  className="form-control form-control-sm"
                  required
                /> */}
                <label className="" style={{fontSize:12}}>Precio por Autorizar:</label>
                <div className="d-flex flex-row w-100">
                  <h6 className="me-1 mt-1 fw-bold">$</h6>     
                  <NumericFormat
                    thousandSeparator=","
                    decimalSeparator="."
                    id="precioAuth"
                    className="form-control form-control-sm "
                    allowNegative={false}
                    decimalScale={0}
                    required
                    disabled={sugesInstall === '' ? true : false }
                    placeholder="Campo obligatorio"
                    value={datos.precioAuth}
                    onChange={(e)=>handlerChange(e)}
                    autoComplete="off"
                  />
                </div>
              </div>
              {/* <div className="col col-12 col-lg-6 lg-md-12 mt-1">
                <label className="" style={{fontSize:12}}>Precio Unitario de Lista:</label>
                <div className="d-flex flex-row w-100">
                  <h6 className="me-1 mt-1 fw-bold">$</h6>
                  <input
                    id="precio"
                    type="number"
                    value={precio}
                    disabled
                    className="form-control form-control-sm"
                    required
                  />
                  </div>
              </div> */}
              
              {/* <div className="col col-12 col-lg-6 lg-md-12 mt-1">
                <label className="" style={{fontSize:12}}>Precio por Autorizar:</label>
                <div className="d-flex flex-row w-100">
                  <h6 className="me-1 mt-1 fw-bold">$</h6>     
                  <NumericFormat
                    thousandSeparator=","
                    decimalSeparator="."
                    id="precioAuth"
                    className="form-control form-control-sm "
                    allowNegative={false}
                    decimalScale={0}
                    required
                    disabled={sugesInstall === '' ? true : false }
                    placeholder="Campo obligatorio"
                    value={datos.precioAuth}
                    onChange={(e)=>handlerChange(e)}
                    autoComplete="off"
                  />
                </div>
              </div> */}
              {/* <label>Costo: {(datos.costoPromedio)}</label>
              <label>Precio: {(datos.precio)}</label>

              <label>Precio por autorizar: {(datos.precioAuth)}</label>

              <label>Margen Actual: {JSON.stringify(datos.margenActual)}</label>
              <label>Margen Nueva: {JSON.stringify(newMargen)}</label> */}
              <div className="d-flex justify-content-center w-100 mt-2">
              <button
                type="submit"
                className="d-flex align-items-center justify-content-center btn btn-sm btn-primary w-100"
                onClick={handlerAddProduct}
              >
                AGREGAR PRODUCTO
                <MdAssignmentAdd className="ms-1" style={{ width: 20, height: 20 }} />
              </button>
            </div>
            <TableProductsRequest
              list={productosAgr}
              setList={setProductosAgr}
              formater={formater}
            />
            </form>
        </div>
      </div>
        </div>
        <div className="d-flex flex-column mb-3">
          <label className="fw-bold" style={{fontSize:12}}>OBSERVACIONES</label>
          <textarea
            id="observations"
            className="form-control"
            value={search.observations}
            onChange={handlerChangeSearch}
            style={{ minHeight: 70, maxHeight: 100, fontSize: 12 }}
          ></textarea>
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
        <div className="d-flex flex-row gap-3 mb-3">
          <button
            type="submit"
            className="btn btn-sm btn-success fw-bold w-100"
          >
            ENVIAR
          </button>
          <button
            type="button"
            className="btn btn-sm btn-danger fw-bold w-100"
            onClick={refreshForm}
          >
            CANCELAR
          </button>
        </div>
      </form>
    </div>
  );
}
