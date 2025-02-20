import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

export const addData = async (endPoint, data) => {
  try {
    const response = await axios.post(`${API_URL}${endPoint}`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response ? error.response.data : error.message);
  }
};

export const getAllData = async (endPoint) => {
  try {
    const response = await axios.get(`${API_URL}${endPoint}`);
    return response.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

export const getDataById = async (endPoint, id) => {
  try {
    const response = await axios.get(`${API_URL}${endPoint}${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response ? error.response.data : error.message);
  }
};

export const postData = async (endPoint, id, userData) => {
  try {
    const response = await axios.put(`${API_URL}${endPoint}${id}`, userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response ? error.response.data : error.message);
  }
};

// Delete a user
export const deleteData = async (endPoint, id) => {
  try {
    const response = await axios.delete(`${API_URL}${endPoint}${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response ? error.response.data : error.message);
  }
};
