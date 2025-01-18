import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/questions';

export const createQuestion = async (questionData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}`, questionData);
    return response.data;
  } catch (error) {
    console.error("Question creation failed", error);
    throw error;
  }
};

export const editQuestion = async (id, questionData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}`, questionData);
    return response.data;
  } catch (error) {
    console.error("Failed to edit question", error);
    throw error;
  }
};

export const deleteQuestion = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Failed to delete question", error);
    throw error;
  }
};
