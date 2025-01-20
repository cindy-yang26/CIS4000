import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/assignments';

export const createAssignment = async (assignmentData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}`, assignmentData, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Assignment creation failed', error);
    throw error;
  }
};

export const fetchAssignmentInfo = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Error fetching info for assignment:', error);
    throw error;
  }
};

export const fetchAssignmentQuestions = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}/questions`, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Error fetching questions for assignment:', error);
    throw error;
  }
};

export const deleteAssignment = async (assignmentId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${assignmentId}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Failed to delete assignment', error);
    throw error;
  }
};