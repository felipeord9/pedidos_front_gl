import { config } from "../config";
const url = `${config.apiUrl2}/orders`;

const findOrders = () => {
  return fetch(url)
    .then((data) => data.json())
    .then((data) => data)
}

const findFilteredOrders = (init, final) => {
  console.log(init, final)
  return fetch(`${url}?init=${init}&final=${final}`)
    .then((data) => data.json())
    .then((data) => data)
}

const createOrder = (body) => {
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then((res) => res.json())
    .then((res) => res);
};

const createItem = (body) => {
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then((res) => res.json())
    .then((res) => res);
};

const deleteOrder = (id) => {
  return fetch(`${url}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((res) => res);
};

export { findOrders, findFilteredOrders, createOrder, createItem, deleteOrder };
