const url = `http://localhost:3001/api/v1/products`;

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