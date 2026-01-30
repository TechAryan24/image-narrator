import axios from 'axios';
import { AnalysisResponse } from '../types';

// 1. Clean the URL to avoid double slashes
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://vision-voice-api.onrender.com').replace(/\/$/, "");

// 2. Create an Axios instance to centralize logic
const api = axios.create({
  baseURL: API_BASE_URL,
});

// --- AUTH FUNCTIONS ---

export const signupUser = async (name: string, email: string, password: string) => {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('email', email);
  formData.append('password', password);
  return api.post('/signup', formData);
};

export const loginUser = async (email: string, password: string) => {
  const formData = new FormData();
  formData.append('username', email);
  formData.append('password', password);
  const response = await api.post('/token', formData);
  return response.data;
};

// --- CORE FUNCTIONALITY ---

export const analyzeImage = async (
  file: File,
  lang: string,
  voice: string,
  mode: string
): Promise<AnalysisResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('lang', lang);
  formData.append('voice', voice);
  formData.append('mode', mode);

  const response = await api.post('/analyze', formData, {
    responseType: 'blob',
    // Increase timeout for Render free tier spin-up
    timeout: 60000, 
  });

  // 3. IMPORTANT: Axios lowercase headers
  // Browsers/Axios often normalize header keys to lowercase
  const descHeader = response.headers['x-ai-description'];
  const objHeader = response.headers['x-ai-detected-objects'];

  const description = descHeader ? decodeURIComponent(descHeader) : "No description available.";

  let detectedObjects: string[] = [];
  if (objHeader) {
    try {
      const parsed = JSON.parse(decodeURIComponent(objHeader));
      if (Array.isArray(parsed)) {
        detectedObjects = parsed.map((item: any) => 
          typeof item === 'object' ? (item.object || item.label) : item
        );
      }
    } catch (e) {
      console.error("Failed to parse objects", e);
    }
  }

  return {
    audioBlob: response.data,
    description,
    detectedObjects
  };
};

// --- NEW: FORGOT PASSWORD (Missing from your original snippet) ---

export const requestPasswordReset = async (email: string) => {
  return api.post('/forgot-password', { email });
};

// --- HISTORY & EXPORT ---

export const saveToHistory = async (token: string, description: string, file: File) => {
  const formData = new FormData();
  formData.append('description', description);
  formData.append('file', file);

  return api.post('/save-history', formData, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

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

  const response = await api.post('/export', formData, {
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `VisionVoice_${Date.now()}.zip`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url); // Clean up memory
};