import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { utils, write } from 'xlsx';
import { saveAs } from 'file-saver';
import { getAllProducts , getAllProductsPg } from "../../services/productService";
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

const Descarga = () => {
  const [data, setData] = useState([]);
  const [pg, setPg] = useState([]);
  const [result, setResult] = useState([]);

  useEffect(() => {
    getAllProducts().then((res)=>{
        setData(res);
    })
    getAllProductsPg().then((res)=>{
      setPg(res);
    })
  }, []);

  const downloadExcel = () => {
    const filtroPg = pg.map((item)=>item.id)
    const filtroSiesa = data.map((item)=>item.item.codigo.replace(/\s+/g, ''))
    const duo = data.filter((item)=>!filtroPg.includes(item.item.codigo))
    /* Swal.fire({
      title:`${JSON.stringify(filtroPg)}`
    }) */
   setResult(duo)
  };

  const obtenerElementosUnicos = () => {
    const codigosLista1 = data.map(item => item.item.codigo);
    const codigosLista2 = pg.map(item => item.id);

    const descripcionLista1 = data.map(item => item.item.description);
    const descripcionLista2 = pg.map(item => item.description);
    /* Swal.fire({
      title:`${codigosLista1}`
    }) */
    // Elementos únicos de lista1   
    const unicosLista1 = codigosLista1.filter(item => !codigosLista2.includes(parseInt(item)));

    const diferencias = data.filter(
      (itemA) =>
        !pg.some((itemB) => 
          Number(itemA.item.codigo) === Number(itemB.id) && Text(itemA.item.description).includes(itemB.description)
        )
    );
    
    // Elementos únicos de lista2
    const unicosLista2 = pg.filter(item => !codigosLista1.includes(item.codigo));

    // Combinar ambos resultados
    return [...unicosLista1];
  };

  const elementosUnicos = obtenerElementosUnicos();

  return (
    <div>
      <h1>Data Table</h1>
      {/* {JSON.stringify(pg)} */}
      {JSON.stringify(elementosUnicos)}
      {/* <table>
        <thead>
          <th>Ref.</th>
          <th>Descripción</th>
          <th>UM</th>
        </thead>
        <tbody>
          {result.map((row, index) => (
            <tr key={index}>
              <td>{row.item.codigo}</td>
              <td>{row.item.descripcion}</td>
              <td>{row.item.um}</td>
            </tr>
          ))}
        </tbody>
      </table> */}
      <button onClick={downloadExcel}>Download Excel</button>
    </div>
  );
};

export default Descarga;
