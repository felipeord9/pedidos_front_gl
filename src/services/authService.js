import axios from 'axios';
import { config } from '../config';

const url = config.apiUrl2

export const userLogin = async (credentials) => {
  try {
    const { data } = await axios.post(`${url}/auth/login`, credentials)

    return data
  } catch (error) {
    throw error
  }
}

export const changePassword = async (credentials) => {
  try {
    const { data } = await axios.post(`${url}/auth/change/password`, credentials)

    return data
  } catch (error) {
    throw error
  }
}

export const sendRecovery = async (email) => {
  try {
    const { data } = await axios.post(`${url}/auth/send/recovery`, {email})

    return data
  } catch (error) {
    throw error
  }
}

export const changeRecoveryPassword = async (credentials) => {
  try {
    const { data } = await axios.post(`${url}/auth/recovery/password`, credentials)
    console.log(data)
    return data
  } catch (error) {
    throw error
  }
}