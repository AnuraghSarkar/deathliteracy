import axios from 'axios';

// Create an axios instance with baseURL and auth header
const API = axios.create({
  baseURL: 'http://localhost:5001/api'
});

// Add auth token to all requests
API.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo'))
      : null;
    
    if (userInfo?.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Question Management
export const getQuestions = async () => {
  try {
    const response = await API.get('/questions');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch questions');
  }
};

export const getQuestionById = async (id) => {
  try {
    const response = await API.get(`/questions/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch question');
  }
};

export const createQuestion = async (questionData) => {
  try {
    const response = await API.post('/questions', questionData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create question');
  }
};

export const updateQuestion = async (id, questionData) => {
  try {
    const response = await API.put(`/questions/${id}`, questionData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update question');
  }
};

export const deleteQuestion = async (id) => {
  try {
    const response = await API.delete(`/questions/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete question');
  }
};

// Dashboard stats
export const getDashboardStats = async () => {
  try {
    const response = await API.get('/admin/dashboard');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch dashboard stats');
  }
};

// Admin user management
export const getUsers = async () => {
  try {
    const response = await API.get('/admin/users');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch users');
  }
};

// Reports
export const generateReport = async (reportType, dateRange) => {
  try {
    const response = await API.get('/admin/reports', { 
      params: { type: reportType, dateRange } 
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to generate report');
  }
};

// Create the service object
const adminService = {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getDashboardStats,
  getUsers,
  generateReport
};

// Export the service
export default adminService;