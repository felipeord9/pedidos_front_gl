import axios from 'axios'
import { config } from "../config";
const url = `${config.apiUrl2}/orders`;

const findOrders = async () => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

const findOrdersBySeller = async (id) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url}/seller/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

const findOrdersByAgency = async (id) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url}/co/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

const findFilteredOrders = (init, final) => {
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

export { 
  findOrders,
  findOrdersBySeller,
  findOrdersByAgency,
  findFilteredOrders, 
  createOrder, 
  createItem, 
  deleteOrder 
};
