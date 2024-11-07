import { config } from '../config'
import axios from 'axios';
const url = `${config.apiUrl}/margen`;

function getAllMargen() {
  return fetch(url)
    .then(res => res.json())
    .then(res => res.data)
}

function getOneCosto(id) {
  return fetch(`${url}/${id}`)
    .then(res => res.json())
    .then(res => res.data)
}
function getOneCostByInstall(id) {
  return fetch(`${url}/install/${id}`)
    .then(res => res.json())
    .then(res => res.data)
}

async function getByinstallAndItem(id, item) {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url}/item/${item}/install/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

export {
  getAllMargen,
  getOneCosto,
  getOneCostByInstall,
  getByinstallAndItem
}
