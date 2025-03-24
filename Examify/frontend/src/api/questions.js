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

export const uploadImage = async (courseId, fileExt, fileContent, navigate) => {
  try {
    const response = await axios.post(
      'http://localhost:8080/api/images',
      {
        courseId,
        fileExt,
        content: fileContent
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }
    );

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
    console.error('Error uploading file to backend or creating questions:', error);
  }
};

export const deleteImage = async (imageId, navigate) => {
  try {
    const response = await axios.delete(
      `http://localhost:8080/api/images/${imageId}`,
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
        // TODO: display page telling user it doesn't have access
      }
    }
    console.error('Error uploading file to backend or creating questions:', error);
  }
};

export const uploadFileContentToBackend = async (courseId, fileContent, navigate) => {
  try {
    const response = await axios.post(
      'http://localhost:8080/api/documents',
      { content: fileContent },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
      { withCredentials: true }
    );

    console.log(response.data);

    const questionsData = response.data
      .split('===END===')
      .filter((block) => block.trim() !== '')
      .map((block) => {
        const titleMatch = block.match(/Title:\s*(.+)/i);
        const questionMatch = block.match(/Question:\s*([\s\S]+?)(?:Choices:|Correct Answer:|$)/i);
        const choicesMatch = block.match(/Choices:\s*([\s\S]+?)\s*Correct Answer:/i);
        const correctAnswerMatch = block.match(/Correct Answer:\s*(.+)/i);
        const tagsMatch = block.match(/Tags:\s*(.+)/i);
        const questionTypeMatch = block.match(/Question Type:\s*(.+)/i);

        let correctAnswer = correctAnswerMatch ? correctAnswerMatch[1].trim() : 'N/A';

        if (correctAnswer.includes('TRUE_FALSE ||')) {
          correctAnswer = correctAnswer.replace('TRUE_FALSE ||', '').trim();
        }

        return {
          courseId: courseId,
          title: titleMatch ? titleMatch[1].trim() : 'Untitled Question',
          text: questionMatch ? questionMatch[1].trim() : '',
          comment: '',
          tags:
            tagsMatch && tagsMatch[1]
              ? tagsMatch[1].split(',').map((tag) => tag.trim()).filter((tag) => tag !== '')
              : [],
          questionType: questionTypeMatch ? questionTypeMatch[1].trim() : 'essay_question',
          options:
            choicesMatch && choicesMatch[1]
              ? choicesMatch[1].split('||').map((option) => option.trim()).filter((option) => option !== '')
              : [],
          correctAnswer: correctAnswerMatch ? correctAnswerMatch[1].trim() : 'N/A',
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