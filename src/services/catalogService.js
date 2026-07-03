import axios from 'axios'
import { config } from '../config'
const url2 = `${config.apiUrl2}/catalog`;

const findCatalog = async () => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(url2, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

const compareProducts = async () => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url2}/compare`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

function getAllProductsPg() {

  return fetch(url2)
    .then(res => res.json())
    .then(res => res.data)
}

async function findOneCatalog(id) {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url2}/id/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

const createCatalogo = (body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  return fetch(url2, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
      
    },
    body: JSON.stringify(body),
  })
    .then((res) => res.json())
    .then((res) => res);
};

const create2 = (body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  return fetch(`${url2}/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
      
    },
    body: JSON.stringify(body),
  })
    .then((res) => res.json())
    .then((res) => res);
};

const updateCatalogo = async (body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.patch(url2, body, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

const updateProdCatalog = async (id, body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.patch(`${url2}/${id}`, body, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

export const verificarArchivo = async (directionUrl) => {
  try {
    const res = await fetch(`${directionUrl}`, { method: 'HEAD' });
    if(!res.ok){
      return null;
    }
    return directionUrl;
  } catch (error) {
    console.error('Error al verificar archivo:', error);
    return false;
  }
};

export {
  findCatalog,
  compareProducts,
  findOneCatalog,
  getAllProductsPg,
  createCatalogo,
  create2,
  updateCatalogo,
  updateProdCatalog,
}