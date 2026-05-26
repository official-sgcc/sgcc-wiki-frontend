import axios from 'axios';
//import { Cookies } from 'react-cookie';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_SERVER_URL || 'http://localhost:8000';
const TOKEN_KEY = 'token';
//const cookies = new Cookies();

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem(TOKEN_KEY);

        if (token) {
            config.headers.auth = token;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
