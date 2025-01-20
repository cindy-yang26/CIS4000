import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/questions';

export const createQuestion = async (questionData, navigate) => {
  try {
    console.log(questionData)
    const response = await axios.post(`${API_BASE_URL}`, questionData, { withCredentials: true });
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
    console.error("Question creation failed", error);
    throw error;
  }
};

export const editQuestion = async (id, questionData, navigate) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}`, questionData, { withCredentials: true });
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
    console.error("Failed to edit question", error);
    throw error;
  }
};

export const deleteQuestion = async (id, navigate) => {
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
    console.error("Failed to delete question", error);
    throw error;
  }
};

export const uploadFileContentToBackend = async (courseId, fileContent, navigate) => {
  try {
    const response = await axios.post('http://localhost:8080/api/documents', { content: fileContent }, {
      headers: {
        'Content-Type': 'application/json',
      },
    }, { withCredentials: true });

    console.log(response.data)

    const questionsData = response.data
      .split('===END===')
      .filter((block) => block.trim() !== '')
      .map((block) => {
        const titleMatch = block.match(/Title:\s*(.+)/i);
        const questionMatch = block.match(/Question:\s*([\s\S]+)/i);
        const tagsMatch = block.match(/Tags:\s*(.+)/i);
        console.log("HI: " + tagsMatch)

        return {
          courseId: courseId,
          title: titleMatch ? titleMatch[1].trim() : 'Untitled Question',
          text: questionMatch ? questionMatch[1].trim() : '',
          comment: '',
          tags: tagsMatch && tagsMatch[1]
            ? tagsMatch[1].split(',').map((tag) => tag.trim()).filter((tag) => tag !== '')
            : [],
          stats: { mean: '', median: '', stdDev: '', min: '', max: '' },
        };
      });

    console.log('Parsed Questions Data:', questionsData);

    for (const question of questionsData) {
      await createQuestion(question, navigate);
    }

    console.log('Questions created successfully');
  } catch (error) {
    console.error('Error uploading file to backend or creating questions:', error);
  }
};
