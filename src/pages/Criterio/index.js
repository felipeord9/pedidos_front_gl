import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { utils, write } from 'xlsx';
import { saveAs } from 'file-saver';
import { getAllProducts , getAllProductsPg } from "../../services/productService";
import { createProduct , updateProduct } from '../../services/productService';
import { getAllCriterios } from '../../services/criterioService';
import { updateCatalogo } from '../../services/catalogService';
import { findFamilias } from '../../services/familiaService';
import { findCatalog } from '../../services/catalogService';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

const Criterio = () => {
  const [data, setData] = useState([]);
  const [pg, setPg] = useState([]);
  const [result, setResult] = useState([]);
  const [criterios, setCriterios] = useState([])
  const [catalogo, setCatalogo] = useState([])
  const [familias, setFamilias] = useState([])

  const [byUpdate, setByUpdate] = useState([]);
  const [byCreate, setByCreate] = useState([]);

  useEffect(()=>{
    let siesa;
    let pg;
    getAllCriterios()
      .then((res)=>{
        siesa = res
        findCatalog()
          .then(({data})=>{
            pg = data
            const DataFiltrada = siesa.map(( product ) => ({
              codigo: product?.item.codigo,
              descripcion: product?.item.descripcion,
              um: product?.item.um,
              familia: product.criterio
            }));
            //filtrar datos de pgadmin
            const PgFiltrada = pg.map(( item ) => ({
              codigo: item.id,
              descripcion: item.description,
              um: item.um, 
              familia: item.family
            }));

            //se busca los elementos que el codigo ya existe, pero la referencia es diferente
            const diferencias = DataFiltrada.filter(
              item1 => PgFiltrada.some(item2 => parseInt(item1.codigo) === parseInt(item2.codigo) && !(item1.familia === item2.familia))
            );

            const updates = [...diferencias]

            //se guardan en variables locales
            setByUpdate(updates)
          })
      })
  },[])

  /* useEffect(() => {
    getAllCriterios()
      .then((res)=>{
        setCriterios(res)
      })
  }, []); */

  const downloadExcel = () => {
    const filtroPg = pg.map((item)=>item.id)
    const filtroSiesa = data.map((item)=>item.item.codigo.replace(/\s+/g, ''))
    const duo = data.filter((item)=>!filtroPg.includes(item.item.codigo))
   setResult(duo)
  };

  const handleUpdateProducts = (e) => {
    e.preventDefault();

    // Muestra la barra de carga
    let timerInterval;
    Swal.fire({
        title: 'editando...',
        text: 'Por favor, espera...',
        timer: 10000,
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
    const datosFiltrados = byUpdate.slice(0, 500);
    updateCatalogo(datosFiltrados)
    .then(()=>{
      Swal.fire({
        icon:'success',
        title:'Correcto',
        text:'He han editado los productos de manera exitosa',
        timer: 5000
      })
      .then(()=>{
        window.location.reload()
      })
    })
    .catch((error)=>{
      Swal.fire({
        icon:'error',
        title:'¡ERROR!',
        text:`${error}`
      })
    })
  }

  return (
    <div className='row row-cols-sm-2 w-100 '>
      <div className='d-flex flex-column'>
        <h1>Data Table</h1>
        <h1>Productos</h1>
        {/* {JSON.stringify(pg)} */}
        {/* {JSON.stringify(elementosUnicos)} */}
        <button className='mt-2 btn btn-success' onClick={(e) => handleUpdateProducts(e)}>Update productos</button>
        <table>
          <thead>
            <th>Ref.</th>
            <th>Descripción</th>
            <th>UM</th>
            <th>Familia</th>
          </thead>
          <tbody>
            {byUpdate.map((row, index) => (
              <tr key={index}>
                <td>{row.codigo}</td>
                <td>{row.descripcion}</td>
                <td>{row.um}</td>
                <td>{row.familia}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
      </div>
      <button onClick={downloadExcel}>Download Excel</button>
    </div>
  );
};

export default Criterio;
