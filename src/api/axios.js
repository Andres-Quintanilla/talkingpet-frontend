import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const tk = localStorage.getItem('tp_token');
    if (tk) config.headers.Authorization = `Bearer ${tk}`;
    return config;
});

export default api;
