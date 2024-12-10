import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/auth';

export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, {username, password});
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Login failed", error);
    throw error;
  }
};

export const signup = async (username, email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/signup`, { username, email, password});
    // const response = await axios.post(`${API_BASE_URL}/signup`, {
    //   username: {username}, 
    //   email: {email}, 
    //   password: {password}
    // });
    return response.data;
  } catch (error) {
    console.error("Signup failed", error);
    throw error;
  }
};
