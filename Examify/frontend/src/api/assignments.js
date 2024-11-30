import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/assignments';

export const createAssignment = async (assignmentData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}`, assignmentData);
    return response.data;
  } catch (error) {
    console.error('Assignment creation failed', error);
    throw error;
  }
};

export const fetchAllAssignments = async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch assignments", error);
      throw error;
    }
  };

  export const fetchAssignmentQuestions = async (name) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${name}/questions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching questions for assignment:', error);
      throw error;
    }
  };

  export const deleteAssignment = async (assignmentId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${assignmentId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete assignment', error);
      throw error;
    }
  };
  
  

