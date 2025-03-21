import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/questions';

export const fetchQuestionVariants = async (questionId, navigate) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${questionId}/variants`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch question variants.");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching question variants:", error);
    alert("Error fetching question variants.");
    return [];
  }
};

export const createQuestionVariant = async (questionId, navigate) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/${questionId}/create-variant`, {}, { withCredentials: true });

    return response.data;
  } catch (error) {
    console.error("Error creating question variant:", error);
    alert("Error creating question variant.");
    throw error;
  }
};
