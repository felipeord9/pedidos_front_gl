import axios from 'axios'
import { config } from '../config'
const url2 = `${config.apiUrl2}/familia`;

const findFamilias = async () => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(url2, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

export {
  findFamilias
}