import axios from 'axios'
import { config } from '../config'
const url2 = `${config.apiUrl2}/notification`;

const updateNotification= async (id, body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.patch(`${url2}/${id}`, body, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

export {
  updateNotification,
}