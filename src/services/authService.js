import axios from 'axios';
import { config } from '../config';

const url = config.apiUrl2

export const userLogin = async (credentials) => {
  try {
    const { data } = await axios.post(`${url}/login`, credentials)

    return data
  } catch (error) {
    throw error
  }
}

export const changePassword = async (credentials) => {
  try {
    const { data } = await axios.patch(`${url}/change-password`, credentials)

    return data
  } catch (error) {
    throw error
  }
}