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

const findInitialOrders = async () => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url}/initial/`, {
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

const findInitialBySeller = async (id) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url}/seller/initial/${id}`, {
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

const findInitialByAgency = async (id) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url}/co/initial/${id}`, {
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
  const token = JSON.parse(localStorage.getItem("token"))
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
      
    },
    body: JSON.stringify(body),
  })
    .then((res) => res.json())
    .then((res) => res);
};

const updateOrder = async (id, body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.patch(`${url}/${id}`, body, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

const createItem = (body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
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
  findInitialOrders,
  findOrdersBySeller,
  findInitialBySeller,
  findOrdersByAgency,
  findInitialByAgency,
  findFilteredOrders, 
  createOrder,
  updateOrder,
  createItem, 
  deleteOrder 
};
