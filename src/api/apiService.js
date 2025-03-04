import axios from "axios";
import { getAuth } from "firebase/auth"; // Import Firebase auth

const API_URL = process.env.REACT_APP_API_URL;

// Function to get Firebase ID token
const getFirebaseToken = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken(); // Get the latest token
  }
  throw new Error("User is not authenticated");
};

// Function to send authenticated requests
const authHeaders = async () => {
  try {
    const token = await getFirebaseToken();
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  } catch (error) {
    throw new Error("Failed to get authentication token");
  }
};

//eg addData(/events, data)
export const addData = async (endPoint, data) => {
  try {
    const headers = await authHeaders();
    const response = await axios.post(`${API_URL}${endPoint}`, data, headers);
    return response.data;
  } catch (error) {
    throw new Error(error.response ? error.response.data : error.message);
  }
};

export const getAllData = async (endPoint) => {
  try {
    const headers = await authHeaders();
    const response = await axios.get(`${API_URL}${endPoint}`, headers);
    return response.data;
  } catch (error) {
    throw new Error(error.response ? error.response.data : error.message);
  }
};

export const getDataById = async (endPoint, id) => {
  try {
    const headers = await authHeaders();
    const response = await axios.get(`${API_URL}${endPoint}${id}`, headers);
    return response.data;
  } catch (error) {
    throw new Error(error.response ? error.response.data : error.message);
  }
};

export const postData = async (endPoint, id, userData) => {
  try {
    const headers = await authHeaders();
    const response = await axios.put(
      `${API_URL}${endPoint}${id}`,
      userData,
      headers
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response ? error.response.data : error.message);
  }
};

export const deleteData = async (endPoint, id) => {
  try {
    const headers = await authHeaders();
    const response = await axios.delete(`${API_URL}${endPoint}${id}`, headers);
    return response.data;
  } catch (error) {
    throw new Error(error.response ? error.response.data : error.message);
  }
};

export const patchData = async (endPoint, id, userData) => {
  try {
    const headers = await authHeaders();
    const response = await axios.patch(
      `${API_URL}${endPoint}${id}`,
      userData,
      headers
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response ? error.response.data : error.message);
  }
};
