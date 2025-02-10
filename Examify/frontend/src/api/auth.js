import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/auth';

export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, {
      username,
      password,
    }, { withCredentials: true });

    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Login failed", error);
    throw error;
  }
};

export const signup = async (username, email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/signup`, { username, email, password },
      { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error("Signup failed", error);
    if (error.response) {
      throw new Error(error.response.data);
    } else {
      throw error;
    }
  }
};

export const logout = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/logout`, {},
      { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error("Logout failed", error);
    throw error;
  }
}
