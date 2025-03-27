import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/courses';

export const createCourse = async (courseData, navigate) => {
  try {
    const response = await axios.post(`${API_BASE_URL}`, courseData, { withCredentials: true });
    return response.data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) {
        console.log('Unauthorized: Please login');
        navigate('/');
        return null;
      } else if (error.response.status === 403) {
        // TODO: display page telling user it doesn't have access
      }
    }
    console.error("Course creation failed", error);
    throw error;
  }
};

export const fetchAllCourses = async (navigate) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/`, { withCredentials: true });
    return response.data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) {
        console.log('Unauthorized: Please login');
        navigate('/');
        return null;
      } else if (error.response.status === 403) {
        // TODO: display page telling user it doesn't have access
      }
    }
    console.error('Error fetching info for course:', error);
    throw error;
  }
}

export const getAllTags = async (courseId, navigate) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${courseId}/tags`, { withCredentials: true });
    return response.data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) {
        console.log('Unauthorized: Please login');
        navigate('/');
        return null;
      } else if (error.response.status === 403) {
        // TODO: display page telling user it doesn't have access
      }
    }
    console.error('Error fetching tags for course', error);
    throw error;
  }
}


export const fetchCourseInfo = async (id, navigate) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) {
        console.log('Unauthorized: Please login');
        navigate('/');
        return null;
      } else if (error.response.status === 403) {
        // TODO: display page telling user it doesn't have access
      }
    }
    console.error('Error fetching info for course:', error);
    throw error;
  }
};

export const fetchCourseAssignments = async (id, navigate) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}/assignments`, { withCredentials: true });
    return response.data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) {
        console.log('Unauthorized: Please login');
        navigate('/');
        return null;
      } else if (error.response.status === 403) {
        // TODO: display page telling user it doesn't have access
      }
    }
    console.error('Error fetching assignments for this course:', error);
    throw error;
  }
};

export const fetchCourseQuestions = async (id, navigate) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}/questions`, { withCredentials: true });
    return response.data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) {
        console.log('Unauthorized: Please login');
        navigate('/');
        return null;
      } else if (error.response.status === 403) {
        // TODO: display page telling user it doesn't have access
      }
    }
    console.error('Error fetching questions for course:', error);
    throw error;
  }
};

export const deleteCourse = async (id, navigate) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${id}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) {
        console.log('Unauthorized: Please login');
        navigate('/');
        return null;
      } else if (error.response.status === 403) {
        // TODO: display page telling user it doesn't have access
      }
    }
    console.error('Failed to delete course', error);
    throw error;
  }
};

export const updateCourse = async (courseId, updatedData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${courseId}/rename`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error("Failed to rename course");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating course:", error);
    throw error;
  }
};
