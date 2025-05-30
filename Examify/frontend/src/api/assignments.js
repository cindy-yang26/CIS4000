import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/assignments';
const CANVAS_API_BASE_URL = 'http://localhost:8080/api/canvas';

export const createAssignment = async (assignmentData, navigate) => {
  try {
    const response = await axios.post(`${API_BASE_URL}`, assignmentData, { withCredentials: true });
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
    console.error('Assignment creation failed', error);
    throw error;
  }
};

export const renameAssignment = async (id, updatedData) => {
  try {
      const response = await fetch(`${API_BASE_URL}/${id}/rename`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData)
      });

      if (!response.ok) {
          throw new Error("Failed to rename assignment");
      }

      return await response.json();
  } catch (error) {
      console.error("Error renaming assignment:", error);
      throw error;
  }
};

export const updateAssignmentQuestions = async (assignmentId, questionIds, navigate) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/${assignmentId}/update-questions`,
      { questionIds },
      { withCredentials: true }
    );

    return response.data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) {
        console.log("Unauthorized: Please login");
        navigate("/");
        return null;
      } else if (error.response.status === 403) {
        console.log("Access denied: No permission to update assignment questions");
      }
    }
    console.error("Failed to update assignment questions", error);
    throw error;
  }
};

export const fetchAssignmentInfo = async (id, navigate) => {
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
    console.error('Error fetching info for assignment:', error);
    throw error;
  }
};

export const fetchAssignmentQuestions = async (id, navigate) => {
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
    console.error('Error fetching questions for assignment:', error);
    throw error;
  }
};

export const deleteAssignment = async (assignmentId, navigate) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${assignmentId}`, { withCredentials: true });
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
    console.error('Failed to delete assignment', error);
    throw error;
  }
};

export const uploadAssignmentToCanvas = async (courseId, assignmentName, assignmentId, navigate) => {
  try {
    const response = await axios.post(
      `${CANVAS_API_BASE_URL}/upload`,
      {
        courseId,
        name: assignmentName,
        assignmentId
      },
      { withCredentials: true }
    );

    return response.data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) {
        console.log('Unauthorized: Please login');
        navigate('/');
        return null;
      } else if (error.response.status === 403) {
        console.log('Access denied: No permission to upload');
      }
    }
    console.error('Failed to upload assignment to Canvas', error);
    throw error;
  }
};

export const downloadLatex = async (assignmentId, navigate) => {
  try {
    const response = await axios.get(
      `http://localhost:8080/latex/default_template/${assignmentId}`, //TODO need to add option to change template
      { 
        withCredentials: true,
        responseType: 'arraybuffer'
      }
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('Unauthorized: Please login');
      navigate('/');
      return null;
    }
    console.error('Failed to download LaTeX', error);
    throw error;
  }
};

export const downloadDocs = async (assignmentId, navigate) => {
  try {
    const response = await axios.get(
      `http://localhost:8080/latex/default_template/${assignmentId}/docs`,
      { 
        withCredentials: true,
        responseType: 'blob'  // Important: Use blob for binary data
      }
    );
    
    // Create a blob URL and trigger download
    const blob = new Blob([response.data], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `assignment_${assignmentId}.docx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('Unauthorized: Please login');
      navigate('/');
      return null;
    }
    console.error('Failed to download DOCX', error);
    throw error;
  }
};