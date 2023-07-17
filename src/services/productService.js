import { config } from '../config'
const url = `${config.apiUrl}/products`;

function getAllProducts() {
  return fetch(url)
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
  getOneProduct
}