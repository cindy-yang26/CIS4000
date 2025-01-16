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