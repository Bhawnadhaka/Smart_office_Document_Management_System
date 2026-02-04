import axios from 'axios';

const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Documents
export const getDocuments = async () => {
  const response = await api.get('/documents');
  return response.data.data;
};

export const getDocument = async (id) => {
  const response = await api.get(`/documents/${id}`);
  return response.data.data;
};

export const createDocument = async (data) => {
  const response = await api.post('/documents', data);
  return response.data.data;
};

export const updateDocument = async (id, data) => {
  const response = await api.put(`/documents/${id}`, data);
  return response.data.data;
};

export const deleteDocument = async (id) => {
  const response = await api.delete(`/documents/${id}`);
  return response.data;
};

// Templates
export const getTemplates = async (category = null) => {
  const response = await api.get('/templates', {
    params: { category }
  });
  return response.data.data;
};

export const getTemplate = async (id) => {
  const response = await api.get(`/templates/${id}`);
  return response.data.data;
};

// Voice & AI
export const transcribeVoice = async (text, documentId = null) => {
  const response = await api.post('/voice/transcribe', { text, documentId });
  return response.data.data;
};

export const enhanceText = async (content, type = 'grammar') => {
  const response = await api.post('/voice/enhance', { content, type });
  return response.data.data;
};

export const generateDocument = async (prompt, templateId = null) => {
  const response = await api.post('/voice/generate', { prompt, templateId });
  return response.data.data;
};

export default api;
