import { config } from "../config";
const url = `${config.apiUrl}/orders`;

const createOrder = (body) => {
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body)
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
    body: JSON.stringify(body)
  })
    .then((res) => res.json())
    .then((res) => res);
};

export { createOrder, createItem };
