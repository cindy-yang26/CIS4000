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

export const fetchQuestions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}`);
      return response.data;
    } catch (error) {
      console.error("Fetching questions failed", error);
      throw error;
    }
  };
