import axios from 'axios'
import { config } from "../config";

const url = `${config.apiUrl2}/photo`;

export const sendEvidence= async(formData) =>{
  try {
    const { data } = await axios.post(`${url}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return data;
  } catch (error) {
    throw error;
  }
}