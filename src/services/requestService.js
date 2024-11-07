import axios from 'axios'
import { config } from "../config";
const url = `${config.apiUrl2}/requests`;

const findRequests = async () => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

const findRequeBySeller = async (id) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url}/seller/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

const findRequeByCreater = async (name) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url}/seller/${name}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

const findRequeByAprob = async (email) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url}/aprobador/${email}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

const findPro = async () => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url}/products`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

const findProductsByRequest = async (id) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url}/prdocuts/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

const findByPk = async (id)=>{
    const token = JSON.parse(localStorage.getItem("token"))
  
    const { data } = await axios.get(`${url}/${id}`,{
      headers:{
        Authorization: `Bearer ${token}`
      }
    })
    return data
  }

const createRequest = (body) => {
    const token = JSON.parse(localStorage.getItem("token"))
    return fetch(url, {
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

const updateRequest = async (id, body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.patch(`${url}/update/request/${id}`, body, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

const updateItem = async (id, body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.patch(`${url}/update/item/${id}`, body, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

const updateItemofRequest = async (id, body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.patch(`${url}/update/all/items/${id}`, body, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

export const sendMail = async (body)=>{
  try{
    const { data } = await axios.post(`${url}/send`, body)
    return data
  } catch(error){
    throw error
  }
}

/* Cuando se edita producto por producto, dice que se actualizo la solicitud */
export const sendAnswer = async (body) => {
  try{
    const { data } = await axios.post(`${url}/send/answer`,body)
    return data
  } catch(error){
    throw error
  }
}

/* Cuando se aprueban todos */
export const sendConfirm = async (body) => {
  try{
    const { data } = await axios.post(`${url}/send/confirm`,body)
    return data
  } catch(error){
    throw error
  }
}

/* Cuando se rechazan todos */
export const sendRechazo = async (body) => {
  try{
    const { data } = await axios.post(`${url}/send/rechazo`,body)
    return data
  } catch(error){
    throw error
  }
}

export {
    findRequests,
    findByPk,
    findPro,
    findRequeBySeller,
    findRequeByCreater,
    findRequeByAprob,
    findProductsByRequest,
    createRequest,
    updateRequest,
    updateItem,
    updateItemofRequest,
}