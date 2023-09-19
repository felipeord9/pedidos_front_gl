import axios from 'axios'
import { config } from "../config";

const url = `${config.apiUrl2}/users`;

export const findUsers = async () => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}