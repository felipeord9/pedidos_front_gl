import { config } from '../config'
import axios from 'axios';
const url = `${config.apiUrl}/precio`;

function getAllPrecios() {
  return fetch(url)
    .then(res => res.json())
    .then(res => res.data)
}

function getOneCosto(id) {
  return fetch(`${url}/${id}`)
    .then(res => res.json())
    .then(res => res.data)
}

function getOne(id) {
    return fetch(`${url}/item/${id}`)
      .then(res => res.json())
      .then(res => res.data)
}

function getOneByInstall(id) {
  return fetch(`${url}/install/${id}`)
    .then(res => res.json())
    .then(res => res.data)
}

async function lookByInstallAndItem(id, item) {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url}/item/${id}/install/${item}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

export {
  getAllPrecios,
  getOneCosto,
  getOne,
  getOneByInstall,
  lookByInstallAndItem
}