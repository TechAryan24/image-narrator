import axios from 'axios';
import { AnalysisResponse } from '../types';

const API_BASE_URL = 'http://127.0.0.1:8000';

// --- AUTH FUNCTIONS ---

export const signupUser = async (name: string, email: string, password: string) => {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('email', email);
  formData.append('password', password);
  return axios.post(`${API_BASE_URL}/signup`, formData);
};

export const loginUser = async (email: string, password: string) => {
  const formData = new FormData();
  formData.append('username', email); // OAuth2 expects 'username'
  formData.append('password', password);
  const response = await axios.post(`${API_BASE_URL}/token`, formData);
  return response.data; // Returns { access_token: "..." }
};

export const fetchHistory = async (token: string) => {
  return axios.get(`${API_BASE_URL}/history`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const deleteHistory = async (token: string, historyId: number) => {
  return axios.delete(`${API_BASE_URL}/history/${historyId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};


export const fetchUserProfile = async (token: string) => {
  return axios.get(`${API_BASE_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Update this function signature
export const saveToHistory = async (token: string, description: string, file: File) => {
  const formData = new FormData();
  formData.append('description', description);
  formData.append('file', file); // <--- Sending the actual file now

  return axios.post(`${API_BASE_URL}/save-history`, formData, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// CHANGE 1: Update function signature to accept lang and voice
export const analyzeImage = async (
  file: File,
  lang: string,
  voice: string,
  mode: string
): Promise<AnalysisResponse> => {

  const formData = new FormData();
  formData.append('file', file);

  // CHANGE 2: Append the new fields to FormData
  formData.append('lang', lang);
  formData.append('voice', voice);
  formData.append('mode', mode); // <--- Append Mode

  const response = await axios.post(`${API_BASE_URL}/analyze`, formData, {
    responseType: 'blob',
  });

  // ... (The rest of your extraction logic remains exactly the same) ...

  // 1. Extract Description
  const descHeader = response.headers['x-ai-description'];
  const description = descHeader ? decodeURIComponent(descHeader) : "No description available.";

  // 2. Extract Objects
  const objHeader = response.headers['x-ai-detected-objects'];
  let detectedObjects: string[] = [];

  if (objHeader) {
    try {
      const jsonString = decodeURIComponent(objHeader);
      const parsed = JSON.parse(jsonString);

      if (Array.isArray(parsed)) {
        detectedObjects = parsed.map((item: any) => {
          if (typeof item === 'object' && item.object) {
            return item.object;
          }
          return item;
        });
      }
    } catch (e) {
      console.error("Failed to parse objects header", e);
    }
  }

  return {
    audioBlob: response.data,
    description,
    detectedObjects
  };
};

// function to call the export endpoint.
export const downloadBundle = async (
  file: File,
  description: string,
  objects: string[],
  lang: string,
  voice: string
) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('description', description);
  formData.append('objects', JSON.stringify(objects));
  formData.append('lang', lang);
  formData.append('voice', voice);

  const response = await axios.post(`${API_BASE_URL}/export`, formData, {
    responseType: 'blob', // Important for file download
  });

  // Trigger browser download
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'VisionVoice_Result.zip');
  document.body.appendChild(link);
  link.click();
  link.remove();
};