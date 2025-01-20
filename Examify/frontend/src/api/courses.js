import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/courses';

export const createCourse = async (courseData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}`, courseData, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error("Course creation failed", error);
    throw error;
  }
};

export const fetchAllCourses = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/`, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Error fetching info for course:', error);
    throw error;
  }
}

export const fetchCourseInfo = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Error fetching info for course:', error);
    throw error;
  }
};

export const fetchCourseAssignments = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}/assignments`, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Error fetching assignments for this course:', error);
    throw error;
  }
};

export const fetchCourseQuestions = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}/questions`, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Error fetching questions for course:', error);
    throw error;
  }
};

export const deleteCourse = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${id}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Failed to delete course', error);
    throw error;
  }
};