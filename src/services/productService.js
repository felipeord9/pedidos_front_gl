import { config } from '../config'
const url = `${config.apiUrl}/products`;
const url2 = `${config.apiUrl2}/products`;

function getAllProducts() {
  return fetch(url)
    .then(res => res.json())
    .then(res => res.data)
}

function getAllProductsPg() {
  return fetch(url2)
    .then(res => res.json())
    .then(res => res.data)
}

function getOneProduct(id) {
  return fetch(`${url}/${id}`)
    .then(res => res.json())
    .then(res => res.data)
}

export {
  getAllProducts,
  getAllProductsPg,
  getOneProduct
}