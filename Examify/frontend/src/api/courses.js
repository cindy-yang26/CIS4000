import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/courses';

export const createCourse = async (courseData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}`, courseData);
    return response.data;
  } catch (error) {
    console.error("Course creation failed", error);
    throw error;
  }
};

export const fetchCourseInfo = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching info for course:', error);
    throw error;
  }
};

export const fetchCourseAssignments = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}/assignments`);
    return response.data;
  } catch (error) {
    console.error('Error fetching assignments for this course:', error);
    throw error;
  }
};

export const deleteCourse = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete course', error);
    throw error;
  }
};