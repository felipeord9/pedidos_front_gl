import axios from 'axios'
import { config } from '../config'
const url = `${config.apiUrl}/criterio`;

function getAllCriterios() {
  return fetch(url)
    .then(res => res.json())
    .then(res => res.data)
}


export {
  getAllCriterios,
}