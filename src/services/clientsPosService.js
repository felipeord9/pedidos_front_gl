import axios from 'axios'
import { config } from "../config";

const url = `${config.apiUrl2}/client/pos`;

export const findClients = async () => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

export const findClientsByAgency = async (id)=>{
    const token = JSON.parse(localStorage.getItem("token"))
  
    const { data } = await axios.get(`${url}/agency/${id}`,{
      headers:{
        Authorization: `Bearer ${token}`
      }
    })
    return data
}

export const findClientsBySeller = async (id)=>{
    const token = JSON.parse(localStorage.getItem("token"))
  
    const { data } = await axios.get(`${url}/seller/${id}`,{
      headers:{
        Authorization: `Bearer ${token}`
      }
    })
    return data
}

export const findClientByPk = async (id)=>{
    const token = JSON.parse(localStorage.getItem("token"))
  
    const { data } = await axios.get(`${url}/${id}`,{
      headers:{
        Authorization: `Bearer ${token}`
      }
    })
    return data
}

export const findClientByName = async (coid, name)=>{
    const token = JSON.parse(localStorage.getItem("token"))
  
    const { data } = await axios.get(`${url}/client/${coid}/${name}`,{
      headers:{
        Authorization: `Bearer ${token}`
      }
    })
    return data
}

export const createClientsPOS = async (body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.post(url, body, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

export const updateClientsPOS = async (id, body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.patch(`${url}/${id}`, body, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}