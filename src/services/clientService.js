import { config } from '../config'
const url = `${config.apiUrl}/clients`;
const url2 = `${config.apiUrl2}/clients`

function getAllClients() {
  return fetch(url)
    .then(res => res.json())
    .then(res => res.data)
}

function getAllClientsPOS() {
  return fetch(url2)
    .then(res => res.json())
    .then(res => res.data)
}

function getOneClient(id) {
  return fetch(`${url}/${id}`)
    .then(res => res.json())
    .then(res => res.data)
}

function createClient(body) {
  return fetch(url, {
    method: 'POST',
    headers: {
      "Content-Type": 'application/json'
    },
    body: JSON.stringify(body)
  })
  .then(res => res.json())
  .then(res => res)
}

export {
  getAllClients,
  getAllClientsPOS,
  getOneClient,
  createClient
}