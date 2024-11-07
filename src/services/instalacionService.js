import { config } from '../config'
const url = `${config.apiUrl}/instalacion`;

function getAllinstalaciones() {
  return fetch(url)
    .then(res => res.json())
    .then(res => res.data)
}

export {
  getAllinstalaciones,
}